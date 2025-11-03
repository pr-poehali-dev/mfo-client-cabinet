'''
Business: МегаГрупп API интеграция - получение данных клиента
Args: event - dict с httpMethod, queryStringParameters (phone)
      context - объект с атрибутами request_id, function_name
Returns: HTTP response с данными клиента и заказами
'''
import json
import os
import requests
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field

class MegagroupClient(BaseModel):
    id: str
    name: str
    phone: str
    email: Optional[str] = None
    balance: float = 0.0
    bonus_balance: float = 0.0
    discount: float = 0.0

class MegagroupOrder(BaseModel):
    id: str
    number: str
    date: str
    status: str
    total: float
    items_count: int

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
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
            'body': ''
        }
    
    api_key = os.environ.get('MEGAGROUP_API_KEY')
    if not api_key:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'success': False, 'error': 'API key not configured'})
        }
    
    if method == 'GET':
        params = event.get('queryStringParameters', {})
        phone = params.get('phone', '')
        
        if not phone:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'success': False, 'error': 'Phone number required'})
            }
        
        client_data = get_client_by_phone(api_key, phone)
        
        if not client_data:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'success': False, 'not_found': True, 'error': 'Client not found'})
            }
        
        orders = get_client_orders(api_key, client_data['id'])
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({
                'success': True,
                'client': client_data,
                'orders': orders
            })
        }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({'success': False, 'error': 'Method not allowed'})
    }

def get_client_by_phone(api_key: str, phone: str) -> Optional[Dict[str, Any]]:
    import hashlib
    
    clean_phone = ''.join(filter(str.isdigit, phone))
    print(f'[DEBUG] Searching for phone: {clean_phone}')
    
    method = 'GET'
    path = '/v1/clients'
    params = f'query={clean_phone}'
    body = ''
    
    signature_string = f'{method}:{path}:{params}:{body}:{api_key}'
    signature = hashlib.sha256(signature_string.encode()).hexdigest()
    
    account_id = api_key.split('-')[0] if '-' in api_key else api_key[:8]
    print(f'[DEBUG] Account ID: {account_id}')
    
    headers = {
        'X-MegaCrm-ApiAccount': account_id,
        'X-MegaCrm-ApiSignature': signature,
        'Content-Type': 'application/json'
    }
    
    url = f'https://api.megacrm.ru{path}?{params}'
    print(f'[DEBUG] API URL: {url}')
    
    response = requests.get(url, headers=headers, timeout=10)
    print(f'[DEBUG] Response status: {response.status_code}')
    print(f'[DEBUG] Response body: {response.text[:500]}')
    
    if response.status_code == 200:
        data = response.json()
        result = data.get('result', [])
        print(f'[DEBUG] Result count: {len(result)}')
        if result and len(result) > 0:
            client = result[0]
            full_name = f"{client.get('name', '')} {client.get('last_name', '')}".strip()
            return {
                'id': str(client.get('id', '')),
                'name': full_name or 'Клиент',
                'phone': phone,
                'email': client.get('email'),
                'balance': 0.0,
                'bonus_balance': 0.0,
                'discount': 0.0
            }
    
    return None

def get_client_orders(api_key: str, client_id: str) -> List[Dict[str, Any]]:
    import hashlib
    
    method = 'GET'
    path = '/v1/deals'
    params = f'client_id={client_id}'
    body = ''
    
    signature_string = f'{method}:{path}:{params}:{body}:{api_key}'
    signature = hashlib.sha256(signature_string.encode()).hexdigest()
    
    account_id = api_key.split('-')[0] if '-' in api_key else api_key[:8]
    
    headers = {
        'X-MegaCrm-ApiAccount': account_id,
        'X-MegaCrm-ApiSignature': signature,
        'Content-Type': 'application/json'
    }
    
    url = f'https://api.megacrm.ru{path}?{params}'
    
    response = requests.get(url, headers=headers, timeout=10)
    
    if response.status_code == 200:
        data = response.json()
        result = data.get('result', [])
        orders = []
        for deal in result:
            orders.append({
                'id': str(deal.get('id', '')),
                'number': str(deal.get('ui_id', deal.get('id', ''))),
                'date': deal.get('created', ''),
                'status': deal.get('stage', {}).get('name', 'Неизвестно') if isinstance(deal.get('stage'), dict) else 'В работе',
                'total': 0.0,
                'items_count': 0,
                'title': deal.get('title', 'Сделка')
            })
        return orders
    
    return []