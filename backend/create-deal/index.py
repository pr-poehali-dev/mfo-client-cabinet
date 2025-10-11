import json
import os
import requests
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Create new deal in AmoCRM
    Args: event - dict with httpMethod, body (phone, amount, loanTerm, purpose)
    Returns: HTTP response with deal_id
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body = event.get('body', '')
    if not body:
        body = '{}'
    body_data = json.loads(body)
    phone = body_data.get('phone', '').strip()
    amount = body_data.get('amount', 0)
    loan_term = body_data.get('loanTerm', 0)
    purpose = body_data.get('purpose', '').strip()
    
    if not phone or not amount:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Phone and amount are required'}),
            'isBase64Encoded': False
        }
    
    # Нормализуем телефон
    clean_phone = ''.join(filter(str.isdigit, phone))
    if clean_phone.startswith('8'):
        clean_phone = '7' + clean_phone[1:]
    if not clean_phone.startswith('7'):
        clean_phone = '7' + clean_phone
    normalized_phone = '+' + clean_phone
    
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
            'body': json.dumps({'error': 'AmoCRM не настроен'}),
            'isBase64Encoded': False
        }
    
    # Создаём сделку в AmoCRM
    try:
        print(f"Создание сделки в AmoCRM для {normalized_phone}")
        headers = {
            'Authorization': f'Bearer {amocrm_token}',
            'Content-Type': 'application/json'
        }
        
        deal_data = [{
            'name': f'Заявка на {amount} руб. (срок {loan_term} мес.)',
            'price': int(amount)
        }]
        
        print(f"Данные сделки: {json.dumps(deal_data)}")
        
        response = requests.post(
            f'https://{amocrm_domain}/api/v4/leads',
            headers=headers,
            json=deal_data,
            timeout=10
        )
        
        print(f"AmoCRM ответ: {response.status_code}")
        
        if response.status_code in [200, 201]:
            result = response.json()
            if result.get('_embedded', {}).get('leads'):
                deal_id = result['_embedded']['leads'][0]['id']
                print(f"Создана сделка ID: {deal_id}")
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'deal_id': str(deal_id),
                        'message': 'Заявка успешно создана'
                    }),
                    'isBase64Encoded': False
                }
        
        error_text = response.text
        print(f"Ошибка AmoCRM: {error_text}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка создания сделки: {error_text}'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f"Ошибка: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка: {str(e)}'}),
            'isBase64Encoded': False
        }