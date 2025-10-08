import json
import os
import psycopg2
import requests
from typing import Dict, Any
from datetime import datetime

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Create new deal linked to client phone number
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
    
    # Нормализуем телефон: убираем все кроме цифр, добавляем +
    clean_phone = ''.join(filter(str.isdigit, phone))
    if clean_phone.startswith('8'):
        clean_phone = '7' + clean_phone[1:]
    if not clean_phone.startswith('7'):
        clean_phone = '7' + clean_phone
    normalized_phone = '+' + clean_phone
    
    database_url = os.environ.get('DATABASE_URL')
    amocrm_domain = os.environ.get('AMOCRM_DOMAIN', '')
    amocrm_token = os.environ.get('AMOCRM_ACCESS_TOKEN', '')
    
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database not configured'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    
    # Находим или создаём клиента в amocrm_clients
    cur.execute(
        f"SELECT id FROM t_p14771149_mfo_client_cabinet.amocrm_clients WHERE phone = '{normalized_phone}'"
    )
    client_row = cur.fetchone()
    
    if client_row:
        client_id = client_row[0]
    else:
        # Создаём временный ID для нового клиента
        temp_client_id = int(datetime.now().timestamp() * 1000)
        now_iso = datetime.now().isoformat()
        cur.execute(
            f"""INSERT INTO t_p14771149_mfo_client_cabinet.amocrm_clients 
               (id, phone, name, created_at, updated_at, last_sync_at) 
               VALUES ({temp_client_id}, '{normalized_phone}', 'Новый клиент', '{now_iso}', '{now_iso}', '{now_iso}')"""
        )
        client_id = temp_client_id
        conn.commit()
    
    # Создаём сделку в AmoCRM (если есть токен)
    amocrm_deal_id = None
    if amocrm_domain and amocrm_token:
        try:
            print(f"DEBUG: Attempting to create deal in AmoCRM for phone {normalized_phone}")
            headers = {
                'Authorization': f'Bearer {amocrm_token}',
                'Content-Type': 'application/json'
            }
            
            # Базовые данные сделки без кастомных полей
            deal_data = [{
                'name': f'Заявка на {amount} руб. (ЛК)',
                'price': int(amount)
            }]
            
            print(f"DEBUG: Sending to AmoCRM: {json.dumps(deal_data)}")
            
            response = requests.post(
                f'https://{amocrm_domain}/api/v4/leads',
                headers=headers,
                json=deal_data,
                timeout=10
            )
            
            print(f"DEBUG: AmoCRM response status: {response.status_code}")
            
            if response.status_code in [200, 201]:
                result = response.json()
                print(f"DEBUG: AmoCRM response: {json.dumps(result)}")
                if result.get('_embedded', {}).get('leads'):
                    amocrm_deal_id = result['_embedded']['leads'][0]['id']
                    print(f"DEBUG: Created deal in AmoCRM with ID: {amocrm_deal_id}")
            else:
                print(f"DEBUG: AmoCRM error: {response.text}")
        except Exception as e:
            print(f"DEBUG: Exception creating AmoCRM deal: {str(e)}")
    
    # Сохраняем сделку в БД
    deal_name = f'Заявка на {amount} руб.'
    deal_id_value = amocrm_deal_id if amocrm_deal_id else int(datetime.now().timestamp() * 1000)
    now_iso = datetime.now().isoformat()
    custom_fields_json = json.dumps({'loan_term': loan_term, 'purpose': purpose}).replace("'", "''")
    deal_name_escaped = deal_name.replace("'", "''")
    
    # Проверяем, нет ли уже такой сделки (защита от дублей)
    cur.execute(
        f"SELECT id FROM t_p14771149_mfo_client_cabinet.amocrm_deals WHERE id = {deal_id_value}"
    )
    existing_deal = cur.fetchone()
    
    if not existing_deal:
        cur.execute(
            f"""INSERT INTO t_p14771149_mfo_client_cabinet.amocrm_deals 
               (id, client_id, name, price, status, status_id, status_name, status_color, 
                pipeline_id, pipeline_name, created_at, updated_at, custom_fields) 
               VALUES ({deal_id_value}, {client_id}, '{deal_name_escaped}', {amount}, 'new', 
                       1, 'Новая заявка', '#99ccff', 1, 'Основная воронка', 
                       '{now_iso}', '{now_iso}', '{custom_fields_json}')"""
        )
        conn.commit()
    
    deal_id = deal_id_value
    
    cur.close()
    conn.close()
    
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