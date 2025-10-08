import json
import os
import psycopg2
from typing import Dict, Any
from datetime import datetime

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Client authentication by phone number
    Args: event - dict with httpMethod, body (phone, name)
    Returns: HTTP response with client data or error
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body = event.get('body', '')
    if not body:
        body = '{}'
    try:
        body_data = json.loads(body)
    except (json.JSONDecodeError, ValueError):
        body_data = {}
    phone = body_data.get('phone', '').strip()
    name = body_data.get('name', '').strip()
    
    if not phone:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Phone number is required'}),
            'isBase64Encoded': False
        }
    
    # Нормализуем телефон: убираем все кроме цифр, добавляем +
    clean_phone = ''.join(filter(str.isdigit, phone))
    if clean_phone.startswith('8'):
        clean_phone = '7' + clean_phone[1:]
    if not clean_phone.startswith('7'):
        clean_phone = '7' + clean_phone
    normalized_phone = '+' + clean_phone
    
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database not configured'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    
    # Проверяем, существует ли клиент в amocrm_clients
    cur.execute(
        "SELECT id, phone, name, first_name, last_name, middle_name, email FROM t_p14771149_mfo_client_cabinet.amocrm_clients WHERE phone = %s",
        (normalized_phone,)
    )
    client = cur.fetchone()
    
    if client:
        # Клиент найден в AmoCRM
        result = {
            'success': True,
            'client': {
                'id': str(client[0]),
                'phone': client[1],
                'name': client[2] or name,
                'first_name': client[3] or '',
                'last_name': client[4] or '',
                'middle_name': client[5] or '',
                'email': client[6] or ''
            },
            'isNewRegistration': False
        }
    else:
        # Новый клиент - проверяем в clients или создаём
        cur.execute(
            "SELECT id, full_name FROM t_p14771149_mfo_client_cabinet.clients WHERE phone = %s",
            (normalized_phone,)
        )
        existing_client = cur.fetchone()
        
        if existing_client:
            client_id = existing_client[0]
            client_name = existing_client[1] or name
        else:
            cur.execute(
                """INSERT INTO t_p14771149_mfo_client_cabinet.clients 
                   (phone, full_name, first_name, last_name, middle_name, email, created_at, updated_at) 
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s) 
                   RETURNING id""",
                (normalized_phone, name, '', '', '', '', datetime.now(), datetime.now())
            )
            client_id = cur.fetchone()[0]
            client_name = name
            conn.commit()
        
        result = {
            'success': True,
            'client': {
                'id': str(client_id),
                'phone': phone,
                'name': client_name,
                'first_name': '',
                'last_name': '',
                'middle_name': '',
                'email': ''
            },
            'isNewRegistration': True
        }
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps(result),
        'isBase64Encoded': False
    }