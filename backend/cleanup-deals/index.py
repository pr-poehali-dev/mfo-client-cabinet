import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Clean up test deals, keep only one deal per client
    Args: event - dict with httpMethod
    Returns: HTTP response with cleanup results
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
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
    
    # Получаем количество заявок до очистки
    cur.execute("SELECT COUNT(*) FROM t_p14771149_mfo_client_cabinet.amocrm_deals")
    deals_before = cur.fetchone()[0]
    
    # Удаляем все заявки кроме последней для каждого клиента
    cur.execute("""
        DELETE FROM t_p14771149_mfo_client_cabinet.amocrm_deals
        WHERE id NOT IN (
            SELECT MAX(id) 
            FROM t_p14771149_mfo_client_cabinet.amocrm_deals 
            GROUP BY client_id
        )
    """)
    
    deleted_deals = cur.rowcount
    
    # Получаем количество заявок после очистки
    cur.execute("SELECT COUNT(*) FROM t_p14771149_mfo_client_cabinet.amocrm_deals")
    deals_after = cur.fetchone()[0]
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'success': True,
            'deals_before': deals_before,
            'deals_after': deals_after,
            'deleted_deals': deleted_deals,
            'message': f'Удалено {deleted_deals} заявок. Осталось {deals_after} заявок (по 1 на клиента).'
        }),
        'isBase64Encoded': False
    }
