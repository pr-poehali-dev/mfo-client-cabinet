import json
import os
from typing import Dict, Any
import urllib.request
import urllib.error

def get_access_token() -> str:
    """
    Business: Получает access_token для AmoCRM
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
        raise ValueError('AmoCRM credentials not configured')
    
    url = f'https://{domain}/oauth2/access_token'
    data = {
        'client_id': client_id,
        'client_secret': client_secret,
        'grant_type': 'refresh_token',
        'refresh_token': refresh_token,
        'redirect_uri': redirect_uri
    }
    
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

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Business: Обновляет данные контакта в AmoCRM
    Args: event - dict with httpMethod, body (phone, first_name, last_name, middle_name, email, birth_date)
          context - object with request_id, function_name attributes
    Returns: HTTP response dict
    """
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        phone = body_data.get('phone', '')
        first_name = body_data.get('first_name', '')
        last_name = body_data.get('last_name', '')
        middle_name = body_data.get('middle_name', '')
        email = body_data.get('email', '')
        birth_date = body_data.get('birth_date', '')
        
        if not phone:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Phone is required'}),
                'isBase64Encoded': False
            }
        
        clean_phone = phone.replace('+', '').replace(' ', '').replace('(', '').replace(')', '').replace('-', '')
        
        access_token = get_access_token()
        domain = os.environ.get('AMOCRM_DOMAIN', 'stepanmalik88.amocrm.ru')
        
        print(f'[UPDATE] Searching contact by phone: {clean_phone}')
        
        contact_url = f'https://{domain}/api/v4/contacts?query={clean_phone}'
        contact_req = urllib.request.Request(
            contact_url,
            headers={'Authorization': f'Bearer {access_token}'}
        )
        
        with urllib.request.urlopen(contact_req, timeout=10) as response:
            response_text = response.read().decode()
            
            if not response_text:
                return {
                    'statusCode': 404,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Contact not found'}),
                    'isBase64Encoded': False
                }
            
            contacts_data = json.loads(response_text)
        
        contacts = contacts_data.get('_embedded', {}).get('contacts', [])
        
        if not contacts:
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Contact not found'}),
                'isBase64Encoded': False
            }
        
        contact = contacts[0]
        contact_id = contact['id']
        
        print(f'[UPDATE] Found contact ID: {contact_id}')
        
        full_name = f"{last_name} {first_name} {middle_name}".strip()
        if not full_name:
            full_name = contact.get('name', 'Клиент')
        
        custom_fields = []
        
        if email:
            custom_fields.append({
                'field_code': 'EMAIL',
                'values': [{'value': email, 'enum_code': 'WORK'}]
            })
        
        if birth_date:
            custom_fields.append({
                'field_name': 'Дата рождения',
                'values': [{'value': birth_date}]
            })
        
        update_data = {
            'id': contact_id,
            'name': full_name
        }
        
        if custom_fields:
            update_data['custom_fields_values'] = custom_fields
        
        print(f'[UPDATE] Updating contact with data: {json.dumps(update_data, ensure_ascii=False)}')
        
        update_url = f'https://{domain}/api/v4/contacts'
        update_req = urllib.request.Request(
            update_url,
            data=json.dumps([update_data]).encode('utf-8'),
            headers={
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            },
            method='PATCH'
        )
        
        with urllib.request.urlopen(update_req, timeout=10) as response:
            result = json.loads(response.read().decode())
        
        print(f'[UPDATE] Contact updated successfully')
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'contact_id': contact_id,
                'message': 'Contact updated successfully'
            }),
            'isBase64Encoded': False
        }
        
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        print(f'[UPDATE] AmoCRM HTTP Error: {e.code} - {error_body}')
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'AmoCRM error: {e.code}'}),
            'isBase64Encoded': False
        }
    except Exception as e:
        print(f'[UPDATE] Error: {str(e)}')
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
