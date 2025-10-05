import json
import os
from typing import Dict, Any, Optional
import urllib.request
import urllib.error
from datetime import datetime, timedelta

def get_access_token() -> str:
    """
    Business: Получает актуальный access_token для amoCRM через refresh_token
    Returns: Access token string
    """
    domain = os.environ.get('AMOCRM_DOMAIN')
    client_id = os.environ.get('AMOCRM_CLIENT_ID')
    client_secret = os.environ.get('AMOCRM_CLIENT_SECRET')
    refresh_token = os.environ.get('AMOCRM_REFRESH_TOKEN')
    redirect_uri = os.environ.get('AMOCRM_REDIRECT_URI')
    
    url = f'https://{domain}/oauth2/access_token'
    data = {
        'client_id': client_id,
        'client_secret': client_secret,
        'grant_type': 'refresh_token',
        'refresh_token': refresh_token,
        'redirect_uri': redirect_uri
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode('utf-8'))
        return result['access_token']

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

def get_contact_leads(contact_id: int, access_token: str) -> list:
    """
    Business: Получает сделки контакта из amoCRM
    Args: contact_id - ID контакта, access_token - токен доступа
    Returns: Список сделок
    """
    domain = os.environ.get('AMOCRM_DOMAIN')
    
    url = f'https://{domain}/api/v4/leads?filter[contacts][0]={contact_id}'
    
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
            return result['_embedded']['leads']
        return []

def create_contact_and_lead(data: Dict[str, Any], access_token: str) -> Dict[str, Any]:
    """
    Business: Создает контакт и сделку в amoCRM
    Args: data - данные клиента, access_token - токен доступа
    Returns: Данные созданного контакта и сделки
    """
    domain = os.environ.get('AMOCRM_DOMAIN')
    
    # Ищем существующий контакт
    existing_contact = find_contact_by_phone(data['phone'], access_token)
    
    if existing_contact:
        contact_id = existing_contact['id']
    else:
        # Создаем новый контакт
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
    
    # Создаем сделку
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
        'lead_name': lead_name
    }

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
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        
        action = body_data.get('action')
        
        if action == 'login':
            phone = body_data.get('phone', '').strip()
            password = body_data.get('password', '')
            
            if not phone or not password:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Введите телефон и пароль'}),
                    'isBase64Encoded': False
                }
            
            access_token = get_access_token()
            contact = verify_contact_password(phone, password, access_token)
            
            if not contact:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неверный телефон или пароль'}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'phone': phone,
                    'name': contact.get('name', '')
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
        
        access_token = get_access_token()
        result = create_contact_and_lead(body_data, access_token)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'contact_id': result['contact_id'],
                'lead_id': result['lead_id'],
                'lead_name': result['lead_name']
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
    
    access_token = get_access_token()
    contact = find_contact_by_phone(phone, access_token)
    
    if not contact:
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Contact not found'}),
            'isBase64Encoded': False
        }
    
    leads = get_contact_leads(contact['id'], access_token)
    
    client_data = {
        'id': contact['id'],
        'name': contact.get('name', ''),
        'phone': phone,
        'leads': [
            {
                'id': lead['id'],
                'name': lead.get('name', ''),
                'price': lead.get('price', 0),
                'status_id': lead.get('status_id'),
                'created_at': lead.get('created_at'),
                'updated_at': lead.get('updated_at')
            }
            for lead in leads
        ]
    }
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps(client_data),
        'isBase64Encoded': False
    }