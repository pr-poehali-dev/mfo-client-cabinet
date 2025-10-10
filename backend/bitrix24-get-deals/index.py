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
        # Ищем контакт по телефону
        contact_filter = {
            'PHONE': phone
        }
        
        contact_url = f"{webhook_url}/crm.contact.list.json"
        contact_data = urllib.parse.urlencode({'filter': contact_filter}).encode()
        
        contact_req = urllib.request.Request(contact_url, data=contact_data)
        with urllib.request.urlopen(contact_req) as response:
            contact_result = json.loads(response.read().decode())
        
        if not contact_result.get('result'):
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Contact not found', 'not_found': True})
            }
        
        contact = contact_result['result'][0]
        contact_id = contact['ID']
        client_name = f"{contact.get('NAME', '')} {contact.get('LAST_NAME', '')}".strip()
        
        # Получаем сделки контакта
        deal_filter = {
            'CONTACT_ID': contact_id
        }
        
        deal_url = f"{webhook_url}/crm.deal.list.json"
        deal_params = {
            'filter': deal_filter,
            'select': ['ID', 'TITLE', 'STAGE_ID', 'OPPORTUNITY', 'DATE_CREATE', 'DATE_MODIFY']
        }
        deal_data = urllib.parse.urlencode(deal_params).encode()
        
        deal_req = urllib.request.Request(deal_url, data=deal_data)
        with urllib.request.urlopen(deal_req) as response:
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