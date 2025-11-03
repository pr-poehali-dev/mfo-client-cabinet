# MegaCRM API - Алгоритм генерации подписи X-MegaCrm-ApiSignature

## Обзор

API MegaCRM использует подпись запросов для аутентификации. Каждый запрос должен содержать заголовок `X-MegaCrm-ApiSignature` с подписью, которая вычисляется на основе URL запроса, тела запроса и API ключа.

---

## Алгоритм генерации подписи

### Формула

```
X-MegaCrm-ApiSignature = MD5(URL + JSON_BODY + API_KEY)
```

### Компоненты

1. **URL** - Полный URL эндпоинта (например: `/deal/create`)
2. **JSON_BODY** - JSON-строка с параметрами запроса (для GET - query параметры, для POST/PUT - body)
3. **API_KEY** - Ваш секретный API ключ

### Порядок конкатенации

```php
$signature = md5($url . $json_body . $api_key);
```

---

## Исходный код (PHP)

### Метод генерации подписи из официального клиента

```php
/**
 * @param RequestInterface $request
 * @return string
 */
private function getSignature(RequestInterface $request)
{
    return md5(
        $request->getUrl()                      // 1. URL эндпоинта
        . json_encode($request->jsonSerialize()) // 2. JSON-encoded данные
        . $this->api_key                        // 3. API ключ
    );
}
```

### Метод формирования заголовков

```php
/**
 * @param RequestInterface $request
 * @return array
 */
private function getHttpRequestHeaders(RequestInterface $request)
{
    return [
        'X-MegaCrm-ApiSignature' => $this->getSignature($request),
        'X-MegaCrm-AccountId' => $this->account_id,
    ];
}
```

---

## Необходимые заголовки для запроса

Каждый запрос к MegaCRM API должен содержать два обязательных заголовка:

```
X-MegaCrm-ApiSignature: <MD5 подпись>
X-MegaCrm-AccountId: <ID аккаунта>
```

---

## Примеры

### Пример 1: POST запрос для создания сделки

#### Исходные данные
```
URL: /deal/create
Account ID: 12345678
API Key: edaf8e71d644fd09d30f1fc417e1aebe1e66a366

Request Body:
{
    "title": "Test Deal",
    "price": 1000,
    "tags": ["VIP"]
}
```

#### Шаги вычисления

1. **URL**: `/deal/create`

2. **JSON Body**: `{"title":"Test Deal","price":1000,"tags":["VIP"]}`

3. **API Key**: `edaf8e71d644fd09d30f1fc417e1aebe1e66a366`

4. **Конкатенация**:
```
/deal/create{"title":"Test Deal","price":1000,"tags":["VIP"]}edaf8e71d644fd09d30f1fc417e1aebe1e66a366
```

5. **MD5 Hash**:
```php
$signature = md5('/deal/create{"title":"Test Deal","price":1000,"tags":["VIP"]}edaf8e71d644fd09d30f1fc417e1aebe1e66a366');
```

#### Результирующие заголовки
```
X-MegaCrm-ApiSignature: <вычисленный MD5 хеш>
X-MegaCrm-AccountId: 12345678
Content-Type: application/json
```

---

### Пример 2: GET запрос

#### Исходные данные
```
URL: /deal/list
Account ID: 12345678
API Key: edaf8e71d644fd09d30f1fc417e1aebe1e66a366

Query Parameters:
{
    "limit": 10,
    "offset": 0
}
```

#### Шаги вычисления

1. **URL**: `/deal/list`

2. **JSON Body**: `{"limit":10,"offset":0}` (даже для GET запросов параметры сериализуются в JSON)

3. **API Key**: `edaf8e71d644fd09d30f1fc417e1aebe1e66a366`

4. **Конкатенация**:
```
/deal/list{"limit":10,"offset":0}edaf8e71d644fd09d30f1fc417e1aebe1e66a366
```

5. **MD5 Hash**:
```php
$signature = md5('/deal/list{"limit":10,"offset":0}edaf8e71d644fd09d30f1fc417e1aebe1e66a366');
```

---

## Полный пример кода на PHP

### Функция для генерации подписи

```php
<?php

function generateMegaCrmSignature($url, $data, $apiKey) {
    // 1. Преобразуем данные в JSON
    $jsonData = json_encode($data);
    
    // 2. Конкатенируем URL + JSON + API Key
    $stringToHash = $url . $jsonData . $apiKey;
    
    // 3. Вычисляем MD5 хеш
    $signature = md5($stringToHash);
    
    return $signature;
}

// Пример использования
$accountId = 12345678;
$apiKey = 'edaf8e71d644fd09d30f1fc417e1aebe1e66a366';
$url = '/deal/create';

$requestData = [
    'title' => 'Test Deal',
    'price' => 1000,
    'tags' => ['VIP']
];

$signature = generateMegaCrmSignature($url, $requestData, $apiKey);

// Заголовки для HTTP запроса
$headers = [
    'X-MegaCrm-ApiSignature' => $signature,
    'X-MegaCrm-AccountId' => $accountId,
    'Content-Type' => 'application/json'
];

echo "Signature: " . $signature . "\n";
print_r($headers);
```

---

## Важные детали

### 1. Алгоритм хеширования
- Используется **MD5** (не SHA256, не HMAC)
- MD5 применяется к простой конкатенации строк

### 2. Порядок данных
Порядок конкатенации строго определен:
1. URL эндпоинта
2. JSON-представление данных
3. API ключ

**Неправильно:**
```php
md5($api_key . $url . $json_body)  // ❌ Неверный порядок
```

**Правильно:**
```php
md5($url . $json_body . $api_key)  // ✅ Правильный порядок
```

### 3. JSON сериализация
- Данные всегда сериализуются в JSON, даже для GET запросов
- Используется стандартная JSON-кодировка без пробелов
- Для пустого body используется `{}`

### 4. URL формат
- URL должен быть относительным путем от базового endpoint
- Например: `/deal/create`, `/contact/list`
- Базовый endpoint: `https://api.megacrm.ru/v1/`

### 5. Кодировка
- Используется UTF-8 для всех строк
- MD5 возвращается в hex формате (32 символа)

---

## Пример с curl

```bash
#!/bin/bash

ACCOUNT_ID="12345678"
API_KEY="edaf8e71d644fd09d30f1fc417e1aebe1e66a366"
URL="/deal/create"
BASE_URL="https://api.megacrm.ru/v1"

# JSON данные
JSON_DATA='{"title":"Test Deal","price":1000,"tags":["VIP"]}'

# Генерация подписи
STRING_TO_HASH="${URL}${JSON_DATA}${API_KEY}"
SIGNATURE=$(echo -n "$STRING_TO_HASH" | md5sum | cut -d' ' -f1)

echo "Signature: $SIGNATURE"

# Выполнение запроса
curl -X POST "${BASE_URL}${URL}" \
  -H "Content-Type: application/json" \
  -H "X-MegaCrm-ApiSignature: $SIGNATURE" \
  -H "X-MegaCrm-AccountId: $ACCOUNT_ID" \
  -d "$JSON_DATA"
```

---

## Реализация на TypeScript/JavaScript

```typescript
import crypto from 'crypto';

interface MegaCrmCredentials {
  accountId: number;
  apiKey: string;
}

function generateMegaCrmSignature(
  url: string,
  data: any,
  apiKey: string
): string {
  // 1. Преобразуем данные в JSON
  const jsonData = JSON.stringify(data);
  
  // 2. Конкатенируем URL + JSON + API Key
  const stringToHash = url + jsonData + apiKey;
  
  // 3. Вычисляем MD5 хеш
  const signature = crypto
    .createHash('md5')
    .update(stringToHash)
    .digest('hex');
  
  return signature;
}

function getMegaCrmHeaders(
  url: string,
  data: any,
  credentials: MegaCrmCredentials
): Record<string, string> {
  const signature = generateMegaCrmSignature(url, data, credentials.apiKey);
  
  return {
    'X-MegaCrm-ApiSignature': signature,
    'X-MegaCrm-AccountId': credentials.accountId.toString(),
    'Content-Type': 'application/json'
  };
}

// Пример использования
const credentials: MegaCrmCredentials = {
  accountId: 12345678,
  apiKey: 'edaf8e71d644fd09d30f1fc417e1aebe1e66a366'
};

const url = '/deal/create';
const requestData = {
  title: 'Test Deal',
  price: 1000,
  tags: ['VIP']
};

const headers = getMegaCrmHeaders(url, requestData, credentials);
console.log('Headers:', headers);

// Выполнение запроса с fetch
async function createDeal() {
  const response = await fetch('https://api.megacrm.ru/v1' + url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(requestData)
  });
  
  return await response.json();
}
```

---

## Проверка подписи

Для отладки можно использовать следующий скрипт:

```php
<?php

function debugSignature($url, $data, $apiKey) {
    $jsonData = json_encode($data);
    $stringToHash = $url . $jsonData . $apiKey;
    $signature = md5($stringToHash);
    
    echo "=== DEBUG SIGNATURE ===\n";
    echo "URL: " . $url . "\n";
    echo "JSON Data: " . $jsonData . "\n";
    echo "API Key: " . $apiKey . "\n";
    echo "String to hash: " . $stringToHash . "\n";
    echo "MD5 Signature: " . $signature . "\n";
    echo "=====================\n";
    
    return $signature;
}

// Тест
debugSignature(
    '/deal/create',
    ['title' => 'Test', 'price' => 100],
    'test_api_key'
);
```

---

## Источники

- Официальный PHP клиент: https://github.com/megagroup-official/megacrm-api-client
- Файл с алгоритмом: `src/Client.php` методы `getSignature()` и `getHttpRequestHeaders()`
- Базовый endpoint: `https://api.megacrm.ru/v1/`

---

## Резюме

Для успешной аутентификации в MegaCRM API необходимо:

1. Получить Account ID и API Key из настроек аккаунта
2. Для каждого запроса сформировать подпись: `MD5(URL + JSON_BODY + API_KEY)`
3. Отправить два заголовка:
   - `X-MegaCrm-ApiSignature`: вычисленная MD5 подпись
   - `X-MegaCrm-AccountId`: ID аккаунта
4. Убедиться что порядок конкатенации правильный: URL, затем JSON, затем API ключ
