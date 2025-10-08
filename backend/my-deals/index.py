'''
Business: Получение списка заявок клиента по client_id
Args: event - dict с httpMethod, queryStringParameters (client_id)
      context - объект с request_id, function_name
Returns: HTTP response со списком заявок только этого клиента
'''

import json
import psycopg2
import os
from typing import Dict, Any, List

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'Method not allowed'})
        }
    
    params = event.get('queryStringParameters') or {}
    client_id = params.get('client_id')
    
    if not client_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'client_id обязателен'})
        }
    
    try:
        client_id = int(client_id)
    except ValueError:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'Неверный client_id'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    # Получаем только заявки этого клиента
    cur.execute("""
        SELECT 
            d.id,
            d.amocrm_id,
            d.name,
            d.price,
            d.status,
            d.created_at,
            c.name as client_name,
            c.phone as client_phone
        FROM deals d
        JOIN clients c ON d.client_id = c.id
        WHERE d.client_id = %s
        ORDER BY d.created_at DESC
    """, (client_id,))
    
    deals_data = cur.fetchall()
    
    deals: List[Dict[str, Any]] = []
    for row in deals_data:
        deals.append({
            'id': row[0],
            'amocrm_id': row[1],
            'name': row[2],
            'price': row[3],
            'status': row[4],
            'created_at': row[5].isoformat() if row[5] else None,
            'client_name': row[6],
            'client_phone': row[7]
        })
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({
            'success': True,
            'deals': deals,
            'total': len(deals)
        })
    }
