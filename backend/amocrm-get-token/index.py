"""
Business: Получает Access Token и Refresh Token из AmoCRM через код авторизации
Args: event с body (code - код авторизации из OAuth)
Returns: JSON с access_token и refresh_token
"""

import json
import requests
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
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
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Метод не поддерживается'})
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Неверный формат JSON'})
        }
    
    code = body.get('code', '')
    
    if not code:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Параметр code обязателен'})
        }
    
    subdomain = 'stepanmalik88'
    client_id = 'd71f2423-d72b-4589-95dc-f28927138046'
    client_secret = '2yDEDiU8pz5eU8J6hBDoCESmq35KLZOYSdrm8qnFbC8b2unZ0eFBAapGcC0YC11B'
    redirect_uri = 'https://poehali.dev'
    
    try:
        token_url = f'https://{subdomain}.amocrm.ru/oauth2/access_token'
        
        token_data = {
            'client_id': client_id,
            'client_secret': client_secret,
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': redirect_uri
        }
        
        response = requests.post(token_url, json=token_data, timeout=10)
        
        if response.status_code != 200:
            error_data = response.json() if response.headers.get('content-type') == 'application/json' else {}
            return {
                'statusCode': response.status_code,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'error': error_data.get('hint') or error_data.get('detail') or 'Ошибка получения токена'
                })
            }
        
        data = response.json()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'access_token': data['access_token'],
                'refresh_token': data['refresh_token'],
                'token_type': data.get('token_type', 'Bearer'),
                'expires_in': data.get('expires_in', 86400)
            })
        }
        
    except requests.exceptions.RequestException as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка запроса к AmoCRM: {str(e)}'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Внутренняя ошибка: {str(e)}'})
        }
