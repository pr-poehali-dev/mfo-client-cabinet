import json
import os
import urllib.request
import urllib.parse
import urllib.error
from typing import Dict, Any
import random

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Отправка SMS-кода для авторизации через sms.ru с проверкой в AmoCRM
    Args: event с httpMethod, body содержит phone или phone+code для проверки
    Returns: JSON с результатом отправки или проверки SMS
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
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
    
    api_key = os.environ.get('SMSRU_API_KEY')
    amocrm_token = os.environ.get('AMOCRM_ACCESS_TOKEN')
    amocrm_subdomain = os.environ.get('AMOCRM_SUBDOMAIN', 'stepanmalik88')
    
    # Убираем .amocrm.ru если он уже есть в subdomain
    if amocrm_subdomain.endswith('.amocrm.ru'):
        amocrm_subdomain = amocrm_subdomain.replace('.amocrm.ru', '')
    
    if not api_key:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'SMSRU_API_KEY not configured'}),
            'isBase64Encoded': False
        }
    
    if not amocrm_token:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'AMOCRM_ACCESS_TOKEN not configured'}),
            'isBase64Encoded': False
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        phone = body_data.get('phone', '')
        code = body_data.get('code', '')
        action = body_data.get('action', 'send')
        
        print(f'[SMS-AUTH] Request: action={action}, phone={phone[:4]}***')
        
        if not phone:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Phone required'}),
                'isBase64Encoded': False
            }
        
        clean_phone = phone.replace('+', '').replace(' ', '').replace('(', '').replace(')', '').replace('-', '')
        
        if action == 'send':
            print(f'[SMS-AUTH] Проверка клиента в AmoCRM: {clean_phone}')
            
            # Поиск контакта в AmoCRM по телефону
            search_url = f'https://{amocrm_subdomain}.amocrm.ru/api/v4/contacts'
            search_params = urllib.parse.urlencode({
                'query': clean_phone
            })
            full_url = f'{search_url}?{search_params}'
            
            print(f'[SMS-AUTH] URL запроса: {full_url}')
            
            headers = {
                'Authorization': f'Bearer {amocrm_token}',
                'Content-Type': 'application/json'
            }
            
            try:
                req = urllib.request.Request(full_url, headers=headers)
                
                with urllib.request.urlopen(req, timeout=10) as response:
                    response_text = response.read().decode()
                    print(f'[SMS-AUTH] Ответ AmoCRM: {response_text[:200]}...')
                    contacts_data = json.loads(response_text)
                
                contacts = contacts_data.get('_embedded', {}).get('contacts', [])
                
                if not contacts:
                    print(f'[SMS-AUTH] Клиент не найден в AmoCRM: {clean_phone}')
                    return {
                        'statusCode': 404,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({
                            'error': 'Клиент с таким номером не найден в системе. Обратитесь в поддержку.',
                            'not_found': True
                        }),
                        'isBase64Encoded': False
                    }
                
                contact = contacts[0]
                client_name = contact.get('name', 'Клиент')
                client_id = contact.get('id')
                print(f'[SMS-AUTH] Клиент найден в AmoCRM: {client_name} (ID: {client_id})')
                
            except urllib.error.HTTPError as e:
                error_body = e.read().decode()
                print(f'[SMS-AUTH] HTTP Error {e.code}: {error_body}')
                return {
                    'statusCode': 500,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': f'Ошибка проверки данных в AmoCRM: {e.code}'}),
                    'isBase64Encoded': False
                }
            except Exception as e:
                print(f'[SMS-AUTH] Ошибка проверки AmoCRM: {e}')
                return {
                    'statusCode': 500,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Ошибка проверки данных в AmoCRM'}),
                    'isBase64Encoded': False
                }
            
            # Генерация и отправка SMS-кода
            sms_code = str(random.randint(1000, 9999))
            print(f'[SMS-AUTH] Генерирован код: {sms_code}')
            
            message = f'Ваш код для входа: {sms_code}'
            
            try:
                params = urllib.parse.urlencode({
                    'api_id': api_key,
                    'to': clean_phone,
                    'msg': message,
                    'json': 1
                })
                
                sms_url = f'https://sms.ru/sms/send?{params}'
                print(f'[SMS-AUTH] Отправка SMS на {clean_phone}')
                
                req = urllib.request.Request(sms_url)
                
                with urllib.request.urlopen(req, timeout=10) as response:
                    result = json.loads(response.read().decode())
                
                print(f'[SMS-AUTH] Ответ SMS.ru: {result}')
            
            except Exception as sms_error:
                print(f'[SMS-AUTH] Ошибка отправки SMS: {sms_error}')
                return {
                    'statusCode': 500,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': f'Ошибка отправки SMS: {str(sms_error)}'}),
                    'isBase64Encoded': False
                }
            
            if result.get('status') == 'OK':
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': True,
                        'message': 'SMS отправлена',
                        'code': sms_code,
                        'phone': clean_phone,
                        'client_name': client_name,
                        'client_id': client_id
                    }),
                    'isBase64Encoded': False
                }
            else:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'error': f'Ошибка отправки SMS: {result.get("status_text", "Неизвестная ошибка")}'
                    }),
                    'isBase64Encoded': False
                }
        
        elif action == 'verify':
            stored_code = body_data.get('stored_code', '')
            
            if not code or not stored_code:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Code and stored_code required'}),
                    'isBase64Encoded': False
                }
            
            if code == stored_code:
                stored_name = body_data.get('client_name', 'Клиент')
                client_id = body_data.get('client_id', '')
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': True,
                        'verified': True,
                        'client_name': stored_name,
                        'client_id': client_id
                    }),
                    'isBase64Encoded': False
                }
            else:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'error': 'Неверный код',
                        'verified': False
                    }),
                    'isBase64Encoded': False
                }
        
        else:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Invalid action'}),
                'isBase64Encoded': False
            }
            
    except Exception as e:
        print(f'[SMS-AUTH] Общая ошибка: {e}')
        import traceback
        print(f'[SMS-AUTH] Traceback: {traceback.format_exc()}')
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }