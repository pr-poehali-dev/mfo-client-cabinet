"""
Business: Получает список сделок клиента из AmoCRM по номеру телефона
Args: event с queryStringParameters (phone - номер телефона в формате 79991234567)
Returns: JSON с данными клиента и его сделками
"""

import json
import os
import requests
from typing import Dict, Any, List, Optional

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
            'body': ''
        }
    
    params = event.get('queryStringParameters', {})
    phone = params.get('phone', '')
    
    if not phone:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Параметр phone обязателен'})
        }
    
    subdomain = os.environ.get('AMOCRM_SUBDOMAIN', '').replace('.amocrm.ru', '')
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
        # Поиск контакта по телефону
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
                'body': json.dumps({'error': 'Токен недействителен. Обновите токен.'})
            }
        
        search_response.raise_for_status()
        contacts_data = search_response.json()
        
        if not contacts_data.get('_embedded', {}).get('contacts'):
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Клиент не найден'})
            }
        
        contact = contacts_data['_embedded']['contacts'][0]
        contact_id = contact['id']
        
        # Получение сделок контакта
        leads_url = f'https://{subdomain}.amocrm.ru/api/v4/leads'
        leads_response = requests.get(
            leads_url,
            headers=headers,
            params={'filter[contacts][0]': contact_id, 'with': 'contacts'},
            timeout=10
        )
        leads_response.raise_for_status()
        leads_data = leads_response.json()
        
        deals = []
        for lead in leads_data.get('_embedded', {}).get('leads', []):
            deals.append({
                'id': str(lead['id']),
                'name': lead.get('name', 'Без названия'),
                'price': lead.get('price', 0),
                'status_id': lead.get('status_id'),
                'created_at': lead.get('created_at'),
                'updated_at': lead.get('updated_at')
            })
        
        # Формирование данных клиента
        custom_fields = contact.get('custom_fields_values', [])
        phone_field = next((f for f in custom_fields if f['field_code'] == 'PHONE'), None)
        email_field = next((f for f in custom_fields if f['field_code'] == 'EMAIL'), None)
        
        client_data = {
            'id': str(contact_id),
            'name': contact.get('name', ''),
            'first_name': contact.get('first_name', ''),
            'last_name': contact.get('last_name', ''),
            'phone': phone_field['values'][0]['value'] if phone_field else phone,
            'email': email_field['values'][0]['value'] if email_field else ''
        }
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'client': client_data,
                'deals': deals,
                'total_deals': len(deals)
            })
        }
        
    except requests.exceptions.RequestException as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка API AmoCRM: {str(e)}'})
        }