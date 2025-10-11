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
            'body': '',
            'isBase64Encoded': False
        }
    
    params = event.get('queryStringParameters', {})
    phone = params.get('phone', '')
    
    if not phone:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Параметр phone обязателен'}),
            'isBase64Encoded': False
        }
    
    subdomain = os.environ.get('AMOCRM_SUBDOMAIN', '').replace('.amocrm.ru', '')
    access_token = os.environ.get('AMOCRM_ACCESS_TOKEN')
    
    if not subdomain or not access_token:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Не настроены секреты AmoCRM'}),
            'isBase64Encoded': False
        }
    
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    try:
        # Поиск контакта по телефону
        print(f'[AMOCRM] Поиск контакта: {phone}')
        search_url = f'https://{subdomain}.amocrm.ru/api/v4/contacts'
        
        try:
            search_response = requests.get(
                search_url,
                headers=headers,
                params={'query': phone},
                timeout=10
            )
            print(f'[AMOCRM] Status: {search_response.status_code}')
            print(f'[AMOCRM] Response headers: {dict(search_response.headers)}')
            print(f'[AMOCRM] Response text length: {len(search_response.text)}')
            
        except requests.exceptions.Timeout:
            print('[AMOCRM] Timeout при запросе')
            return {
                'statusCode': 504,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Превышено время ожидания ответа от AmoCRM'}),
                'isBase64Encoded': False
            }
        except requests.exceptions.ConnectionError as e:
            print(f'[AMOCRM] Connection error: {e}')
            return {
                'statusCode': 503,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Ошибка подключения к AmoCRM'}),
                'isBase64Encoded': False
            }
        
        if search_response.status_code == 401:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Токен недействителен. Обновите токен.'}),
                'isBase64Encoded': False
            }
        
        if search_response.status_code == 204:
            print('[AMOCRM] Контакт не найден (204)')
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Клиент не найден'}),
                'isBase64Encoded': False
            }
        
        if search_response.status_code != 200:
            print(f'[AMOCRM] Ошибка поиска контакта: {search_response.status_code}')
            print(f'[AMOCRM] Ответ: {search_response.text[:500]}')
            return {
                'statusCode': search_response.status_code,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': f'Ошибка поиска в AmoCRM: {search_response.status_code}'}),
                'isBase64Encoded': False
            }
        
        response_text = search_response.text
        if not response_text or response_text.strip() == '':
            print('[AMOCRM] Пустой ответ от AmoCRM')
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Клиент не найден'}),
                'isBase64Encoded': False
            }
        
        try:
            contacts_data = json.loads(response_text)
        except json.JSONDecodeError as json_error:
            print(f'[AMOCRM] Ошибка парсинга JSON: {json_error}')
            print(f'[AMOCRM] Ответ: {response_text[:200]}')
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Клиент не найден'}),
                'isBase64Encoded': False
            }
        
        if not contacts_data.get('_embedded', {}).get('contacts'):
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Клиент не найден'}),
                'isBase64Encoded': False
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
        
        # Получаем все воронки и их статусы одним запросом
        pipelines_url = f'https://{subdomain}.amocrm.ru/api/v4/leads/pipelines'
        try:
            pipelines_response = requests.get(pipelines_url, headers=headers, timeout=10)
            pipelines_response.raise_for_status()
            pipelines_data = pipelines_response.json()
            
            # Собираем все статусы из всех воронок
            all_statuses = {}
            for pipeline in pipelines_data.get('_embedded', {}).get('pipelines', []):
                pipeline_id = pipeline.get('id')
                statuses = pipeline.get('_embedded', {}).get('statuses', [])
                for status in statuses:
                    status_id = status.get('id')
                    if status_id:
                        all_statuses[status_id] = status.get('name', 'В обработке')
            
            print(f'[AMOCRM] Загружено статусов: {len(all_statuses)}')
        except Exception as e:
            print(f'[AMOCRM] Ошибка загрузки статусов: {e}')
            all_statuses = {}
        
        deals = []
        for lead in leads_data.get('_embedded', {}).get('leads', []):
            status_id = lead.get('status_id')
            status_name = all_statuses.get(status_id, 'В обработке')
            
            deals.append({
                'id': str(lead['id']),
                'name': lead.get('name', 'Без названия'),
                'price': lead.get('price', 0),
                'status_id': status_id,
                'status_name': status_name,
                'pipeline_id': lead.get('pipeline_id'),
                'created_at': lead.get('created_at'),
                'updated_at': lead.get('updated_at'),
                'closed_at': lead.get('closed_at')
            })
        
        print(f'[AMOCRM] Найдено сделок: {len(deals)}')
        
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
            }),
            'isBase64Encoded': False
        }
        
    except requests.exceptions.RequestException as e:
        print(f'[AMOCRM] Ошибка API: {e}')
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка API AmoCRM: {str(e)}'}),
            'isBase64Encoded': False
        }
    except Exception as e:
        print(f'[AMOCRM] Общая ошибка: {e}')
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка обработки данных: {str(e)}'}),
            'isBase64Encoded': False
        }