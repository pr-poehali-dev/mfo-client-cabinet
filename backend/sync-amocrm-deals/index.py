import json
import os
import psycopg2
import requests
from typing import Dict, Any
from datetime import datetime

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Sync all deals from AmoCRM to database
    Args: event - dict with httpMethod
    Returns: HTTP response with sync results
    '''
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
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    database_url = os.environ.get('DATABASE_URL')
    amocrm_domain = os.environ.get('AMOCRM_DOMAIN', 'stepanmalik88.amocrm.ru')
    amocrm_token = os.environ.get('AMOCRM_ACCESS_TOKEN', '')
    
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database not configured'}),
            'isBase64Encoded': False
        }
    
    if not amocrm_token:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'AmoCRM token not configured'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    
    synced_deals = 0
    skipped_deals = 0
    new_deals = 0
    
    try:
        # Получаем все сделки из AmoCRM
        headers = {
            'Authorization': f'Bearer {amocrm_token}',
            'Content-Type': 'application/json'
        }
        
        page = 1
        limit = 250
        
        while True:
            response = requests.get(
                f'https://{amocrm_domain}/api/v4/leads',
                headers=headers,
                params={'limit': limit, 'page': page, 'with': 'contacts'},
                timeout=30
            )
            
            if response.status_code != 200:
                break
            
            data = response.json()
            leads = data.get('_embedded', {}).get('leads', [])
            
            if not leads:
                break
            
            for lead in leads:
                deal_id = lead.get('id')
                
                # Проверяем, есть ли уже такая сделка
                cur.execute(
                    f"SELECT id FROM t_p14771149_mfo_client_cabinet.amocrm_deals WHERE id = {deal_id}"
                )
                existing_deal = cur.fetchone()
                
                if existing_deal:
                    skipped_deals += 1
                    continue
                
                # Получаем контакт (телефон клиента)
                contacts = lead.get('_embedded', {}).get('contacts', [])
                if not contacts:
                    continue
                
                contact_id = contacts[0].get('id')
                
                # Получаем данные контакта
                contact_response = requests.get(
                    f'https://{amocrm_domain}/api/v4/contacts/{contact_id}',
                    headers=headers,
                    timeout=10
                )
                
                if contact_response.status_code != 200:
                    continue
                
                contact_data = contact_response.json()
                phone = None
                
                # Ищем телефон в custom_fields_values
                for field in contact_data.get('custom_fields_values', []):
                    if field.get('field_code') == 'PHONE':
                        values = field.get('values', [])
                        if values:
                            phone = values[0].get('value', '')
                            break
                
                if not phone:
                    continue
                
                # Нормализуем телефон
                clean_phone = ''.join(filter(str.isdigit, phone))
                if clean_phone.startswith('8'):
                    clean_phone = '7' + clean_phone[1:]
                if not clean_phone.startswith('7'):
                    clean_phone = '7' + clean_phone
                normalized_phone = '+' + clean_phone
                
                # Находим или создаём клиента
                cur.execute(
                    f"SELECT id FROM t_p14771149_mfo_client_cabinet.amocrm_clients WHERE phone = '{normalized_phone}'"
                )
                client_row = cur.fetchone()
                
                if client_row:
                    client_id = client_row[0]
                else:
                    # Создаём клиента
                    temp_client_id = int(datetime.now().timestamp() * 1000)
                    now_iso = datetime.now().isoformat()
                    contact_name = contact_data.get('name', 'Новый клиент')
                    cur.execute(
                        f"""INSERT INTO t_p14771149_mfo_client_cabinet.amocrm_clients 
                           (id, phone, name, created_at, updated_at, last_sync_at) 
                           VALUES ({temp_client_id}, '{normalized_phone}', '{contact_name}', '{now_iso}', '{now_iso}', '{now_iso}')"""
                    )
                    client_id = temp_client_id
                    conn.commit()
                
                # Создаём сделку в БД
                deal_name = lead.get('name', 'Заявка').replace("'", "''")
                price = lead.get('price', 0)
                status_id = lead.get('status_id', 0)
                pipeline_id = lead.get('pipeline_id', 0)
                created_at = datetime.fromtimestamp(lead.get('created_at', 0)).isoformat() if lead.get('created_at') else datetime.now().isoformat()
                updated_at = datetime.fromtimestamp(lead.get('updated_at', 0)).isoformat() if lead.get('updated_at') else datetime.now().isoformat()
                
                cur.execute(
                    f"""INSERT INTO t_p14771149_mfo_client_cabinet.amocrm_deals 
                       (id, client_id, name, price, status, status_id, status_name, status_color, 
                        pipeline_id, pipeline_name, created_at, updated_at, custom_fields) 
                       VALUES ({deal_id}, {client_id}, '{deal_name}', {price}, 'synced', 
                               {status_id}, 'Синхронизировано', '#cccccc', {pipeline_id}, 'Основная воронка', 
                               '{created_at}', '{updated_at}', '{{}}')"""
                )
                conn.commit()
                new_deals += 1
                synced_deals += 1
            
            page += 1
            
            # Ограничиваем количество страниц для безопасности
            if page > 10:
                break
    
    except Exception as e:
        print(f"Sync error: {str(e)}")
        cur.close()
        conn.close()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Sync failed: {str(e)}'}),
            'isBase64Encoded': False
        }
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'success': True,
            'synced_deals': synced_deals,
            'new_deals': new_deals,
            'skipped_deals': skipped_deals,
            'message': f'Синхронизировано {new_deals} новых заявок из AmoCRM'
        }),
        'isBase64Encoded': False
    }
