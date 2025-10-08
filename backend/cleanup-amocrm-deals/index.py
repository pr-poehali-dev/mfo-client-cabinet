'''
Business: Удаление дублирующихся заявок в AmoCRM - оставить только одну заявку на клиента
Args: event - dict с httpMethod, queryStringParameters (dry_run=true для тестового запуска)
      context - объект с request_id, function_name
Returns: HTTP response с результатами очистки
'''

import json
import os
import requests
from typing import Dict, Any, List, Set
from collections import defaultdict

def normalize_phone(phone: str) -> str:
    '''Нормализация телефона к единому формату'''
    clean = ''.join(filter(str.isdigit, phone))
    if clean.startswith('8'):
        clean = '7' + clean[1:]
    if not clean.startswith('7'):
        clean = '7' + clean
    return clean

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
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'Only POST allowed'}),
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
    
    params = event.get('queryStringParameters', {}) or {}
    dry_run = params.get('dry_run', 'false').lower() == 'true'
    
    headers = {
        'Authorization': f'Bearer {amocrm_token}',
        'Content-Type': 'application/json'
    }
    
    try:
        # Получаем ВСЕ сделки
        all_leads: List[Dict[str, Any]] = []
        page = 1
        
        while True:
            leads_response = requests.get(
                f'https://{amocrm_domain}/api/v4/leads',
                headers=headers,
                params={'limit': 250, 'page': page, 'with': 'contacts'},
                timeout=30
            )
            
            if leads_response.status_code != 200:
                break
                
            leads_data = leads_response.json()
            leads = leads_data.get('_embedded', {}).get('leads', [])
            
            if not leads:
                break
                
            all_leads.extend(leads)
            page += 1
            
            if len(leads) < 250:
                break
        
        # Группируем сделки по контактам (телефонам)
        contact_to_leads: Dict[int, List[Dict[str, Any]]] = defaultdict(list)
        
        for lead in all_leads:
            contacts = lead.get('_embedded', {}).get('contacts', [])
            for contact in contacts:
                contact_id = contact.get('id')
                if contact_id:
                    contact_to_leads[contact_id].append(lead)
        
        # Находим дубли: контакты с несколькими заявками
        duplicates_found = 0
        leads_to_delete: List[int] = []
        contact_details: List[Dict[str, Any]] = []
        
        for contact_id, leads in contact_to_leads.items():
            if len(leads) > 1:
                duplicates_found += 1
                
                # Сортируем по дате обновления (новые первые)
                sorted_leads = sorted(leads, key=lambda x: x.get('updated_at', 0), reverse=True)
                
                # Первую (самую новую) оставляем, остальные удаляем
                keep_lead = sorted_leads[0]
                delete_leads = sorted_leads[1:]
                
                for lead in delete_leads:
                    leads_to_delete.append(lead.get('id'))
                
                contact_details.append({
                    'contact_id': contact_id,
                    'total_leads': len(leads),
                    'kept_lead_id': keep_lead.get('id'),
                    'deleted_lead_ids': [l.get('id') for l in delete_leads]
                })
        
        # Удаление дублирующихся заявок
        deleted_count = 0
        
        if not dry_run and leads_to_delete:
            # Удаляем по одной (AmoCRM не поддерживает массовое удаление)
            for lead_id in leads_to_delete:
                delete_response = requests.delete(
                    f'https://{amocrm_domain}/api/v4/leads/{lead_id}',
                    headers=headers,
                    timeout=10
                )
                
                if delete_response.status_code in [200, 204]:
                    deleted_count += 1
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'dry_run': dry_run,
                'total_leads': len(all_leads),
                'duplicates_found': duplicates_found,
                'leads_to_delete': len(leads_to_delete),
                'deleted_count': deleted_count if not dry_run else 0,
                'contact_details': contact_details[:10],
                'message': f'{"[ТЕСТ] " if dry_run else ""}Найдено {duplicates_found} контактов с дублями. {"Будет удалено" if dry_run else "Удалено"} {len(leads_to_delete)} заявок.'
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
