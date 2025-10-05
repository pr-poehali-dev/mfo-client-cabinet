import json
import os
from typing import Dict, Any
from datetime import datetime

try:
    import psycopg2
except ImportError:
    psycopg2 = None

def get_db_connection():
    '''Создает подключение к БД'''
    if psycopg2 is None:
        raise Exception('psycopg2 module not available')
    dsn = os.environ.get('DATABASE_URL', '')
    if not dsn:
        raise Exception('DATABASE_URL not configured')
    return psycopg2.connect(dsn)

def upsert_client(conn, client_data: Dict[str, Any]) -> None:
    '''Создает или обновляет данные клиента в БД'''
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO amocrm_clients (
            id, phone, name, first_name, last_name, middle_name, 
            email, last_sync_at, amocrm_created_at, raw_data
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (id) DO UPDATE SET
            phone = EXCLUDED.phone,
            name = EXCLUDED.name,
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            middle_name = EXCLUDED.middle_name,
            email = EXCLUDED.email,
            last_sync_at = EXCLUDED.last_sync_at,
            amocrm_created_at = EXCLUDED.amocrm_created_at,
            raw_data = EXCLUDED.raw_data,
            updated_at = CURRENT_TIMESTAMP
    ''', (
        client_data['id'],
        client_data.get('phone', ''),
        client_data.get('name', ''),
        client_data.get('first_name', ''),
        client_data.get('last_name', ''),
        client_data.get('middle_name', ''),
        client_data.get('email', ''),
        datetime.now(),
        datetime.fromtimestamp(client_data.get('created_at', 0)),
        json.dumps(client_data)
    ))
    
    conn.commit()
    cursor.close()

def upsert_deal(conn, deal_data: Dict[str, Any], client_id: int) -> None:
    '''Создает или обновляет сделку в БД'''
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO amocrm_deals (
            id, client_id, name, price, status, status_id, 
            status_name, status_color, pipeline_id, pipeline_name,
            responsible_user_id, amocrm_created_at, amocrm_updated_at,
            custom_fields, raw_data
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            price = EXCLUDED.price,
            status = EXCLUDED.status,
            status_id = EXCLUDED.status_id,
            status_name = EXCLUDED.status_name,
            status_color = EXCLUDED.status_color,
            pipeline_id = EXCLUDED.pipeline_id,
            pipeline_name = EXCLUDED.pipeline_name,
            responsible_user_id = EXCLUDED.responsible_user_id,
            amocrm_updated_at = EXCLUDED.amocrm_updated_at,
            custom_fields = EXCLUDED.custom_fields,
            raw_data = EXCLUDED.raw_data,
            updated_at = CURRENT_TIMESTAMP
    ''', (
        deal_data['id'],
        client_id,
        deal_data.get('name', ''),
        deal_data.get('price', 0),
        deal_data.get('status', ''),
        deal_data.get('status_id', 0),
        deal_data.get('status_name', ''),
        deal_data.get('status_color', '#cccccc'),
        deal_data.get('pipeline_id', 0),
        deal_data.get('pipeline_name', ''),
        deal_data.get('responsible_user_id', 0),
        datetime.fromtimestamp(deal_data.get('created_at', 0)),
        datetime.fromtimestamp(deal_data.get('updated_at', 0)),
        json.dumps(deal_data.get('custom_fields', [])),
        json.dumps(deal_data)
    ))
    
    conn.commit()
    cursor.close()

def save_webhook_notification(conn, lead_id: int, status_id: int, old_status_id: int = None) -> None:
    '''Сохраняет уведомление о смене статуса для последующей отправки клиенту'''
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO webhook_notifications (
            lead_id, new_status_id, old_status_id, created_at, delivered
        ) VALUES (%s, %s, %s, CURRENT_TIMESTAMP, FALSE)
    ''', (lead_id, status_id, old_status_id))
    
    conn.commit()
    cursor.close()

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Webhook для приема уведомлений от AmoCRM об изменениях контактов и сделок
    Args: event с httpMethod POST, body содержит webhook данные от AmoCRM
    Returns: HTTP ответ о статусе обработки
    '''
    method: str = event.get('httpMethod', 'GET')
    
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
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        
        print(f'[INFO] Webhook received: {json.dumps(body_data, ensure_ascii=False)}')
        
        webhook_type = body_data.get('type', '')
        webhook_data = body_data.get('data', {})
        
        conn = get_db_connection()
        
        if webhook_type == 'contact_update' or webhook_type == 'contact_add':
            contact = webhook_data.get('contact', {})
            if contact:
                upsert_client(conn, contact)
                print(f'[INFO] Client {contact.get("id")} synced to DB')
        
        elif webhook_type == 'lead_update' or webhook_type == 'lead_add':
            lead = webhook_data.get('lead', {})
            contacts = webhook_data.get('contacts', [])
            
            if lead and contacts:
                client_id = contacts[0].get('id')
                if client_id:
                    old_status_id = lead.get('old_status_id')
                    new_status_id = lead.get('status_id')
                    
                    upsert_deal(conn, lead, client_id)
                    print(f'[INFO] Deal {lead.get("id")} synced to DB')
                    
                    if old_status_id and new_status_id and old_status_id != new_status_id:
                        save_webhook_notification(conn, lead.get('id'), new_status_id, old_status_id)
                        print(f'[INFO] Status change notification saved for lead {lead.get("id")}')
        
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'success': True, 'message': 'Webhook processed'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f'[ERROR] Webhook processing failed: {str(e)}')
        import traceback
        print(f'[ERROR] Traceback: {traceback.format_exc()}')
        
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e), 'type': type(e).__name__}),
            'isBase64Encoded': False
        }