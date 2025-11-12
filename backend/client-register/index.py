'''
Business: Регистрация нового клиента с паспортными данными
Args: event с httpMethod, body (lastName, firstName, middleName, birthDate, passportSeries, passportNumber, phone)
Returns: HTTP response с success и client данными
'''

import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
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
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'Method not allowed'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    
    last_name = body_data.get('lastName', '').strip()
    first_name = body_data.get('firstName', '').strip()
    middle_name = body_data.get('middleName', '').strip()
    birth_date = body_data.get('birthDate', '').strip()
    passport_series = body_data.get('passportSeries', '').strip()
    passport_number = body_data.get('passportNumber', '').strip()
    phone = body_data.get('phone', '').strip()
    
    if not all([last_name, first_name, birth_date, passport_series, passport_number]):
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'Заполните все обязательные поля'})
        }
    
    if len(passport_series) != 4 or len(passport_number) != 6:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'Неверный формат паспортных данных'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    full_name = f"{last_name} {first_name} {middle_name}".strip()
    
    try:
        conn = psycopg2.connect(dsn)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute(
            "SELECT id FROM t_p14771149_mfo_client_cabinet.clients WHERE passport_series = %s AND passport_number = %s",
            (passport_series, passport_number)
        )
        existing = cur.fetchone()
        
        if existing:
            cur.close()
            conn.close()
            return {
                'statusCode': 409,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'error': 'Клиент с такими паспортными данными уже существует'})
            }
        
        cur.execute(
            """
            INSERT INTO t_p14771149_mfo_client_cabinet.clients 
            (phone, full_name, last_name, first_name, middle_name, birth_date, passport_series, passport_number, created_at, updated_at) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            RETURNING id
            """,
            (phone, full_name, last_name, first_name, middle_name, birth_date, passport_series, passport_number)
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
                'client': {
                    'id': client_id,
                    'fullName': full_name,
                    'lastName': last_name,
                    'firstName': first_name,
                    'middleName': middle_name,
                    'birthDate': birth_date,
                    'passportSeries': passport_series,
                    'passportNumber': passport_number,
                    'phone': phone
                }
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': str(e)})
        }