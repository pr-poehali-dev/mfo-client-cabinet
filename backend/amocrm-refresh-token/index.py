"""
Business: Обновляет Access Token используя Refresh Token
Args: event (без параметров, использует секреты проекта)
Returns: JSON с новым access_token и refresh_token
"""

import json
import os
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
    
    subdomain = os.environ.get('AMOCRM_SUBDOMAIN', '').replace('.amocrm.ru', '')
    client_id = os.environ.get('AMOCRM_CLIENT_ID')
    client_secret = os.environ.get('AMOCRM_CLIENT_SECRET')
    refresh_token = os.environ.get('AMOCRM_REFRESH_TOKEN')
    redirect_uri = os.environ.get('AMOCRM_REDIRECT_URI')
    
    if not all([subdomain, client_id, client_secret, refresh_token, redirect_uri]):
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Не все секреты настроены'})
        }
    
    try:
        token_url = f'https://{subdomain}.amocrm.ru/oauth2/access_token'
        
        token_data = {
            'client_id': client_id,
            'client_secret': client_secret,
            'grant_type': 'refresh_token',
            'refresh_token': refresh_token,
            'redirect_uri': redirect_uri
        }
        
        response = requests.post(token_url, json=token_data, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'access_token': data['access_token'],
                'refresh_token': data['refresh_token'],
                'expires_in': data.get('expires_in', 86400),
                'message': 'Токен успешно обновлен. Обновите секреты AMOCRM_ACCESS_TOKEN и AMOCRM_REFRESH_TOKEN'
            })
        }
        
    except requests.exceptions.RequestException as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка обновления токена: {str(e)}'})
        }