import json
import os
import psycopg2
from typing import Dict, Any, Optional
from datetime import datetime

def get_db_connection():
    '''Создает подключение к базе данных'''
    database_url = os.environ.get('DATABASE_URL', '')
    if not database_url:
        raise Exception('DATABASE_URL not configured')
    return psycopg2.connect(database_url)

def get_client_limit(phone: str) -> Optional[Dict[str, Any]]:
    '''
    Получает лимит клиента по номеру телефона
    Args: phone - номер телефона клиента
    Returns: Dict с информацией о лимите или None
    '''
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        
        query = '''
            SELECT 
                c.id, c.phone, c.full_name,
                cl.max_loan_amount, cl.current_debt, cl.available_limit,
                cl.credit_rating, cl.is_blocked, cl.blocked_reason
            FROM t_p14771149_mfo_client_cabinet.clients c
            LEFT JOIN t_p14771149_mfo_client_cabinet.client_limits cl ON c.id = cl.client_id
            WHERE c.phone = %s
        '''
        
        cursor.execute(query, (phone,))
        row = cursor.fetchone()
        
        if not row:
            return None
        
        return {
            'client_id': row[0],
            'phone': row[1],
            'full_name': row[2],
            'max_loan_amount': float(row[3]) if row[3] else 100000.00,
            'current_debt': float(row[4]) if row[4] else 0.00,
            'available_limit': float(row[5]) if row[5] else 100000.00,
            'credit_rating': row[6] or 'good',
            'is_blocked': row[7] or False,
            'blocked_reason': row[8]
        }
    finally:
        conn.close()

def create_or_update_client_limit(phone: str, full_name: str = '', 
                                   max_amount: float = 100000.00,
                                   current_debt: float = 0.00) -> Dict[str, Any]:
    '''
    Создает или обновляет лимит клиента
    Args: phone, full_name, max_amount, current_debt
    Returns: Dict с обновленными данными
    '''
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        
        cursor.execute(
            '''INSERT INTO t_p14771149_mfo_client_cabinet.clients (phone, full_name)
               VALUES (%s, %s)
               ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
               RETURNING id''',
            (phone, full_name)
        )
        client_id = cursor.fetchone()[0]
        
        available = max_amount - current_debt
        
        cursor.execute(
            '''INSERT INTO t_p14771149_mfo_client_cabinet.client_limits 
               (client_id, max_loan_amount, current_debt, available_limit)
               VALUES (%s, %s, %s, %s)
               ON CONFLICT (client_id) DO UPDATE SET
                   max_loan_amount = EXCLUDED.max_loan_amount,
                   current_debt = EXCLUDED.current_debt,
                   available_limit = EXCLUDED.available_limit,
                   updated_at = CURRENT_TIMESTAMP''',
            (client_id, max_amount, current_debt, available)
        )
        
        conn.commit()
        
        return {
            'client_id': client_id,
            'phone': phone,
            'max_loan_amount': max_amount,
            'current_debt': current_debt,
            'available_limit': available,
            'message': 'Лимит успешно обновлен'
        }
    finally:
        conn.close()

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Управление лимитами клиентов - получение и обновление доступных сумм займов
    Args: event с httpMethod, queryStringParameters (phone), body (для POST/PUT)
    Returns: JSON с информацией о лимите клиента
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            phone = params.get('phone', '')
            
            if not phone:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Phone parameter required'}),
                    'isBase64Encoded': False
                }
            
            limit_data = get_client_limit(phone)
            
            if not limit_data:
                return {
                    'statusCode': 404,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'error': 'Client not found',
                        'phone': phone
                    }),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(limit_data),
                'isBase64Encoded': False
            }
        
        if method in ['POST', 'PUT']:
            body_data = json.loads(event.get('body', '{}'))
            phone = body_data.get('phone', '')
            full_name = body_data.get('full_name', '')
            max_amount = float(body_data.get('max_loan_amount', 100000.00))
            current_debt = float(body_data.get('current_debt', 0.00))
            
            if not phone:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Phone is required'}),
                    'isBase64Encoded': False
                }
            
            result = create_or_update_client_limit(phone, full_name, max_amount, current_debt)
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f'[ERROR] {str(e)}')
        import traceback
        print(traceback.format_exc())
        
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': str(e),
                'type': type(e).__name__
            }),
            'isBase64Encoded': False
        }
