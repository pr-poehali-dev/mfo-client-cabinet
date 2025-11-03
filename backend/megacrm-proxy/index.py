"""
Business: Proxy for MegaCRM API with signature generation
Args: event - dict with httpMethod, queryStringParameters, body
      context - object with attributes: request_id, function_name
Returns: HTTP response dict with MegaCRM API result
"""

import json
import hashlib
import os
from typing import Dict, Any
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError


def generate_signature(method: str, query_string: str, body: str, api_key: str) -> str:
    data = method + query_string + body + api_key
    return hashlib.md5(data.encode('utf-8')).hexdigest()


def call_megacrm_api(endpoint: str, method: str, query_params: Dict[str, str], body: str, account_id: str, api_key: str) -> Dict[str, Any]:
    query_string = '?' + urlencode(query_params) if query_params else ''
    
    signature = generate_signature(method, query_string, body, api_key)
    
    url = f'https://api.megacrm.net/v1{endpoint}{query_string}'
    
    headers = {
        'X-MegaCrm-AccountId': account_id,
        'X-MegaCrm-ApiSignature': signature,
        'Content-Type': 'application/json'
    }
    
    body_bytes = body.encode('utf-8') if body and method != 'GET' else None
    
    req = Request(url, data=body_bytes, headers=headers, method=method)
    
    try:
        with urlopen(req) as response:
            response_data = response.read().decode('utf-8')
            return {
                'status': response.status,
                'data': json.loads(response_data)
            }
    except HTTPError as e:
        error_data = e.read().decode('utf-8')
        return {
            'status': e.code,
            'data': json.loads(error_data) if error_data else {'error': str(e)}
        }
    except URLError as e:
        return {
            'status': 500,
            'data': {'error': 'Network error', 'message': str(e)}
        }


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    account_id = os.environ.get('MEGAGROUP_ACCOUNT_ID')
    api_key = os.environ.get('MEGAGROUP_API_KEY')
    
    if not account_id or not api_key:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'MegaCRM credentials not configured'})
        }
    
    query_params = event.get('queryStringParameters', {}) or {}
    endpoint = query_params.pop('endpoint', '/deals')
    
    request_body = event.get('body', '')
    
    result = call_megacrm_api(endpoint, method, query_params, request_body, account_id, api_key)
    
    return {
        'statusCode': result['status'],
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'isBase64Encoded': False,
        'body': json.dumps(result['data'])
    }
