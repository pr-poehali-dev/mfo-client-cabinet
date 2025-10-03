import json
import os
import urllib.request
import urllib.error
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Обновление токенов доступа AmoCRM вручную
    Args: event с httpMethod и body (содержит refresh_token)
    Returns: Новые токены для сохранения в секреты
    '''
    method: str = event.get('httpMethod', 'POST')
    
    # CORS
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
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
    
    # Получаем данные из секретов
    domain = os.environ.get('AMOCRM_DOMAIN', 'stepanmalik88.amocrm.ru')
    client_id = os.environ.get('AMOCRM_CLIENT_ID', '31cf6e60-2cd4-4adb-9be2-ae60c1e67bb3')
    client_secret = os.environ.get('AMOCRM_CLIENT_SECRET', 'Kz3OMuXVa4Yok2DhzUtqBfGKqhZaJKjKEh4wuB2QsPkKtHJ7h1JGFW6dFXMUoxjq')
    redirect_uri = os.environ.get('AMOCRM_REDIRECT_URI', 'https://poehali.dev')
    
    # Получаем refresh token из тела запроса или секретов
    body_data = {}
    if event.get('body'):
        try:
            body_data = json.loads(event['body'])
        except:
            pass
    
    refresh_token = body_data.get('refresh_token') or os.environ.get('AMOCRM_REFRESH_TOKEN', '')
    
    if not refresh_token:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Refresh token required',
                'message': 'Отправьте refresh_token в теле запроса: {"refresh_token": "your_token"}'
            }),
            'isBase64Encoded': False
        }
    
    try:
        # Обновляем токен через AmoCRM API
        token_url = f'https://{domain}/oauth2/access_token'
        token_data = json.dumps({
            'client_id': client_id,
            'client_secret': client_secret,
            'grant_type': 'refresh_token',
            'refresh_token': refresh_token,
            'redirect_uri': redirect_uri
        }).encode('utf-8')
        
        print(f'[INFO] Refreshing token for domain: {domain}')
        print(f'[INFO] Using refresh_token: {refresh_token[:20]}...')
        
        token_req = urllib.request.Request(
            token_url,
            data=token_data,
            headers={'Content-Type': 'application/json'}
        )
        
        with urllib.request.urlopen(token_req, timeout=10) as response:
            token_response = json.loads(response.read().decode())
        
        new_access_token = token_response.get('access_token', '')
        new_refresh_token = token_response.get('refresh_token', '')
        expires_in = token_response.get('expires_in', 0)
        
        print(f'✅ [SUCCESS] Token refreshed successfully!')
        print(f'[INFO] New access_token: {new_access_token[:30]}...')
        print(f'[INFO] New refresh_token: {new_refresh_token[:30]}...')
        print(f'[INFO] Expires in: {expires_in} seconds ({expires_in // 3600} hours)')
        
        # Возвращаем новые токены для сохранения
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'message': 'Токены успешно обновлены',
                'tokens': {
                    'access_token': new_access_token,
                    'refresh_token': new_refresh_token,
                    'expires_in': expires_in,
                    'expires_in_hours': expires_in // 3600
                },
                'instructions': {
                    'step1': f'Обновите секрет ACCESS_TOKEN значением: {new_access_token}',
                    'step2': f'Обновите секрет AMOCRM_REFRESH_TOKEN значением: {new_refresh_token}',
                    'step3': 'Токены будут действительны в течение ' + str(expires_in // 3600) + ' часов'
                }
            }, ensure_ascii=False),
            'isBase64Encoded': False
        }
        
    except urllib.error.HTTPError as e:
        error_body = e.read().decode() if e.fp else str(e)
        print(f'❌ [ERROR] AmoCRM HTTP Error: {e.code} - {e.reason}')
        print(f'[ERROR] Response: {error_body}')
        
        return {
            'statusCode': e.code,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': f'AmoCRM API error: {e.reason}',
                'code': e.code,
                'details': error_body,
                'help': 'Проверьте, что refresh_token актуален. Возможно нужно пройти OAuth заново через AmoCRM'
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f'❌ [ERROR] Unexpected error: {str(e)}')
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
                'type': type(e).__name__
            }),
            'isBase64Encoded': False
        }
