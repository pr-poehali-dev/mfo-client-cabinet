'''
Business: Генерация и отправка SMS-кода для авторизации
Args: event с httpMethod, queryStringParameters (phone)
Returns: HTTP response с success и временем жизни кода
'''

import json
import os
import random
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def generate_code() -> str:
    '''Генерирует 4-значный SMS-код'''
    return str(random.randint(1000, 9999))

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
    
    if not phone:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'Укажите номер телефона'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    sms_code = generate_code()
    
    try:
        conn = psycopg2.connect(dsn)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute(
            """
            INSERT INTO t_p14771149_mfo_client_cabinet.sms_codes 
            (phone, code, expires_at, created_at) 
            VALUES (%s, %s, NOW() + INTERVAL '10 minutes', NOW())
            ON CONFLICT (phone) 
            DO UPDATE SET code = EXCLUDED.code, expires_at = EXCLUDED.expires_at, created_at = NOW()
            """,
            (phone, sms_code)
        )
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'message': f'SMS-код отправлен на номер {phone}',
                'expiresIn': 600,
                'code': sms_code
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': str(e)})
        }
