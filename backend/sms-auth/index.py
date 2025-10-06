import json
import os
import urllib.request
import urllib.parse
import urllib.error
from typing import Dict, Any
import random

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Отправка SMS-кода для авторизации через sms.ru
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
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        phone = body_data.get('phone', '')
        code = body_data.get('code', '')
        action = body_data.get('action', 'send')
        
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
            amocrm_domain = os.environ.get('AMOCRM_DOMAIN', 'stepanmalik88.amocrm.ru')
            amocrm_token = os.environ.get('AMOCRM_ACCESS_TOKEN') or os.environ.get('ACCESS_TOKEN', '')
            
            if not amocrm_token:
                return {
                    'statusCode': 500,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'AmoCRM не настроен'}),
                    'isBase64Encoded': False
                }
            
            print(f'[SMS-AUTH] Проверка клиента в AmoCRM: {clean_phone}')
            
            contact_url = f'https://{amocrm_domain}/api/v4/contacts?query={clean_phone}'
            contact_req = urllib.request.Request(
                contact_url,
                headers={'Authorization': f'Bearer {amocrm_token}'}
            )
            
            try:
                with urllib.request.urlopen(contact_req, timeout=10) as response:
                    response_text = response.read().decode()
                    
                    if not response_text:
                        print(f'[SMS-AUTH] Пустой ответ от AmoCRM')
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
                
                print(f'[SMS-AUTH] Клиент найден в AmoCRM: {contacts[0].get("name")} (ID: {contacts[0].get("id")})')
                
            except urllib.error.HTTPError as e:
                print(f'[SMS-AUTH] Ошибка проверки AmoCRM: {e.code}')
                if e.code == 401:
                    return {
                        'statusCode': 500,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'error': 'Ошибка авторизации в AmoCRM. Проверьте токен AMOCRM_ACCESS_TOKEN'}),
                        'isBase64Encoded': False
                    }
                return {
                    'statusCode': 500,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Ошибка проверки данных в AmoCRM'}),
                    'isBase64Encoded': False
                }
            except json.JSONDecodeError as e:
                print(f'[SMS-AUTH] Ошибка парсинга JSON от AmoCRM: {e}')
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
            
            sms_code = str(random.randint(1000, 9999))
            
            message = f'Ваш код для входа: {sms_code}'
            
            params = urllib.parse.urlencode({
                'api_id': api_key,
                'to': clean_phone,
                'msg': message,
                'json': 1
            })
            
            sms_url = f'https://sms.ru/sms/send?{params}'
            
            req = urllib.request.Request(sms_url)
            
            with urllib.request.urlopen(req, timeout=10) as response:
                result = json.loads(response.read().decode())
            
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
                        'phone': clean_phone
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
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': True,
                        'verified': True
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
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }