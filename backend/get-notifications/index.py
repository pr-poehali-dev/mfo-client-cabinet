"""
Business: Возвращает непрочитанные уведомления для клиента
Args: event - dict с httpMethod GET, queryStringParameters с phone
      context - object с атрибутами request_id, function_name  
Returns: HTTP response с массивом уведомлений
"""

import json
import os
from typing import Dict, Any, List
from datetime import datetime

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
except ImportError:
    psycopg2 = None

def get_db_connection():
    '''Создает подключение к БД'''
    if psycopg2 is None:
        raise Exception('psycopg2 module not available')
    dsn = os.environ.get('DATABASE_URL', '')
    if not dsn:
        raise Exception('DATABASE_URL not configured')
    return psycopg2.connect(dsn)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method == 'GET':
        try:
            params = event.get('queryStringParameters', {})
            phone = params.get('phone', '')
            
            if not phone:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Phone parameter required'})
                }
            
            conn = get_db_connection()
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            # Получаем ID клиента по телефону
            cursor.execute("SELECT id FROM amocrm_clients WHERE phone = %s LIMIT 1", (phone,))
            client = cursor.fetchone()
            
            if not client:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'notifications': []})
                }
            
            client_id = client['id']
            
            # Получаем непрочитанные уведомления
            cursor.execute('''
                SELECT 
                    wn.id,
                    wn.lead_id,
                    wn.new_status_id,
                    wn.old_status_id,
                    wn.created_at,
                    d.name as deal_name,
                    d.status_name as new_status_name,
                    d.price
                FROM webhook_notifications wn
                JOIN amocrm_deals d ON d.id = wn.lead_id
                WHERE d.client_id = %s AND wn.delivered = FALSE
                ORDER BY wn.created_at DESC
                LIMIT 10
            ''', (client_id,))
            
            notifications = cursor.fetchall()
            
            # Отмечаем уведомления как доставленные
            if notifications:
                notification_ids = [n['id'] for n in notifications]
                cursor.execute(
                    "UPDATE webhook_notifications SET delivered = TRUE WHERE id = ANY(%s)",
                    (notification_ids,)
                )
                conn.commit()
            
            cursor.close()
            conn.close()
            
            result = []
            for n in notifications:
                result.append({
                    'id': n['id'],
                    'lead_id': n['lead_id'],
                    'deal_name': n['deal_name'],
                    'new_status': n['new_status_name'],
                    'price': n['price'],
                    'created_at': n['created_at'].isoformat() if n['created_at'] else None
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'notifications': result})
            }
            
        except Exception as e:
            print(f'[ERROR] Failed to get notifications: {str(e)}')
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': str(e)})
            }
    
    if method == 'POST':
        # Помечаем уведомления как прочитанные
        try:
            body_data = json.loads(event.get('body', '{}'))
            notification_ids = body_data.get('ids', [])
            
            if not notification_ids:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Notification IDs required'})
                }
            
            conn = get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute(
                "UPDATE webhook_notifications SET delivered = TRUE WHERE id = ANY(%s)",
                (notification_ids,)
            )
            
            conn.commit()
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True})
            }
            
        except Exception as e:
            print(f'[ERROR] Failed to mark as read: {str(e)}')
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': str(e)})
            }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }
