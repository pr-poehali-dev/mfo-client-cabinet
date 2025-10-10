"""
Business: Создает новую сделку (заявку) в AmoCRM
Args: event с body (name, phone, amount - опционально)
Returns: JSON с ID созданной сделки
"""

import json
import os
import requests
from typing import Dict, Any

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
            'body': json.dumps({'error': 'Метод не поддерживается'})
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Неверный формат JSON'})
        }
    
    name = body.get('name', '')
    phone = body.get('phone', '')
    amount = body.get('amount', 0)
    
    if not name or not phone:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Параметры name и phone обязательны'})
        }
    
    subdomain = os.environ.get('AMOCRM_SUBDOMAIN')
    access_token = os.environ.get('AMOCRM_ACCESS_TOKEN')
    
    if not subdomain or not access_token:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Не настроены секреты AmoCRM'})
        }
    
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    try:
        # Поиск или создание контакта
        search_url = f'https://{subdomain}.amocrm.ru/api/v4/contacts'
        search_response = requests.get(
            search_url,
            headers=headers,
            params={'query': phone},
            timeout=10
        )
        
        if search_response.status_code == 401:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Токен недействителен'})
            }
        
        contact_id = None
        if search_response.status_code == 200:
            contacts = search_response.json().get('_embedded', {}).get('contacts', [])
            if contacts:
                contact_id = contacts[0]['id']
        
        # Создание контакта если не найден
        if not contact_id:
            contact_data = {
                'name': name,
                'custom_fields_values': [
                    {
                        'field_code': 'PHONE',
                        'values': [{'value': phone, 'enum_code': 'WORK'}]
                    }
                ]
            }
            
            create_contact_response = requests.post(
                search_url,
                headers=headers,
                json=[contact_data],
                timeout=10
            )
            create_contact_response.raise_for_status()
            contact_id = create_contact_response.json()['_embedded']['contacts'][0]['id']
        
        # Создание сделки
        lead_data = {
            'name': f'Заявка от {name}',
            'price': int(amount),
            '_embedded': {
                'contacts': [{'id': contact_id}]
            }
        }
        
        leads_url = f'https://{subdomain}.amocrm.ru/api/v4/leads'
        lead_response = requests.post(
            leads_url,
            headers=headers,
            json=[lead_data],
            timeout=10
        )
        lead_response.raise_for_status()
        lead_id = lead_response.json()['_embedded']['leads'][0]['id']
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'lead_id': lead_id,
                'contact_id': contact_id,
                'message': 'Заявка успешно создана'
            })
        }
        
    except requests.exceptions.RequestException as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка API AmoCRM: {str(e)}'})
        }
