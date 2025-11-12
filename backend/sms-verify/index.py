'''
Business: Проверка SMS-кода и авторизация клиента
Args: event с httpMethod, queryStringParameters (phone, code)
Returns: HTTP response с success и данными клиента
'''

import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method not in ['GET', 'POST']:
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'Method not allowed'})
        }
    
    params = event.get('queryStringParameters') or {}
    phone = params.get('phone', '').strip()
    code = params.get('code', '').strip()
    
    if not phone or not code:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'Укажите телефон и код'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    
    try:
        conn = psycopg2.connect(dsn)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute(
            """
            SELECT code, expires_at > NOW() as is_valid 
            FROM t_p14771149_mfo_client_cabinet.sms_codes 
            WHERE phone = %s
            """,
            (phone,)
        )
        sms_record = cur.fetchone()
        
        if not sms_record:
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'error': 'SMS-код не найден. Запросите новый код'})
            }
        
        if not sms_record['is_valid']:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'error': 'SMS-код истёк. Запросите новый код'})
            }
        
        if sms_record['code'] != code:
            cur.close()
            conn.close()
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'error': 'Неверный SMS-код'})
            }
        
        cur.execute(
            """
            SELECT id, phone, full_name, last_name, first_name, middle_name, 
                   birth_date, passport_series, passport_number
            FROM t_p14771149_mfo_client_cabinet.clients 
            WHERE phone = %s
            """,
            (phone,)
        )
        client = cur.fetchone()
        
        if not client:
            cur.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'needsRegistration': True,
                    'phone': phone
                })
            }
        
        cur.execute(
            "DELETE FROM t_p14771149_mfo_client_cabinet.sms_codes WHERE phone = %s",
            (phone,)
        )
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'needsRegistration': False,
                'client': {
                    'id': client['id'],
                    'phone': client['phone'],
                    'fullName': client['full_name'],
                    'lastName': client['last_name'],
                    'firstName': client['first_name'],
                    'middleName': client['middle_name'],
                    'birthDate': client['birth_date'],
                    'passportSeries': client['passport_series'],
                    'passportNumber': client['passport_number']
                }
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': str(e)})
        }
