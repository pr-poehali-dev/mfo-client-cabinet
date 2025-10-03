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
    
    url = f'https://{domain}/api/v4/contacts?query={phone}'
    
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

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Business: Получает данные клиента из amoCRM по номеру телефона
    Args: event - dict с httpMethod, queryStringParameters{phone}
          context - object с атрибутами request_id, function_name
    Returns: HTTP response с данными клиента
    """
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
