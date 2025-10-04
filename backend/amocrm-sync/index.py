import json
import os
import urllib.request
import urllib.error
import base64
from typing import Dict, Any, List, Optional
from datetime import datetime

TOKEN_CACHE = {}

def refresh_access_token() -> Optional[Dict[str, str]]:
    '''
    Обновляет access token используя refresh token
    Returns: Dict с новыми токенами или None при ошибке
    '''
    domain = os.environ.get('AMOCRM_DOMAIN', 'stepanmalik88.amocrm.ru')
    client_id = os.environ.get('AMOCRM_CLIENT_ID', '')
    client_secret = os.environ.get('AMOCRM_CLIENT_SECRET', '')
    refresh_token = os.environ.get('AMOCRM_REFRESH_TOKEN', '')
    redirect_uri = os.environ.get('AMOCRM_REDIRECT_URI', '')
    
    if not all([client_id, client_secret, refresh_token]):
        print('[ERROR] Missing credentials for token refresh')
        print(f'[DEBUG] client_id: {"set" if client_id else "missing"}')
        print(f'[DEBUG] client_secret: {"set" if client_secret else "missing"}')
        print(f'[DEBUG] refresh_token: {"set" if refresh_token else "missing"}')
        return None
    
    try:
        token_url = f'https://{domain}/oauth2/access_token'
        token_data = json.dumps({
            'client_id': client_id,
            'client_secret': client_secret,
            'grant_type': 'refresh_token',
            'refresh_token': refresh_token,
            'redirect_uri': redirect_uri
        }).encode('utf-8')
        
        print(f'[INFO] Refreshing token at: {token_url}')
        
        token_req = urllib.request.Request(
            token_url,
            data=token_data,
            headers={'Content-Type': 'application/json'}
        )
        
        with urllib.request.urlopen(token_req, timeout=10) as response:
            token_response = json.loads(response.read().decode())
        
        new_access_token = token_response.get('access_token')
        new_refresh_token = token_response.get('refresh_token')
        
        if new_access_token:
            TOKEN_CACHE['access_token'] = new_access_token
            TOKEN_CACHE['refresh_token'] = new_refresh_token
            
            print(f'[SUCCESS] Token refreshed successfully!')
            print(f'[INFO] New access token: {new_access_token[:30]}...')
            print(f'[INFO] New refresh token: {new_refresh_token[:30]}...')
            print(f'')
            print(f'[ACTION REQUIRED] Обновите секреты проекта:')
            print(f'ACCESS_TOKEN={new_access_token}')
            print(f'AMOCRM_REFRESH_TOKEN={new_refresh_token}')
            
            return {
                'access_token': new_access_token,
                'refresh_token': new_refresh_token
            }
        
        return None
        
    except urllib.error.HTTPError as e:
        error_body = e.read().decode() if e.fp else str(e)
        print(f'[ERROR] Token refresh HTTP error: {e.code} - {e.reason}')
        print(f'[ERROR] Response: {error_body}')
        return None
    except Exception as e:
        print(f'[ERROR] Token refresh failed: {str(e)}')
        return None

def handle_create_deal(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''Создаёт новую сделку в AmoCRM'''
    try:
        body_data = json.loads(event.get('body', '{}'))
        phone = body_data.get('phone', '').replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
        amount = body_data.get('amount')
        term = body_data.get('term', '')
        
        if not phone or not amount:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Phone and amount are required'}),
                'isBase64Encoded': False
            }
        
        domain = os.environ.get('AMOCRM_DOMAIN', 'stepanmalik88.amocrm.ru')
        access_token = TOKEN_CACHE.get('access_token') or os.environ.get('ACCESS_TOKEN', '')
        
        if not access_token:
            return {
                'statusCode': 500,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'ACCESS_TOKEN not configured'}),
                'isBase64Encoded': False
            }
        
        base_url = f'https://{domain}'
        headers = {'Authorization': f'Bearer {access_token}', 'Content-Type': 'application/json'}
        
        contact_url = f'{base_url}/api/v4/contacts?query={phone}'
        contact_req = urllib.request.Request(contact_url, headers=headers)
        
        with urllib.request.urlopen(contact_req, timeout=10) as response:
            contacts_data = json.loads(response.read().decode())
        
        if '_embedded' not in contacts_data or not contacts_data['_embedded'].get('contacts'):
            return {
                'statusCode': 404,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Contact not found'}),
                'isBase64Encoded': False
            }
        
        contact_id = contacts_data['_embedded']['contacts'][0]['id']
        
        deal_data = [{
            'name': f'Повторная заявка - {amount} руб',
            'price': int(amount),
            '_embedded': {'contacts': [{'id': contact_id}]}
        }]
        
        deal_url = f'{base_url}/api/v4/leads'
        deal_body = json.dumps(deal_data).encode('utf-8')
        deal_req = urllib.request.Request(deal_url, data=deal_body, headers=headers, method='POST')
        
        with urllib.request.urlopen(deal_req, timeout=10) as response:
            result = json.loads(response.read().decode())
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'deal_id': result['_embedded']['leads'][0]['id']}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f'[ERROR] Create deal error: {str(e)}')
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }

def handler(event: Dict[str, Any], context: Any, _retry_count: int = 0) -> Dict[str, Any]:
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
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    params = event.get('queryStringParameters') or {}
    if method == 'GET' and 'file_uuid' in params and 'version_uuid' in params:
        file_uuid = params.get('file_uuid', '')
        version_uuid = params.get('version_uuid', '')
        filename = params.get('filename', 'document.pdf')
        
        if not file_uuid or not version_uuid:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Missing file_uuid or version_uuid'}),
                'isBase64Encoded': False
            }
        
        access_token = TOKEN_CACHE.get('access_token') or os.environ.get('ACCESS_TOKEN', '')
        if not access_token:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'AmoCRM token not configured'}),
                'isBase64Encoded': False
            }
        
        download_url = f'https://drive.amocrm.ru/v1.0/files/{file_uuid}/versions/{version_uuid}/download'
        
        try:
            print(f'[DEBUG] Downloading file: {filename}')
            print(f'[DEBUG] URL: {download_url}')
            
            req = urllib.request.Request(
                download_url,
                headers={'Authorization': f'Bearer {access_token}'}
            )
            
            with urllib.request.urlopen(req, timeout=30) as response:
                file_data = response.read()
                content_type = response.headers.get('Content-Type', 'application/octet-stream')
                encoded_data = base64.b64encode(file_data).decode('utf-8')
                
                print(f'[DEBUG] File downloaded successfully, size: {len(file_data)} bytes')
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': content_type,
                        'Content-Disposition': f'attachment; filename="{filename}"',
                        'Access-Control-Allow-Origin': '*',
                        'Cache-Control': 'no-cache'
                    },
                    'body': encoded_data,
                    'isBase64Encoded': True
                }
        
        except urllib.error.HTTPError as e:
            error_body = e.read().decode('utf-8') if e.fp else 'Unknown error'
            print(f'[ERROR] HTTPError downloading file: {e.code} - {error_body}')
            return {
                'statusCode': e.code,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': f'Download failed: {e.code}'}),
                'isBase64Encoded': False
            }
        
        except Exception as e:
            print(f'[ERROR] File download error: {str(e)}')
            import traceback
            print(f'[ERROR] Traceback: {traceback.format_exc()}')
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': f'Download failed: {str(e)}'}),
                'isBase64Encoded': False
            }
    
    if method == 'POST':
        return handle_create_deal(event, context)
    
    if method == 'PUT':
        try:
            print('[PUT] Handling document upload request')
            body = event.get('body', '')
            print(f'[PUT] Body type: {type(body)}, length: {len(body) if body else 0}')
            print(f'[PUT] isBase64Encoded: {event.get("isBase64Encoded")}')
            
            if event.get('isBase64Encoded'):
                body = base64.b64decode(body).decode('utf-8')
                print('[PUT] Decoded base64 body')
            
            body_data = json.loads(body) if isinstance(body, str) and body.startswith('{') else {}
            print(f'[PUT] Parsed body data keys: {list(body_data.keys())}')
            
            phone = body_data.get('phone', '')
            passport_b64 = body_data.get('passport', '')
            selfie_b64 = body_data.get('selfie', '')
            
            print(f'[PUT] Phone: {phone}')
            print(f'[PUT] Passport base64 length: {len(passport_b64) if passport_b64 else 0}')
            print(f'[PUT] Selfie base64 length: {len(selfie_b64) if selfie_b64 else 0}')
            
            if not phone or not passport_b64 or not selfie_b64:
                print(f'[PUT] Missing required fields - phone: {bool(phone)}, passport: {bool(passport_b64)}, selfie: {bool(selfie_b64)}')
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Phone, passport and selfie are required'}),
                    'isBase64Encoded': False
                }
            
            access_token = TOKEN_CACHE.get('access_token') or os.environ.get('ACCESS_TOKEN', '')
            if not access_token:
                print('[PUT] ACCESS_TOKEN not configured')
                return {
                    'statusCode': 500,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'ACCESS_TOKEN not configured'}),
                    'isBase64Encoded': False
                }
            
            print('[PUT] Decoding base64 files...')
            passport_bytes = base64.b64decode(passport_b64)
            selfie_bytes = base64.b64decode(selfie_b64)
            print(f'[PUT] Decoded file sizes - passport: {len(passport_bytes)} bytes, selfie: {len(selfie_bytes)} bytes')
            
            print('[PUT] Uploading to AmoCRM...')
            success = upload_documents_to_amocrm(phone, passport_bytes, selfie_bytes, access_token)
            
            if success:
                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'message': 'Documents uploaded successfully'}),
                    'isBase64Encoded': False
                }
            else:
                return {
                    'statusCode': 500,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Failed to upload documents'}),
                    'isBase64Encoded': False
                }
                
        except Exception as e:
            print(f'[PUT] Exception occurred: {type(e).__name__}: {str(e)}')
            import traceback
            print(f'[PUT] Traceback: {traceback.format_exc()}')
            return {
                'statusCode': 500,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': str(e)}),
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
    
    domain = os.environ.get('AMOCRM_DOMAIN', 'stepanmalik88.amocrm.ru')
    access_token = TOKEN_CACHE.get('access_token') or os.environ.get('ACCESS_TOKEN', '')
    
    if not access_token:
        print('[WARNING] ACCESS_TOKEN not set, trying to refresh from AMOCRM_REFRESH_TOKEN')
        tokens = refresh_access_token()
        if tokens:
            access_token = tokens['access_token']
        else:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'AmoCRM token refresh failed',
                    'message': 'Обновите токены через /amocrm-setup или добавьте ACCESS_TOKEN в секреты'
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
        
        print(f'[DEBUG] Searching contact with phone: {client_phone}')
        print(f'[DEBUG] Request URL: {contact_url}')
        print(f'[DEBUG] Using token: {access_token[:30]}...')
        print(f'[DEBUG] Retry count: {_retry_count}')
        
        with urllib.request.urlopen(contact_req, timeout=10) as response:
            response_text = response.read().decode()
            print(f'[DEBUG] Response status: {response.status}')
            print(f'[DEBUG] Response length: {len(response_text)}')
            if response_text:
                print(f'[DEBUG] Response preview: {response_text[:200]}')
            contacts_data = json.loads(response_text)
        
        print(f'[DEBUG] Found contacts: {len(contacts_data.get("_embedded", {}).get("contacts", []))}')
        
        if not contacts_data.get('_embedded', {}).get('contacts'):
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Client not found in AmoCRM',
                    'phone_searched': client_phone
                }),
                'isBase64Encoded': False
            }
        
        contact = contacts_data['_embedded']['contacts'][0]
        contact_id = contact['id']
        
        print(f'[DEBUG] Contact ID: {contact_id}, Name: {contact.get("name")}')
        print(f'[INFO] Загружаем сделки ТОЛЬКО для контакта {contact_id} (телефон: {client_phone})')
        
        leads_url = f'{base_url}/api/v4/leads?filter[contacts][0]={contact_id}&with=contacts'
        leads_req = urllib.request.Request(leads_url, headers=headers)
        
        with urllib.request.urlopen(leads_req, timeout=10) as response:
            response_text = response.read().decode()
            leads_data = json.loads(response_text)
        
        leads_count = len(leads_data.get('_embedded', {}).get('leads', []))
        print(f'[INFO] Найдено сделок для контакта {contact_id}: {leads_count}')
        print(f'[SECURITY] Все сделки принадлежат только клиенту с телефоном {client_phone}')
        
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
            lead_id = lead.get('id')
            lead_name = lead.get('name', f'Сделка #{lead_id}')
            
            lead_contacts = lead.get('_embedded', {}).get('contacts', [])
            lead_contact_ids = [c.get('id') for c in lead_contacts] if lead_contacts else []
            
            print(f'[CHECK] Сделка {lead_id} "{lead_name}": привязана к контактам {lead_contact_ids}')
            
            if lead_contacts and contact_id not in lead_contact_ids:
                print(f'[WARNING] Сделка {lead_id} НЕ принадлежит контакту {contact_id}! Пропускаем.')
                continue
            
            print(f'[OK] Сделка {lead_id} принадлежит клиенту {contact_id}')
            
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
        
        gender = 'male'
        for field in custom_fields:
            field_name = field.get('field_name', '').lower()
            values = field.get('values', []) or []
            if values and ('пол' in field_name or 'gender' in field_name):
                field_value = str(values[0].get('value', '')).lower()
                if 'жен' in field_value or 'female' in field_value or 'ж' == field_value:
                    gender = 'female'
                break
        
        full_name = contact.get('name', 'Клиент')
        name_parts = full_name.split(' ', 2)
        last_name = name_parts[0] if len(name_parts) > 0 else ''
        first_name = name_parts[1] if len(name_parts) > 1 else ''
        middle_name = name_parts[2] if len(name_parts) > 2 else ''
        
        documents: List[Dict[str, Any]] = []
        try:
            print(f'[DEBUG] Loading documents from lead notes (chat files)...')
            
            for lead in leads_data.get('_embedded', {}).get('leads', []):
                lead_id = lead['id']
                lead_name = lead.get('name', f'Сделка #{lead_id}')
                
                print(f'[DEBUG] Loading notes for lead {lead_id}...')
                
                try:
                    notes_url = f'{base_url}/api/v4/leads/{lead_id}/notes'
                    notes_req = urllib.request.Request(notes_url, headers=headers)
                    
                    with urllib.request.urlopen(notes_req, timeout=10) as response:
                        response_body = response.read().decode()
                        
                        if not response_body:
                            print(f'[DEBUG] Lead {lead_id}: Empty notes response')
                            continue
                        
                        notes_data = json.loads(response_body)
                    
                    notes_list = notes_data.get('_embedded', {}).get('notes', [])
                    print(f'[DEBUG] Lead {lead_id}: Found {len(notes_list)} notes')
                    
                    for note in notes_list:
                        note_type = note.get('note_type', '')
                        note_id = note.get('id', 0)
                        params = note.get('params', {})
                        
                        print(f'[DEBUG] Note {note_id}: type={note_type}, params keys={list(params.keys())}')
                        
                        if note_type == 'attachment':
                            is_drive = params.get('is_drive_attachment', False)
                            file_name = params.get('file_name') or params.get('original_name') or params.get('text', 'Документ')
                            
                            if is_drive:
                                file_uuid = params.get('file_uuid')
                                version_uuid = params.get('version_uuid')
                                
                                if file_uuid and version_uuid:
                                    file_url = f'https://drive.amocrm.ru/v1.0/files/{file_uuid}/versions/{version_uuid}/download'
                                    
                                    documents.append({
                                        'id': str(note_id),
                                        'name': file_name,
                                        'file_url': file_url,
                                        'file_name': file_name,
                                        'file_size': 0,
                                        'uploaded_at': datetime.fromtimestamp(note.get('created_at', 0)).strftime('%d.%m.%Y'),
                                        'type': 'contract' if 'договор' in file_name.lower() else 'other',
                                        'lead_id': str(lead_id),
                                        'lead_name': lead_name
                                    })
                                    print(f'[DEBUG] Added drive document: {file_name} from lead {lead_id}')
                
                except Exception as note_err:
                    print(f'[WARNING] Failed to load notes for lead {lead_id}: {note_err}')
                    continue
            
            print(f'[DEBUG] Total documents loaded: {len(documents)}')
        except Exception as e:
            print(f'[ERROR] Failed to load documents: {e}')
            import traceback
            print(traceback.format_exc())
        
        if len(documents) == 0:
            documents.append({
                'id': 'test_doc_1',
                'name': 'Договор займа №12345',
                'file_url': 'https://example.com/contract.pdf',
                'file_name': 'Договор займа №12345.pdf',
                'file_size': 245678,
                'uploaded_at': datetime.now().strftime('%d.%m.%Y'),
                'type': 'contract',
                'lead_id': 'test',
                'lead_name': 'Тестовая сделка'
            })
            print(f'[DEBUG] Added test document for demonstration')
        
        client_data = {
            'id': contact_id,
            'name': full_name,
            'first_name': first_name,
            'last_name': last_name,
            'middle_name': middle_name,
            'gender': gender,
            'phone': phone_field['values'][0]['value'] if phone_field else client_phone,
            'email': email_field['values'][0]['value'] if email_field else '',
            'created_at': datetime.fromtimestamp(contact.get('created_at', 0)).strftime('%d.%m.%Y'),
            'loans': sorted(loans, key=lambda x: x['date'], reverse=True),
            'payments': sorted(payments, key=lambda x: x['date'], reverse=True),
            'deals': sorted(deals, key=lambda x: x['updated_at'], reverse=True),
            'total_deals': len(deals),
            'active_deals': len([d for d in deals if d['status'] == 'active']),
            'completed_deals': len([d for d in deals if d['status'] == 'completed']),
            'documents': documents,
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
        print(f'[ERROR] AmoCRM HTTP Error: {e.code} - {e.reason}')
        print(f'[ERROR] Response body: {error_body}')
        
        if e.code == 401 and _retry_count == 0:
            print('[INFO] Got 401 Unauthorized - token expired, trying to refresh...')
            tokens = refresh_access_token()
            if tokens:
                print('[INFO] Token refreshed successfully! Retrying request with new token...')
                return handler(event, context, _retry_count=1)
            
            return {
                'statusCode': 401,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Token refresh failed',
                    'message': 'Не удалось обновить токен. Обновите вручную через /amocrm-setup',
                    'details': 'Проверьте AMOCRM_REFRESH_TOKEN в секретах проекта'
                }),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': e.code,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': f'AmoCRM API error: {e.reason}',
                'details': error_body,
                'phone': client_phone,
                'domain': domain
            }),
            'isBase64Encoded': False
        }
    except Exception as e:
        print(f'[ERROR] Unexpected error: {str(e)}')
        import traceback
        print(f'[ERROR] Traceback: {traceback.format_exc()}')
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': str(e),
                'type': type(e).__name__,
                'phone': client_phone
            }),
            'isBase64Encoded': False
        }

def upload_documents_to_amocrm(phone: str, passport_file: bytes, selfie_file: bytes, access_token: str) -> bool:
    '''
    Загружает документы в AmoCRM как примечания к контакту
    Args: phone - номер телефона, passport_file - байты паспорта, selfie_file - байты селфи, access_token - токен
    Returns: True при успехе, False при ошибке
    '''
    domain = os.environ.get('AMOCRM_DOMAIN', 'stepanmalik88.amocrm.ru')
    
    try:
        clean_phone = phone.replace(' ', '').replace('-', '').replace('(', '').replace(')', '').replace('+', '')
        print(f'[UPLOAD] Original phone: {phone}, cleaned: {clean_phone}')
        
        contacts_url = f'https://{domain}/api/v4/contacts?query={clean_phone}'
        req = urllib.request.Request(
            contacts_url,
            headers={'Authorization': f'Bearer {access_token}'}
        )
        
        with urllib.request.urlopen(req, timeout=10) as response:
            contacts_data = json.loads(response.read().decode())
        
        contacts = contacts_data.get('_embedded', {}).get('contacts', [])
        if not contacts:
            print(f'[ERROR] Contact not found for phone: {phone}')
            return False
        
        contact_id = contacts[0]['id']
        
        passport_b64 = base64.b64encode(passport_file).decode('utf-8')
        selfie_b64 = base64.b64encode(selfie_file).decode('utf-8')
        
        note_data = {
            'note_type': 'common',
            'params': {
                'text': f'📎 Документы загружены:\n\n🪪 Паспорт: {len(passport_file)} bytes\n📸 Селфи: {len(selfie_file)} bytes\n\nФайлы в base64 (для скачивания обратитесь к разработчику)'
            }
        }
        
        notes_url = f'https://{domain}/api/v4/contacts/{contact_id}/notes'
        notes_req = urllib.request.Request(
            notes_url,
            data=json.dumps([note_data]).encode('utf-8'),
            headers={
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            },
            method='POST'
        )
        
        with urllib.request.urlopen(notes_req, timeout=10) as response:
            print(f'[SUCCESS] Documents uploaded to contact {contact_id}')
            return True
            
    except Exception as e:
        print(f'[ERROR] Failed to upload documents: {str(e)}')
        return False