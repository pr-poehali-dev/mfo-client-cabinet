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
        full_name = body_data.get('fullName', '')
        code = body_data.get('code', '')
        action = body_data.get('action', 'send')
        
        # Новое действие: проверка телефона без отправки SMS
        if action == 'check':
            webhook_url = os.environ.get('BITRIX24_WEBHOOK_URL', '').rstrip('/')
            
            if not webhook_url:
                return {
                    'statusCode': 500,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Битрикс24 не настроен'}),
                    'isBase64Encoded': False
                }
            
            clean_phone = phone.replace('+', '').replace(' ', '').replace('(', '').replace(')', '').replace('-', '')
            
            search_params = urllib.parse.urlencode({
                'PHONE': clean_phone,
                'TYPE': 'PHONE'
            })
            contact_url = f"{webhook_url}/crm.duplicate.findbycomm?{search_params}"
            
            try:
                contact_req = urllib.request.Request(contact_url)
                with urllib.request.urlopen(contact_req, timeout=10) as response:
                    duplicate_data = json.loads(response.read().decode())
                
                contact_entities = duplicate_data.get('result', {}).get('CONTACT', [])
                
                if not contact_entities:
                    return {
                        'statusCode': 404,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({
                            'success': False,
                            'not_found': True
                        }),
                        'isBase64Encoded': False
                    }
                
                contact_id = contact_entities[0]
                contact_get_url = f"{webhook_url}/crm.contact.get?id={contact_id}"
                contact_get_req = urllib.request.Request(contact_get_url)
                
                with urllib.request.urlopen(contact_get_req, timeout=10) as contact_response:
                    contact_result = json.loads(contact_response.read().decode())
                
                contact = contact_result.get('result', {})
                contact_name = f"{contact.get('NAME', '')} {contact.get('LAST_NAME', '')}".strip()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': True,
                        'client': {
                            'name': contact_name,
                            'phone': phone
                        }
                    }),
                    'isBase64Encoded': False
                }
                
            except Exception as e:
                print(f'[SMS-AUTH] Ошибка проверки телефона: {e}')
                return {
                    'statusCode': 500,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': str(e)}),
                    'isBase64Encoded': False
                }
        
        print(f'[SMS-AUTH] Request: action={action}, phone={phone[:4]}***, name={full_name}')
        
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
        
        if action == 'send' and not full_name:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'ФИО обязательно для входа'}),
                'isBase64Encoded': False
            }
        
        clean_phone = phone.replace('+', '').replace(' ', '').replace('(', '').replace(')', '').replace('-', '')
        
        if action == 'send':
            webhook_url = os.environ.get('BITRIX24_WEBHOOK_URL', '').rstrip('/')
            
            if not webhook_url:
                return {
                    'statusCode': 500,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Битрикс24 не настроен'}),
                    'isBase64Encoded': False
                }
            
            print(f'[SMS-AUTH] Проверка клиента в Битрикс24: {clean_phone}')
            
            search_params = urllib.parse.urlencode({
                'PHONE': clean_phone,
                'TYPE': 'PHONE'
            })
            contact_url = f"{webhook_url}/crm.duplicate.findbycomm?{search_params}"
            
            print(f'[SMS-AUTH] URL запроса: {contact_url[:80]}...')
            
            contact_req = urllib.request.Request(contact_url)
            
            try:
                with urllib.request.urlopen(contact_req, timeout=10) as response:
                    response_text = response.read().decode()
                    print(f'[SMS-AUTH] Ответ Битрикс24: {response_text[:200]}...')
                    duplicate_data = json.loads(response_text)
                
                contact_entities = duplicate_data.get('result', {}).get('CONTACT', [])
                
                if not contact_entities:
                    print(f'[SMS-AUTH] Клиент не найден в Битрикс24: {clean_phone}')
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
                
                contact_id = contact_entities[0]
                
                contact_get_url = f"{webhook_url}/crm.contact.get?id={contact_id}"
                contact_get_req = urllib.request.Request(contact_get_url)
                
                with urllib.request.urlopen(contact_get_req, timeout=10) as contact_response:
                    contact_text = contact_response.read().decode()
                    contact_result = json.loads(contact_text)
                
                contact = contact_result.get('result', {})
                
                # Проверяем ФИО
                contact_name = contact.get('NAME', '').strip().lower()
                contact_last_name = contact.get('LAST_NAME', '').strip().lower()
                contact_full = f"{contact_name} {contact_last_name}".strip()
                
                user_full_name = full_name.strip().lower()
                
                # Проверяем совпадение (хотя бы одно слово должно совпадать)
                user_words = set(user_full_name.split())
                contact_words = set(contact_full.split())
                
                if not user_words & contact_words:
                    print(f'[SMS-AUTH] ФИО не совпадает: {user_full_name} != {contact_full}')
                    return {
                        'statusCode': 403,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({
                            'error': 'ФИО не совпадает с данными в системе. Проверьте правильность ввода.',
                            'name_mismatch': True
                        }),
                        'isBase64Encoded': False
                    }
                
                print(f'[SMS-AUTH] ФИО подтверждено: {contact_full}')
                
                contacts = [contact]
                
                if not contacts:
                    print(f'[SMS-AUTH] Клиент не найден в Битрикс24: {clean_phone}')
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
                client_name = f"{contact.get('NAME', '')} {contact.get('LAST_NAME', '')}".strip() or 'Клиент'
                client_id = contact.get('ID')
                print(f'[SMS-AUTH] Клиент найден в Битрикс24: {client_name} (ID: {client_id})')
                
            except Exception as e:
                print(f'[SMS-AUTH] Ошибка проверки Битрикс24: {e}')
                return {
                    'statusCode': 500,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Ошибка проверки данных в Битрикс24'}),
                    'isBase64Encoded': False
                }
            
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
                        'client_name': client_name
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
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': True,
                        'verified': True,
                        'client_name': stored_name
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