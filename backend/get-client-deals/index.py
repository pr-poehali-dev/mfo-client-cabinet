'''
Business: Получение заявок клиента напрямую из AmoCRM по номеру телефона и ФИО
Args: event - dict с httpMethod, queryStringParameters (phone, full_name)
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

def normalize_name(name: str) -> str:
    '''Нормализация имени для сравнения'''
    return ' '.join(name.lower().strip().split())

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    params = event.get('queryStringParameters') or {}
    phone = params.get('phone', '').strip()
    full_name = params.get('full_name', '').strip()
    
    if not phone:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'Номер телефона обязателен'}),
            'isBase64Encoded': False
        }
    
    amocrm_subdomain = os.environ.get('AMOCRM_SUBDOMAIN', 'stepanmalik88')
    # Убираем .amocrm.ru если он уже есть
    if amocrm_subdomain.endswith('.amocrm.ru'):
        amocrm_domain = amocrm_subdomain
    else:
        amocrm_domain = f'{amocrm_subdomain}.amocrm.ru'
    amocrm_token = os.environ.get('AMOCRM_ACCESS_TOKEN', '')
    
    if not amocrm_token:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'AmoCRM не настроен'}),
            'isBase64Encoded': False
        }
    
    normalized_phone = normalize_phone(phone)
    normalized_full_name = normalize_name(full_name)
    
    headers = {
        'Authorization': f'Bearer {amocrm_token}',
        'Content-Type': 'application/json'
    }
    
    try:
        # Ищем контакт по телефону
        search_response = requests.get(
            f'https://{amocrm_domain}/api/v4/contacts',
            headers=headers,
            params={'query': normalized_phone},
            timeout=10
        )
        
        if search_response.status_code == 401:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'error': 'Токен AmoCRM недействителен или истёк'}),
                'isBase64Encoded': False
            }
        
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
        
        # Проверяем совпадение телефона и ФИО
        matched_contact = None
        for contact in contacts:
            contact_detail = requests.get(
                f'https://{amocrm_domain}/api/v4/contacts/{contact.get("id")}',
                headers=headers,
                timeout=10
            )
            
            if contact_detail.status_code == 200:
                contact_data = contact_detail.json()
                
                # Проверяем телефон
                phone_match = False
                for field in contact_data.get('custom_fields_values', []):
                    if field.get('field_code') == 'PHONE':
                        for value in field.get('values', []):
                            contact_phone = normalize_phone(value.get('value', ''))
                            if contact_phone == normalized_phone:
                                phone_match = True
                                break
                    if phone_match:
                        break
                
                if not phone_match:
                    continue
                
                # Если передано ФИО, проверяем его
                if full_name:
                    contact_full_name = contact_data.get('name', '')
                    if normalize_name(contact_full_name) != normalize_name(full_name):
                        continue
                
                matched_contact = contact_data
                break
        
        if not matched_contact:
            error_msg = 'ФИО не совпадает' if full_name else 'Точное совпадение телефона не найдено'
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'error': error_msg}),
                'isBase64Encoded': False
            }
        
        contact_id = matched_contact.get('id')
        contact_name = matched_contact.get('name', 'Клиент')
        
        # Получаем ТОЛЬКО сделки этого контакта через фильтр AmoCRM
        # ВАЖНО: AmoCRM требует строгий формат фильтра для поиска по контакту
        filter_params = {
            'filter[contacts][0][id]': str(contact_id),
            'limit': 250
        }
        
        all_leads_response = requests.get(
            f'https://{amocrm_domain}/api/v4/leads',
            headers=headers,
            params=filter_params,
            timeout=10
        )
        
        if all_leads_response.status_code != 200:
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
        
        all_leads_data = all_leads_response.json()
        all_leads = all_leads_data.get('_embedded', {}).get('leads', [])
        
        # Объединяем все сделки клиента в одну запись с суммой
        total_price = sum(lead.get('price', 0) for lead in all_leads)
        deal_ids = [lead.get('id') for lead in all_leads]
        
        # Создаём одну объединённую заявку
        if all_leads:
            # Берём самую свежую заявку для отображения
            latest_lead = max(all_leads, key=lambda x: x.get('updated_at', 0))
            
            unified_deal = {
                'id': ','.join(map(str, deal_ids)),  # Все ID через запятую
                'name': f'Заявки клиента ({len(all_leads)} шт.)',
                'price': total_price,
                'status_id': latest_lead.get('status_id'),
                'pipeline_id': latest_lead.get('pipeline_id'),
                'created_at': min(lead.get('created_at', 0) for lead in all_leads),
                'updated_at': latest_lead.get('updated_at'),
                'count': len(all_leads)
            }
            deals = [unified_deal]
        else:
            deals = []
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'client': {'name': contact_name, 'phone': phone, 'id': contact_id},
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