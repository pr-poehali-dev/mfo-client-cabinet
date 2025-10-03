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
    print(f'[INFO] Handler called: {event.get("httpMethod", "UNKNOWN")}')
    
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        print('[INFO] OPTIONS request - returning CORS headers')
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, Accept',
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
    
    api_key = os.environ.get('SMSRU_API_KEY', '688D03C6-7BED-71DE-A598-77639078F685')
    
    try:
        print(f'[DEBUG] Raw body: {event.get("body", "{}")}')
        body_data = json.loads(event.get('body', '{}'))
        phone = body_data.get('phone', '')
        code = body_data.get('code', '')
        action = body_data.get('action', 'send')
        
        print(f'[INFO] Action: {action}, Phone: {phone}')
        
        if not phone:
            print('[ERROR] Phone not provided')
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
        print(f'[DEBUG] Clean phone: {clean_phone}')
        
        if action == 'send':
            sms_code = str(random.randint(1000, 9999))
            print(f'[INFO] Generated code: {sms_code} for phone: {clean_phone}')
            
            message = f'Ваш код для входа: {sms_code}'
            
            params = urllib.parse.urlencode({
                'api_id': api_key,
                'to': clean_phone,
                'msg': message,
                'json': 1
            })
            
            sms_url = f'https://sms.ru/sms/send?{params}'
            print(f'[DEBUG] SMS URL: {sms_url[:50]}...')
            
            req = urllib.request.Request(sms_url)
            
            try:
                with urllib.request.urlopen(req, timeout=10) as response:
                    result = json.loads(response.read().decode())
                print(f'[DEBUG] SMS.ru response: {result}')
            except urllib.error.URLError as e:
                print(f'[ERROR] SMS.ru connection error: {e}')
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': True,
                        'message': 'Тестовый режим - SMS не отправлена',
                        'code': sms_code,
                        'phone': clean_phone,
                        'test_mode': True
                    }),
                    'isBase64Encoded': False
                }
            
            if result.get('status') == 'OK':
                print('[SUCCESS] SMS sent successfully')
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
                print(f'[WARNING] SMS.ru returned non-OK status: {result.get("status_text")}')
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': True,
                        'message': 'Тестовый режим',
                        'code': sms_code,
                        'phone': clean_phone,
                        'test_mode': True,
                        'sms_error': result.get('status_text', 'Неизвестная ошибка')
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
        print(f'[ERROR] Unexpected error: {str(e)}')
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