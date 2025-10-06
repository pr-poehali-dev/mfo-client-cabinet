import json
import os
from typing import Dict, Any, Optional
import urllib.request
import urllib.error
from datetime import datetime, timedelta

def get_access_token() -> str:
    """
    Business: Получает access_token для amoCRM (поддерживает долгосрочные токены и OAuth)
    Returns: Access token string
    """
    long_lived_token = os.environ.get('AMOCRM_ACCESS_TOKEN')
    
    if long_lived_token:
        return long_lived_token
    
    domain = os.environ.get('AMOCRM_DOMAIN')
    client_id = os.environ.get('AMOCRM_CLIENT_ID')
    client_secret = os.environ.get('AMOCRM_CLIENT_SECRET')
    refresh_token = os.environ.get('AMOCRM_REFRESH_TOKEN')
    redirect_uri = os.environ.get('AMOCRM_REDIRECT_URI')
    
    if not all([domain, client_id, client_secret, refresh_token, redirect_uri]):
        raise ValueError('AmoCRM credentials not configured: set AMOCRM_ACCESS_TOKEN or OAuth credentials')
    
    url = f'https://{domain}/oauth2/access_token'
    data = {
        'client_id': client_id,
        'client_secret': client_secret,
        'grant_type': 'refresh_token',
        'refresh_token': refresh_token,
        'redirect_uri': redirect_uri
    }
    
    try:
        import urllib.parse
        encoded_data = urllib.parse.urlencode(data).encode('utf-8')
        
        req = urllib.request.Request(
            url,
            data=encoded_data,
            headers={'Content-Type': 'application/x-www-form-urlencoded'},
            method='POST'
        )
        
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            return result['access_token']
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        print(f'AmoCRM OAuth error: {e.code} - {error_body}')
        raise ValueError(f'Failed to get AmoCRM access token: {e.code}')
    except Exception as e:
        print(f'AmoCRM connection error: {str(e)}')
        raise ValueError('Failed to connect to AmoCRM')

def find_contact_by_phone(phone: str, access_token: str) -> Optional[Dict[str, Any]]:
    """
    Business: Ищет контакт в amoCRM по номеру телефона
    Args: phone - номер телефона, access_token - токен доступа
    Returns: Данные контакта или None
    """
    domain = os.environ.get('AMOCRM_DOMAIN')
    
    url = f'https://{domain}/api/v4/contacts?query={phone}&with=contacts'
    
    req = urllib.request.Request(
        url,
        headers={
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
    )
    
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode('utf-8'))
        if result.get('_embedded') and result['_embedded'].get('contacts'):
            return result['_embedded']['contacts'][0]
        return None

def verify_contact_password(phone: str, password: str, access_token: str) -> Optional[Dict[str, Any]]:
    """
    Business: Проверяет пароль контакта в amoCRM
    Args: phone - номер телефона, password - пароль, access_token - токен доступа
    Returns: Данные контакта если пароль верный, иначе None
    """
    domain = os.environ.get('AMOCRM_DOMAIN')
    
    contact = find_contact_by_phone(phone, access_token)
    if not contact:
        return None
    
    contact_id = contact['id']
    url = f'https://{domain}/api/v4/contacts/{contact_id}'
    
    req = urllib.request.Request(
        url,
        headers={
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
    )
    
    with urllib.request.urlopen(req) as response:
        full_contact = json.loads(response.read().decode('utf-8'))
        custom_fields = full_contact.get('custom_fields_values', [])
        
        for field in custom_fields:
            if field.get('field_name') == 'Пароль' or field.get('field_code') == 'PASSWORD':
                stored_password = field.get('values', [{}])[0].get('value', '')
                if stored_password == password:
                    return full_contact
        
        return None

def get_pipelines_and_statuses(access_token: str) -> dict:
    """
    Business: Получает воронки и статусы из AmoCRM
    Args: access_token - токен доступа
    Returns: Словарь с информацией о воронках и статусах
    """
    domain = os.environ.get('AMOCRM_DOMAIN')
    
    url = f'https://{domain}/api/v4/leads/pipelines'
    
    req = urllib.request.Request(
        url,
        headers={
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            pipelines = {}
            
            if result.get('_embedded') and result['_embedded'].get('pipelines'):
                for pipeline in result['_embedded']['pipelines']:
                    pipelines[pipeline['id']] = {
                        'name': pipeline['name'],
                        'statuses': {}
                    }
                    
                    for status in pipeline.get('_embedded', {}).get('statuses', []):
                        pipelines[pipeline['id']]['statuses'][status['id']] = {
                            'name': status['name'],
                            'color': status['color']
                        }
            
            return pipelines
    except:
        return {}

def get_contact_leads(contact_id: int, access_token: str) -> list:
    """
    Business: Получает сделки контакта из amoCRM с полными данными
    Args: contact_id - ID контакта, access_token - токен доступа
    Returns: Список сделок с custom_fields
    """
    domain = os.environ.get('AMOCRM_DOMAIN')
    
    url = f'https://{domain}/api/v4/leads?filter[contacts][0]={contact_id}&with=contacts'
    
    req = urllib.request.Request(
        url,
        headers={
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
    )
    
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode('utf-8'))
        if result.get('_embedded') and result['_embedded'].get('leads'):
            leads = result['_embedded']['leads']
            
            for lead in leads:
                lead_id = lead['id']
                detail_url = f'https://{domain}/api/v4/leads/{lead_id}'
                detail_req = urllib.request.Request(
                    detail_url,
                    headers={
                        'Authorization': f'Bearer {access_token}',
                        'Content-Type': 'application/json'
                    }
                )
                
                try:
                    with urllib.request.urlopen(detail_req) as detail_response:
                        lead_detail = json.loads(detail_response.read().decode('utf-8'))
                        lead['custom_fields_values'] = lead_detail.get('custom_fields_values', [])
                except:
                    lead['custom_fields_values'] = []
            
            return leads
        return []

def send_sms_code(phone: str, code: str) -> bool:
    """
    Business: Отправляет СМС код через SMS.ru
    Args: phone - номер телефона, code - код
    Returns: True если отправлено успешно
    """
    import urllib.parse
    
    api_key = os.environ.get('SMSRU_API_KEY')
    if not api_key:
        print(f'[SMS] SMS.ru API key not configured. Code for {phone}: {code}')
        return False
    
    try:
        message = f'Ваш код для входа: {code}'
        url = f"https://sms.ru/sms/send?api_id={api_key}&to={phone}&msg={urllib.parse.quote(message)}&json=1"
        
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=10) as response:
            result = json.loads(response.read().decode('utf-8'))
            return result.get('status') == 'OK'
    except Exception as e:
        print(f'[SMS] Error sending SMS to {phone}: {str(e)}')
        return False

def create_contact_and_lead(data: Dict[str, Any], access_token: str) -> Dict[str, Any]:
    """
    Business: Создает контакт и сделку в amoCRM с проверкой на дубли
    Args: data - данные клиента, access_token - токен доступа
    Returns: Данные созданного контакта и сделки
    """
    domain = os.environ.get('AMOCRM_DOMAIN')
    
    existing_contact = find_contact_by_phone(data['phone'], access_token)
    
    if existing_contact:
        return {
            'error': 'Клиент с таким телефоном уже зарегистрирован',
            'contact_id': existing_contact['id'],
            'duplicate': True
        }
    
    contact_data = [
        {
            'name': data['fullName'],
            'custom_fields_values': [
                {
                    'field_code': 'PHONE',
                    'values': [{'value': data['phone'], 'enum_code': 'WORK'}]
                },
                {
                    'field_name': 'Дата рождения',
                    'values': [{'value': data['birthDate']}]
                },
                {
                    'field_name': 'Паспорт',
                    'values': [{'value': data['passport']}]
                },
                {
                    'field_name': 'Пароль',
                    'values': [{'value': data['password']}]
                }
            ]
        }
    ]
    
    req = urllib.request.Request(
        f'https://{domain}/api/v4/contacts',
        data=json.dumps(contact_data).encode('utf-8'),
        headers={
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        },
        method='POST'
    )
    
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode('utf-8'))
        contact_id = result['_embedded']['contacts'][0]['id']
    
    lead_name = f"Займ {data['loanAmount']} ₽ на {data['loanTerm']} дней"
    lead_data = [
        {
            'name': lead_name,
            'price': data['loanAmount'],
            'custom_fields_values': [
                {
                    'field_name': 'Срок займа',
                    'values': [{'value': f"{data['loanTerm']} дней"}]
                },
                {
                    'field_name': 'Сумма займа',
                    'values': [{'value': data['loanAmount']}]
                }
            ],
            '_embedded': {
                'contacts': [{'id': contact_id}]
            }
        }
    ]
    
    req = urllib.request.Request(
        f'https://{domain}/api/v4/leads',
        data=json.dumps(lead_data).encode('utf-8'),
        headers={
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        },
        method='POST'
    )
    
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode('utf-8'))
        lead_id = result['_embedded']['leads'][0]['id']
    
    return {
        'contact_id': contact_id,
        'lead_id': lead_id,
        'lead_name': lead_name,
        'duplicate': False
    }

def update_contact_password(phone: str, new_password: str, access_token: str) -> bool:
    """
    Business: Обновляет пароль контакта в amoCRM
    Args: phone - номер телефона, new_password - новый пароль, access_token - токен доступа
    Returns: True если обновлено успешно
    """
    domain = os.environ.get('AMOCRM_DOMAIN')
    
    contact = find_contact_by_phone(phone, access_token)
    if not contact:
        return False
    
    contact_id = contact['id']
    
    url = f'https://{domain}/api/v4/contacts/{contact_id}'
    full_contact_req = urllib.request.Request(
        url,
        headers={
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
    )
    
    with urllib.request.urlopen(full_contact_req) as response:
        full_contact = json.loads(response.read().decode('utf-8'))
    
    custom_fields = full_contact.get('custom_fields_values', [])
    password_field_id = None
    
    for field in custom_fields:
        if field.get('field_name') == 'Пароль' or field.get('field_code') == 'PASSWORD':
            password_field_id = field.get('field_id')
            break
    
    if not password_field_id:
        return False
    
    update_data = {
        'custom_fields_values': [
            {
                'field_id': password_field_id,
                'values': [{'value': new_password}]
            }
        ]
    }
    
    update_req = urllib.request.Request(
        url,
        data=json.dumps(update_data).encode('utf-8'),
        headers={
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        },
        method='PATCH'
    )
    
    try:
        with urllib.request.urlopen(update_req) as response:
            return response.status == 200
    except:
        return False

def old_create_contact_and_lead_backup():
    if False:
        pass

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Business: Получает данные клиента из amoCRM по номеру телефона или создает новую сделку
    Args: event - dict с httpMethod, queryStringParameters{phone} или body с данными регистрации
          context - object с атрибутами request_id, function_name
    Returns: HTTP response с данными клиента
    """
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
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        access_token = get_access_token()
    except ValueError as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        
        action = body_data.get('action')
        
        if action == 'request-sms':
            phone = body_data.get('phone', '').strip()
            
            if not phone:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Введите номер телефона'}),
                    'isBase64Encoded': False
                }
            
            contact = find_contact_by_phone(phone, access_token)
            
            if not contact:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Телефон не зарегистрирован в системе'}),
                    'isBase64Encoded': False
                }
            
            import random
            sms_code = str(random.randint(1000, 9999))
            
            sms_sent = send_sms_code(phone, sms_code)
            
            response_data = {
                'success': True,
                'sms_sent': sms_sent
            }
            
            if not sms_sent:
                response_data['code'] = sms_code
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(response_data),
                'isBase64Encoded': False
            }
        
        if action == 'verify-sms':
            phone = body_data.get('phone', '').strip()
            code = body_data.get('code', '').strip()
            
            if not phone or not code:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Введите телефон и код'}),
                    'isBase64Encoded': False
                }
            
            contact = find_contact_by_phone(phone, access_token)
            
            if not contact:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Телефон не зарегистрирован в системе'}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'phone': phone,
                    'name': contact.get('name', ''),
                    'contact_id': contact.get('id')
                }),
                'isBase64Encoded': False
            }
        
        if action == 'request-reset':
            phone = body_data.get('phone', '').strip()
            
            if not phone:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Введите номер телефона'}),
                    'isBase64Encoded': False
                }
            
            contact = find_contact_by_phone(phone, access_token)
            
            if not contact:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Клиент с таким телефоном не найден'}),
                    'isBase64Encoded': False
                }
            
            import random
            sms_code = str(random.randint(1000, 9999))
            
            sms_sent = send_sms_code(phone, sms_code)
            
            response_data = {
                'success': True,
                'sms_sent': sms_sent
            }
            
            if not sms_sent:
                response_data['code'] = sms_code
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(response_data),
                'isBase64Encoded': False
            }
        
        if action == 'reset-password':
            phone = body_data.get('phone', '').strip()
            code = body_data.get('code', '').strip()
            new_password = body_data.get('newPassword', '')
            
            if not phone or not code or not new_password:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Заполните все поля'}),
                    'isBase64Encoded': False
                }
            
            updated = update_contact_password(phone, new_password, access_token)
            
            if not updated:
                return {
                    'statusCode': 500,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Не удалось обновить пароль'}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'message': 'Пароль успешно изменен'
                }),
                'isBase64Encoded': False
            }
        
        required_fields = ['fullName', 'birthDate', 'phone', 'passport', 'loanAmount', 'loanTerm', 'password']
        for field in required_fields:
            if field not in body_data:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': f'Missing field: {field}'}),
                    'isBase64Encoded': False
                }
        
        result = create_contact_and_lead(body_data, access_token)
        
        if result.get('duplicate'):
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'error': result.get('error', 'Клиент уже зарегистрирован')
                }),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'contact_id': result['contact_id'],
                'lead_id': result.get('lead_id'),
                'lead_name': result.get('lead_name')
            }),
            'isBase64Encoded': False
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    params = event.get('queryStringParameters', {}) or {}
    phone = params.get('phone', '')
    
    if not phone:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Phone parameter required'}),
            'isBase64Encoded': False
        }
    
    contact = find_contact_by_phone(phone, access_token)
    
    if not contact:
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Contact not found'}),
            'isBase64Encoded': False
        }
    
    leads = get_contact_leads(contact['id'], access_token)
    pipelines = get_pipelines_and_statuses(access_token)
    
    enriched_leads = []
    for lead in leads:
        pipeline_id = lead.get('pipeline_id')
        status_id = lead.get('status_id')
        
        pipeline_info = pipelines.get(pipeline_id, {})
        status_info = pipeline_info.get('statuses', {}).get(status_id, {})
        
        enriched_leads.append({
            'id': lead['id'],
            'name': lead.get('name', ''),
            'price': lead.get('price', 0),
            'status_id': status_id,
            'status_name': status_info.get('name', 'Неизвестно'),
            'status_color': status_info.get('color', '#cccccc'),
            'pipeline_id': pipeline_id,
            'pipeline_name': pipeline_info.get('name', 'Основная воронка'),
            'created_at': lead.get('created_at'),
            'updated_at': lead.get('updated_at'),
            'responsible_user_id': lead.get('responsible_user_id'),
            'custom_fields_values': lead.get('custom_fields_values', [])
        })
    
    client_data = {
        'id': contact['id'],
        'name': contact.get('name', ''),
        'phone': phone,
        'leads': enriched_leads
    }
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps(client_data),
        'isBase64Encoded': False
    }