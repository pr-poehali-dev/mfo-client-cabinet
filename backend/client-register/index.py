'''
Business: Регистрация нового клиента с телефоном и паролем
Args: event с httpMethod, body (phone, password, full_name, email)
Returns: HTTP response с success и client_id
'''

import json
import os
import hashlib
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def hash_password(password: str) -> str:
    '''Хеширует пароль с солью'''
    return hashlib.sha256(password.encode()).hexdigest()

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'POST')
    
    # Handle CORS OPTIONS request
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
    password = body_data.get('password', '').strip()
    full_name = body_data.get('full_name', '').strip()
    email = body_data.get('email', '').strip()
    
    if not phone or not password or not full_name:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'Телефон, пароль и ФИО обязательны'})
        }
    
    if len(password) < 4:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'Пароль должен быть минимум 4 символа'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    
    try:
        conn = psycopg2.connect(dsn)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Проверяем, существует ли клиент
        cur.execute(
            "SELECT id FROM t_p14771149_mfo_client_cabinet.clients WHERE phone = %s",
            (phone,)
        )
        existing = cur.fetchone()
        
        if existing:
            cur.close()
            conn.close()
            return {
                'statusCode': 409,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'error': 'Клиент с таким телефоном уже существует'})
            }
        
        # Создаём клиента
        password_hash = hash_password(password)
        
        cur.execute(
            """
            INSERT INTO t_p14771149_mfo_client_cabinet.clients 
            (phone, password_hash, full_name, email, created_at, updated_at) 
            VALUES (%s, %s, %s, %s, NOW(), NOW())
            RETURNING id
            """,
            (phone, password_hash, full_name, email if email else None)
        )
        
        result = cur.fetchone()
        client_id = result['id']
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'client_id': client_id,
                'phone': phone,
                'full_name': full_name
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': str(e)})
        }
