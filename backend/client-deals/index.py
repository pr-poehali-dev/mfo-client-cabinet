import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Get client deals by phone number
    Args: event - dict with httpMethod, queryStringParameters (phone)
    Returns: HTTP response with deals list
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    params = event.get('queryStringParameters', {})
    phone = params.get('phone', '').strip()
    
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
    
    # Находим client_id по номеру телефона
    cur.execute(
        "SELECT id FROM t_p14771149_mfo_client_cabinet.amocrm_clients WHERE phone = %s",
        (normalized_phone,)
    )
    client_row = cur.fetchone()
    
    if not client_row:
        # Клиент не найден - возвращаем пустой список
        cur.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'deals': []}),
            'isBase64Encoded': False
        }
    
    client_id = client_row[0]
    
    # Получаем все сделки клиента
    cur.execute(
        """SELECT id, name, price, status, status_id, status_name, status_color, 
                  pipeline_id, pipeline_name, created_at, updated_at, custom_fields 
           FROM t_p14771149_mfo_client_cabinet.amocrm_deals 
           WHERE client_id = %s 
           ORDER BY created_at DESC""",
        (client_id,)
    )
    
    deals = []
    for row in cur.fetchall():
        deal = {
            'id': str(row[0]),
            'name': row[1],
            'price': float(row[2]) if row[2] else 0,
            'status': row[3],
            'status_id': row[4],
            'status_name': row[5],
            'status_color': row[6],
            'pipeline_id': row[7],
            'pipeline_name': row[8],
            'created_at': row[9].isoformat() if row[9] else None,
            'updated_at': row[10].isoformat() if row[10] else None,
            'custom_fields': row[11] if row[11] else {}
        }
        deals.append(deal)
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'deals': deals}),
        'isBase64Encoded': False
    }