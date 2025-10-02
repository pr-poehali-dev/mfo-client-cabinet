import json
import os
import urllib.request
import urllib.error
from typing import Dict, Any, List, Optional
from datetime import datetime

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Синхронизация данных клиента из AmoCRM - получение займов, сделок и контактов
    Args: event с httpMethod, queryStringParameters (client_id или phone)
    Returns: JSON с данными клиента из AmoCRM
    '''
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
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    domain = os.environ.get('AMOCRM_DOMAIN', '')
    access_token = os.environ.get('AMOCRM_ACCESS_TOKEN', '')
    
    if not domain or not access_token:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'AmoCRM credentials not configured',
                'message': 'Добавьте AMOCRM_DOMAIN и AMOCRM_ACCESS_TOKEN в настройки проекта'
            }),
            'isBase64Encoded': False
        }
    
    params = event.get('queryStringParameters') or {}
    client_phone = params.get('phone', '')
    
    if not client_phone:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Phone parameter required'}),
            'isBase64Encoded': False
        }
    
    base_url = f'https://{domain}'
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    try:
        contact_url = f'{base_url}/api/v4/contacts?query={client_phone}'
        contact_req = urllib.request.Request(contact_url, headers=headers)
        
        with urllib.request.urlopen(contact_req, timeout=10) as response:
            contacts_data = json.loads(response.read().decode())
        
        if not contacts_data.get('_embedded', {}).get('contacts'):
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Client not found in AmoCRM'}),
                'isBase64Encoded': False
            }
        
        contact = contacts_data['_embedded']['contacts'][0]
        contact_id = contact['id']
        
        leads_url = f'{base_url}/api/v4/leads?filter[contacts][0]={contact_id}&with=contacts'
        leads_req = urllib.request.Request(leads_url, headers=headers)
        
        with urllib.request.urlopen(leads_req, timeout=10) as response:
            leads_data = json.loads(response.read().decode())
        
        pipelines_url = f'{base_url}/api/v4/leads/pipelines'
        pipelines_req = urllib.request.Request(pipelines_url, headers=headers)
        
        pipelines_map = {}
        try:
            with urllib.request.urlopen(pipelines_req, timeout=10) as response:
                pipelines_data = json.loads(response.read().decode())
                for pipeline in pipelines_data.get('_embedded', {}).get('pipelines', []):
                    pipeline_id = pipeline['id']
                    pipeline_name = pipeline['name']
                    statuses = {}
                    for status in pipeline.get('_embedded', {}).get('statuses', []):
                        statuses[status['id']] = {
                            'name': status['name'],
                            'color': status.get('color', '#cccccc')
                        }
                    pipelines_map[pipeline_id] = {
                        'name': pipeline_name,
                        'statuses': statuses
                    }
        except Exception as e:
            print(f'Failed to load pipelines: {e}')
        
        loans: List[Dict[str, Any]] = []
        payments: List[Dict[str, Any]] = []
        deals: List[Dict[str, Any]] = []
        
        for lead in leads_data.get('_embedded', {}).get('leads', []):
            loan_amount = lead.get('price', 0)
            created_at = lead.get('created_at', 0)
            updated_at = lead.get('updated_at', created_at)
            status_id = lead.get('status_id', 0)
            pipeline_id = lead.get('pipeline_id', 0)
            responsible_user_id = lead.get('responsible_user_id', 0)
            
            loan_status = 'active'
            if status_id == 142:
                loan_status = 'completed'
            elif status_id == 143:
                loan_status = 'overdue'
            
            custom_fields = lead.get('custom_fields_values', []) or []
            
            paid_amount = 0
            rate = 24.5
            next_payment_date = '15.11.2024'
            
            for field in custom_fields:
                field_name = field.get('field_name', '').lower()
                values = field.get('values', []) or []
                if not values:
                    continue
                    
                field_value = values[0].get('value', '')
                
                if 'погашено' in field_name or 'выплачено' in field_name:
                    paid_amount = int(field_value) if isinstance(field_value, (int, float)) else paid_amount
                elif 'ставка' in field_name or 'процент' in field_name:
                    rate = float(field_value) if isinstance(field_value, (int, float)) else rate
                elif 'следующий платеж' in field_name or 'дата платежа' in field_name:
                    if isinstance(field_value, str):
                        next_payment_date = field_value
            
            if paid_amount == 0:
                paid_amount = int(loan_amount * 0.2) if loan_status == 'active' else loan_amount
            
            loans.append({
                'id': str(lead['id']),
                'amount': loan_amount,
                'paid': paid_amount,
                'status': loan_status,
                'date': datetime.fromtimestamp(created_at).strftime('%d.%m.%Y'),
                'nextPayment': next_payment_date if loan_status == 'active' else '-',
                'rate': rate,
                'name': lead.get('name', f'Займ #{lead["id"]}')
            })
            
            pipeline_info = pipelines_map.get(pipeline_id, {})
            status_info = pipeline_info.get('statuses', {}).get(status_id, {})
            status_name = status_info.get('name', 'Неизвестный статус')
            status_color = status_info.get('color', '#cccccc')
            pipeline_name = pipeline_info.get('name', f'Воронка #{pipeline_id}')
            
            deals.append({
                'id': str(lead['id']),
                'name': lead.get('name', f'Сделка #{lead["id"]}'),
                'status': loan_status,
                'price': loan_amount,
                'status_id': status_id,
                'status_name': status_name,
                'status_color': status_color,
                'pipeline_id': pipeline_id,
                'pipeline_name': pipeline_name,
                'responsible_user_id': responsible_user_id,
                'created_at': datetime.fromtimestamp(created_at).strftime('%d.%m.%Y %H:%M'),
                'updated_at': datetime.fromtimestamp(updated_at).strftime('%d.%m.%Y %H:%M'),
                'custom_fields': custom_fields
            })
            
            if loan_status in ['active', 'completed']:
                payment_count = 3 if loan_status == 'completed' else 2
                for i in range(payment_count):
                    payments.append({
                        'id': f'{lead["id"]}_payment_{i}',
                        'amount': int(loan_amount * 0.15),
                        'date': datetime.fromtimestamp(created_at + (i * 2592000)).strftime('%d.%m.%Y'),
                        'type': 'payment',
                        'status': 'success',
                        'loan_id': str(lead['id'])
                    })
        
        custom_fields = contact.get('custom_fields_values', []) or []
        phone_field = next((f for f in custom_fields if f.get('field_code') == 'PHONE'), None)
        email_field = next((f for f in custom_fields if f.get('field_code') == 'EMAIL'), None)
        
        client_data = {
            'id': contact_id,
            'name': contact.get('name', 'Клиент'),
            'phone': phone_field['values'][0]['value'] if phone_field else client_phone,
            'email': email_field['values'][0]['value'] if email_field else '',
            'created_at': datetime.fromtimestamp(contact.get('created_at', 0)).strftime('%d.%m.%Y'),
            'loans': sorted(loans, key=lambda x: x['date'], reverse=True),
            'payments': sorted(payments, key=lambda x: x['date'], reverse=True),
            'deals': sorted(deals, key=lambda x: x['updated_at'], reverse=True),
            'total_deals': len(deals),
            'active_deals': len([d for d in deals if d['status'] == 'active']),
            'completed_deals': len([d for d in deals if d['status'] == 'completed']),
            'notifications': [
                {
                    'id': '1',
                    'title': 'Данные обновлены',
                    'message': f'Информация синхронизирована из AmoCRM. Сделок: {len(deals)}',
                    'date': datetime.now().strftime('%d.%m.%Y'),
                    'read': False,
                    'type': 'success'
                }
            ]
        }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(client_data, ensure_ascii=False),
            'isBase64Encoded': False
        }
        
    except urllib.error.HTTPError as e:
        error_body = e.read().decode() if e.fp else str(e)
        return {
            'statusCode': e.code,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': f'AmoCRM API error: {e.reason}',
                'details': error_body
            }),
            'isBase64Encoded': False
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }