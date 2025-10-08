'''
Business: Получение заявок клиента напрямую из AmoCRM по номеру телефона
Args: event - dict с httpMethod, queryStringParameters (phone)
      context - объект с request_id, function_name
Returns: HTTP response со списком заявок клиента из AmoCRM
'''

import json
import os
import requests
from typing import Dict, Any, List

def normalize_phone(phone: str) -> str:
    '''Нормализация телефона к формату для поиска'''
    clean = ''.join(filter(str.isdigit, phone))
    if clean.startswith('8'):
        clean = '7' + clean[1:]
    if not clean.startswith('7'):
        clean = '7' + clean
    return clean

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    params = event.get('queryStringParameters') or {}
    phone = params.get('phone', '').strip()
    
    if not phone:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'Номер телефона обязателен'}),
            'isBase64Encoded': False
        }
    
    amocrm_domain = os.environ.get('AMOCRM_DOMAIN', 'stepanmalik88.amocrm.ru')
    amocrm_token = os.environ.get('AMOCRM_ACCESS_TOKEN', '')
    
    if not amocrm_token:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'AmoCRM не настроен'}),
            'isBase64Encoded': False
        }
    
    normalized_phone = normalize_phone(phone)
    
    headers = {
        'Authorization': f'Bearer {amocrm_token}',
        'Content-Type': 'application/json'
    }
    
    # Ищем контакт по телефону
    try:
        search_response = requests.get(
            f'https://{amocrm_domain}/api/v4/contacts',
            headers=headers,
            params={'query': normalized_phone},
            timeout=10
        )
        
        if search_response.status_code != 200:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'error': 'Контакт не найден'}),
                'isBase64Encoded': False
            }
        
        contacts_data = search_response.json()
        contacts = contacts_data.get('_embedded', {}).get('contacts', [])
        
        if not contacts:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'error': 'Клиент не найден'}),
                'isBase64Encoded': False
            }
        
        contact = contacts[0]
        contact_id = contact.get('id')
        contact_name = contact.get('name', 'Клиент')
        
        # Получаем сделки контакта
        leads_response = requests.get(
            f'https://{amocrm_domain}/api/v4/leads',
            headers=headers,
            params={'filter[contacts][0]': contact_id, 'limit': 250},
            timeout=10
        )
        
        if leads_response.status_code != 200:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'client': {'name': contact_name, 'phone': phone},
                    'deals': [],
                    'total': 0
                }),
                'isBase64Encoded': False
            }
        
        leads_data = leads_response.json()
        leads = leads_data.get('_embedded', {}).get('leads', [])
        
        deals: List[Dict[str, Any]] = []
        for lead in leads:
            deals.append({
                'id': lead.get('id'),
                'name': lead.get('name', 'Заявка'),
                'price': lead.get('price', 0),
                'status_id': lead.get('status_id'),
                'pipeline_id': lead.get('pipeline_id'),
                'created_at': lead.get('created_at'),
                'updated_at': lead.get('updated_at')
            })
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'client': {'name': contact_name, 'phone': phone},
                'deals': deals,
                'total': len(deals)
            }),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': f'Ошибка: {str(e)}'}),
            'isBase64Encoded': False
        }
