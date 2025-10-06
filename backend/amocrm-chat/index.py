import json
import os
import urllib.request
import urllib.parse
from typing import Dict, Any, List

def get_access_token() -> str:
    '''Get AmoCRM access token using refresh token'''
    domain = os.environ.get('AMOCRM_DOMAIN', '')
    client_id = os.environ.get('AMOCRM_CLIENT_ID', '')
    client_secret = os.environ.get('AMOCRM_CLIENT_SECRET', '')
    refresh_token = os.environ.get('AMOCRM_REFRESH_TOKEN', '')
    
    if not all([domain, client_id, client_secret, refresh_token]):
        raise ValueError('Missing AmoCRM credentials')
    
    url = f'https://{domain}/oauth2/access_token'
    data = {
        'client_id': client_id,
        'client_secret': client_secret,
        'grant_type': 'refresh_token',
        'refresh_token': refresh_token,
        'redirect_uri': 'https://example.com'
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    
    response = urllib.request.urlopen(req)
    result = json.loads(response.read().decode('utf-8'))
    return result['access_token']

def get_contact_messages(contact_id: str, access_token: str) -> List[Dict[str, Any]]:
    '''Get chat messages for contact from AmoCRM'''
    domain = os.environ.get('AMOCRM_DOMAIN', '')
    
    url = f'https://{domain}/api/v4/contacts/{contact_id}/notes'
    params = urllib.parse.urlencode({'filter[note_type][]': 'common'})
    
    req = urllib.request.Request(
        f'{url}?{params}',
        headers={
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
    )
    
    try:
        response = urllib.request.urlopen(req)
        data = json.loads(response.read().decode('utf-8'))
        
        messages = []
        for note in data.get('_embedded', {}).get('notes', []):
            params = note.get('params', {})
            text = params.get('text', '') if isinstance(params, dict) else ''
            
            if text and '[Чат]' in text:
                clean_text = text.replace('[Чат] ', '').strip()
                messages.append({
                    'id': str(note['id']),
                    'text': clean_text,
                    'created_at': note['created_at'],
                    'author_id': note.get('created_by', 0),
                    'is_client': note.get('created_by', 0) == 0
                })
        
        messages.sort(key=lambda x: x['created_at'])
        return messages
    except Exception as e:
        print(f'Error loading messages: {e}')
        return []

def send_message_to_amocrm(contact_id: str, message: str, access_token: str) -> bool:
    '''Send message to AmoCRM contact as note'''
    domain = os.environ.get('AMOCRM_DOMAIN', '')
    
    url = f'https://{domain}/api/v4/contacts/{contact_id}/notes'
    
    note_data = [{
        'note_type': 'common',
        'params': {
            'text': f'[Чат] {message}'
        }
    }]
    
    req = urllib.request.Request(
        url,
        data=json.dumps(note_data).encode('utf-8'),
        headers={
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        },
        method='POST'
    )
    
    try:
        response = urllib.request.urlopen(req)
        return response.status == 200
    except Exception as e:
        print(f'Error sending message: {e}')
        return False

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Chat integration with AmoCRM - send and receive messages
    Args: event with httpMethod, body, queryStringParameters
          context with request_id attribute
    Returns: HTTP response with messages or send confirmation
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'GET':
        params = event.get('queryStringParameters', {})
        contact_id = params.get('contact_id', '')
        
        if not contact_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'contact_id is required'}),
                'isBase64Encoded': False
            }
        
        try:
            access_token = get_access_token()
            messages = get_contact_messages(contact_id, access_token)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'messages': messages, 'success': True}),
                'isBase64Encoded': False
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': str(e)}),
                'isBase64Encoded': False
            }
    
    elif method == 'POST':
        body_str = event.get('body', '{}')
        if not body_str or body_str.strip() == '':
            body_str = '{}'
        
        body_data = json.loads(body_str)
        contact_id = body_data.get('contact_id', '')
        message = body_data.get('message', '')
        
        if not contact_id or not message:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'contact_id and message are required'}),
                'isBase64Encoded': False
            }
        
        try:
            access_token = get_access_token()
            success = send_message_to_amocrm(contact_id, message, access_token)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': success}),
                'isBase64Encoded': False
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': str(e)}),
                'isBase64Encoded': False
            }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }