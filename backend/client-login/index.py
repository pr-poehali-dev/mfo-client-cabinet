'''
Business: Авторизация клиента по номеру телефона из AmoCRM
Args: event - dict с httpMethod, body (phone)
      context - объект с request_id, function_name
Returns: HTTP response с client_id и токеном
'''

import json
import psycopg2
import os
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'Method not allowed'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    phone = body_data.get('phone', '').strip()
    
    if not phone:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'Номер телефона обязателен'})
        }
    
    # Нормализация номера телефона (приводим к формату +7XXXXXXXXXX)
    clean_phone = ''.join(filter(str.isdigit, phone))
    if clean_phone.startswith('8'):
        clean_phone = '7' + clean_phone[1:]
    if not clean_phone.startswith('7'):
        clean_phone = '7' + clean_phone
    normalized_phone = '+' + clean_phone
    
    dsn = os.environ.get('DATABASE_URL')
    
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    # Ищем клиента по номеру телефона в AmoCRM таблице
    cur.execute("""
        SELECT id, name, phone 
        FROM t_p14771149_mfo_client_cabinet.amocrm_clients 
        WHERE phone = %s
    """, (normalized_phone,))
    
    client = cur.fetchone()
    
    if not client:
        cur.close()
        conn.close()
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'Клиент не найден'})
        }
    
    client_id, client_name, client_phone = client
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({
            'success': True,
            'client': {
                'id': client_id,
                'name': client_name,
                'phone': client_phone
            }
        })
    }