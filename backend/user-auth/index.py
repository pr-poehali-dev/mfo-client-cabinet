import json
import os
import psycopg2
import hashlib
import requests
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: User registration and authentication (login by phone or email+password)
    Args: event with httpMethod, body with user data or login credentials
          context with request_id
    Returns: HTTP response with user data or error
    '''
    method: str = event.get('httpMethod', 'POST')
    path = event.get('path', '/')
    
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
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    action = body_data.get('action', 'login')
    
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database connection not configured'})
        }
    
    if action == 'register':
        return handle_register(body_data, database_url)
    else:
        return handle_login(body_data, database_url)


def handle_register(body_data: Dict[str, Any], database_url: str) -> Dict[str, Any]:
    first_name = body_data.get('firstName', '').strip()
    last_name = body_data.get('lastName', '').strip()
    middle_name = body_data.get('middleName', '').strip()
    passport_series = body_data.get('passportSeries', '').strip()
    passport_number = body_data.get('passportNumber', '').strip()
    phone = body_data.get('phone', '').strip()
    email = body_data.get('email', '').strip()
    password = body_data.get('password', '')
    
    if not all([first_name, last_name, passport_series, passport_number, phone, email, password]):
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Все обязательные поля должны быть заполнены'})
        }
    
    if len(passport_series) != 4 or len(passport_number) != 6:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Неверный формат серии или номера паспорта'})
        }
    
    if len(phone) != 11:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Неверный формат номера телефона'})
        }
    
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    conn = None
    amocrm_contact_id = None
    
    try:
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        cur.execute("SELECT id FROM users WHERE phone = %s OR email = %s", (phone, email))
        existing_user = cur.fetchone()
        
        if existing_user:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Пользователь с таким телефоном или email уже существует'})
            }
        
        access_token = os.environ.get('ACCESS_TOKEN')
        amocrm_domain = os.environ.get('AMOCRM_DOMAIN')
        
        if access_token and amocrm_domain:
            try:
                full_name = f"{last_name} {first_name}"
                if middle_name:
                    full_name += f" {middle_name}"
                
                amocrm_url = f"https://{amocrm_domain}/api/v4/contacts"
                headers = {
                    'Authorization': f'Bearer {access_token}',
                    'Content-Type': 'application/json'
                }
                
                contact_data = {
                    'name': full_name,
                    'custom_fields_values': [
                        {
                            'field_code': 'PHONE',
                            'values': [{'value': phone, 'enum_code': 'WORK'}]
                        },
                        {
                            'field_code': 'EMAIL',
                            'values': [{'value': email, 'enum_code': 'WORK'}]
                        }
                    ]
                }
                
                amocrm_response = requests.post(amocrm_url, headers=headers, json=[contact_data], timeout=10)
                
                if amocrm_response.status_code == 200:
                    response_data = amocrm_response.json()
                    if '_embedded' in response_data and 'contacts' in response_data['_embedded']:
                        amocrm_contact_id = str(response_data['_embedded']['contacts'][0]['id'])
                
            except Exception as amocrm_error:
                print(f"AmoCRM sync warning: {amocrm_error}")
        
        cur.execute(
            """
            INSERT INTO users (phone, email, password_hash, first_name, last_name, middle_name, 
                             passport_series, passport_number, amocrm_contact_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
            """,
            (phone, email, password_hash, first_name, last_name, middle_name or None,
             passport_series, passport_number, amocrm_contact_id)
        )
        
        user_id = cur.fetchone()[0]
        conn.commit()
        
        full_name = f"{last_name} {first_name}"
        if middle_name:
            full_name += f" {middle_name}"
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({
                'id': user_id,
                'phone': phone,
                'email': email,
                'name': full_name,
                'amocrm_synced': amocrm_contact_id is not None
            })
        }
        
    except Exception as e:
        if conn:
            conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка регистрации: {str(e)}'})
        }
    finally:
        if conn:
            conn.close()


def handle_login(body_data: Dict[str, Any], database_url: str) -> Dict[str, Any]:
    phone = body_data.get('phone', '').strip()
    email = body_data.get('email', '').strip()
    password = body_data.get('password', '')
    
    conn = None
    
    try:
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        if phone and not password:
            cur.execute(
                """
                SELECT id, phone, email, first_name, last_name, middle_name 
                FROM users 
                WHERE phone = %s
                """,
                (phone,)
            )
            user = cur.fetchone()
            
            if not user:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Пользователь не найден. Пожалуйста, зарегистрируйтесь'})
                }
            
            user_id, user_phone, user_email, first_name, last_name, middle_name = user
            
            full_name = f"{last_name} {first_name}"
            if middle_name:
                full_name += f" {middle_name}"
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({
                    'id': user_id,
                    'phone': user_phone,
                    'email': user_email or '',
                    'name': full_name
                })
            }
        
        elif email and password:
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            
            cur.execute(
                """
                SELECT id, phone, email, first_name, last_name, middle_name 
                FROM users 
                WHERE email = %s AND password_hash = %s
                """,
                (email, password_hash)
            )
            user = cur.fetchone()
            
            if not user:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неверный email или пароль'})
                }
            
            user_id, user_phone, user_email, first_name, last_name, middle_name = user
            
            full_name = f"{last_name} {first_name}"
            if middle_name:
                full_name += f" {middle_name}"
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({
                    'id': user_id,
                    'phone': user_phone,
                    'email': user_email,
                    'name': full_name
                })
            }
        
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Укажите телефон или email с паролем'})
            }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка входа: {str(e)}'})
        }
    finally:
        if conn:
            conn.close()
