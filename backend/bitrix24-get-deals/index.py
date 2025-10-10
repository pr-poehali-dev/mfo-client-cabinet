'''
Business: Получение сделок клиента из Битрикс24 по номеру телефона
Args: event с httpMethod, queryStringParameters (phone)
Returns: HTTP response с данными сделок клиента
'''

import json
import os
import urllib.request
import urllib.parse
from typing import Dict, Any, List

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
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
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    params = event.get('queryStringParameters', {})
    phone = params.get('phone', '')
    
    webhook_url = os.environ.get('BITRIX24_WEBHOOK_URL', '').rstrip('/')
    if not webhook_url:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'BITRIX24_WEBHOOK_URL not configured'})
        }
    
    if not phone:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Phone parameter required'})
        }
    
    try:
        clean_phone = phone.replace('+', '').replace('-', '').replace('(', '').replace(')', '').replace(' ', '')
        
        # Ищем контакт через crm.duplicate.findbycomm
        search_params = urllib.parse.urlencode({
            'PHONE': clean_phone,
            'TYPE': 'PHONE'
        })
        duplicate_url = f"{webhook_url}/crm.duplicate.findbycomm?{search_params}"
        
        dup_req = urllib.request.Request(duplicate_url)
        with urllib.request.urlopen(dup_req, timeout=10) as response:
            duplicate_data = json.loads(response.read().decode())
        
        contact_entities = duplicate_data.get('result', {}).get('CONTACT', [])
        
        if not contact_entities:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Contact not found', 'not_found': True})
            }
        
        contact_id = contact_entities[0]
        
        # Получаем полные данные контакта
        contact_get_url = f"{webhook_url}/crm.contact.get?id={contact_id}"
        contact_get_req = urllib.request.Request(contact_get_url)
        
        with urllib.request.urlopen(contact_get_req, timeout=10) as contact_response:
            contact_result = json.loads(contact_response.read().decode())
        
        contact = contact_result.get('result', {})
        client_name = f"{contact.get('NAME', '')} {contact.get('LAST_NAME', '')}".strip()
        
        # Получаем сделки контакта
        deal_params = urllib.parse.urlencode({
            'filter[CONTACT_ID]': contact_id,
            'select[]': 'ID',
            'select[]': 'TITLE',
            'select[]': 'STAGE_ID',
            'select[]': 'OPPORTUNITY',
            'select[]': 'DATE_CREATE',
            'select[]': 'DATE_MODIFY'
        })
        
        deal_url = f"{webhook_url}/crm.deal.list?{deal_params}"
        deal_req = urllib.request.Request(deal_url)
        
        with urllib.request.urlopen(deal_req, timeout=10) as response:
            deal_result = json.loads(response.read().decode())
        
        deals = []
        for deal in deal_result.get('result', []):
            deals.append({
                'id': int(deal['ID']),
                'name': deal.get('TITLE', 'Без названия'),
                'stage_id': deal.get('STAGE_ID', ''),
                'price': float(deal.get('OPPORTUNITY', 0)),
                'created_at': deal.get('DATE_CREATE', ''),
                'updated_at': deal.get('DATE_MODIFY', '')
            })
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({
                'success': True,
                'client': {
                    'id': contact_id,
                    'name': client_name,
                    'phone': phone
                },
                'deals': deals,
                'total': len(deals)
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': f'Bitrix24 API error: {str(e)}'})
        }