# MegaCRM API - Визуальное руководство по генерации подписи

## Схема генерации подписи

```
┌─────────────────────────────────────────────────────────────┐
│                 MegaCRM API Request Flow                    │
└─────────────────────────────────────────────────────────────┘

Step 1: Prepare Request Data
┌──────────────────┐
│   URL Endpoint   │  →  "/deal/create"
└──────────────────┘

┌──────────────────┐
│   Request Data   │  →  { "title": "Test", "price": 1000 }
└──────────────────┘

┌──────────────────┐
│    API Key       │  →  "edaf8e71d644fd09d30f1fc417e1aebe1e66a366"
└──────────────────┘


Step 2: Convert Data to JSON
┌──────────────────┐
│   JSON String    │  →  '{"title":"Test","price":1000}'
└──────────────────┘


Step 3: Concatenate in Order
┌─────────────────────────────────────────────────────────────┐
│  URL + JSON + API_KEY                                       │
├─────────────────────────────────────────────────────────────┤
│  /deal/create{"title":"Test","price":1000}edaf8e...366      │
└─────────────────────────────────────────────────────────────┘


Step 4: Apply MD5 Hash
┌─────────────────────────────────────────────────────────────┐
│  MD5 Hash                                                   │
├─────────────────────────────────────────────────────────────┤
│  a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6                          │
└─────────────────────────────────────────────────────────────┘


Step 5: Create Request Headers
┌─────────────────────────────────────────────────────────────┐
│  HTTP Headers                                               │
├─────────────────────────────────────────────────────────────┤
│  X-MegaCrm-ApiSignature: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6  │
│  X-MegaCrm-AccountId: 12345678                             │
│  Content-Type: application/json                            │
└─────────────────────────────────────────────────────────────┘


Step 6: Send Request
┌─────────────────────────────────────────────────────────────┐
│  POST https://api.megacrm.ru/v1/deal/create                │
│  Headers: X-MegaCrm-ApiSignature, X-MegaCrm-AccountId      │
│  Body: {"title":"Test","price":1000}                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Блок-схема алгоритма

```
START
  ↓
┌────────────────────────┐
│ Получить URL endpoint  │
└────────────────────────┘
  ↓
┌────────────────────────┐
│ Получить request data  │
└────────────────────────┘
  ↓
┌────────────────────────┐
│ JSON.stringify(data)   │
└────────────────────────┘
  ↓
┌────────────────────────┐
│ string = URL + JSON    │
└────────────────────────┘
  ↓
┌────────────────────────┐
│ string += API_KEY      │
└────────────────────────┘
  ↓
┌────────────────────────┐
│ signature = MD5(string)│
└────────────────────────┘
  ↓
┌────────────────────────┐
│ Set header:            │
│ X-MegaCrm-ApiSignature │
└────────────────────────┘
  ↓
┌────────────────────────┐
│ Set header:            │
│ X-MegaCrm-AccountId    │
└────────────────────────┘
  ↓
┌────────────────────────┐
│ Send HTTP Request      │
└────────────────────────┘
  ↓
END
```

---

## Пример пошагового вычисления

### Входные данные:
```yaml
URL: /deal/create
Account ID: 12345678
API Key: edaf8e71d644fd09d30f1fc417e1aebe1e66a366

Request Data:
  title: "My First Deal"
  price: 5000
  tags: ["VIP", "Hot"]
```

### Шаг 1: Сериализация в JSON
```json
{"title":"My First Deal","price":5000,"tags":["VIP","Hot"]}
```

### Шаг 2: Конкатенация компонентов
```
Component 1 (URL):     /deal/create
Component 2 (JSON):    {"title":"My First Deal","price":5000,"tags":["VIP","Hot"]}
Component 3 (API Key): edaf8e71d644fd09d30f1fc417e1aebe1e66a366

Concatenated String:
/deal/create{"title":"My First Deal","price":5000,"tags":["VIP","Hot"]}edaf8e71d644fd09d30f1fc417e1aebe1e66a366
```

### Шаг 3: Вычисление MD5
```
Input:  /deal/create{"title":"My First Deal","price":5000,"tags":["VIP","Hot"]}edaf8e71d644fd09d30f1fc417e1aebe1e66a366
MD5:    [вычисленный хеш 32 символа в hex формате]
```

### Шаг 4: Формирование заголовков
```http
X-MegaCrm-ApiSignature: [MD5 хеш]
X-MegaCrm-AccountId: 12345678
Content-Type: application/json
```

### Шаг 5: HTTP Запрос
```http
POST /v1/deal/create HTTP/1.1
Host: api.megacrm.ru
X-MegaCrm-ApiSignature: [MD5 хеш]
X-MegaCrm-AccountId: 12345678
Content-Type: application/json

{"title":"My First Deal","price":5000,"tags":["VIP","Hot"]}
```

---

## Сравнение правильного и неправильного порядка

### ПРАВИЛЬНО
```
MD5( URL + JSON + API_KEY )
     ↓     ↓      ↓
     1     2      3
```

### НЕПРАВИЛЬНО
```
❌ MD5( API_KEY + URL + JSON )     // Неверный порядок
❌ MD5( JSON + URL + API_KEY )     // Неверный порядок
❌ HMAC( URL + JSON, API_KEY )     // Неверный алгоритм
❌ SHA256( URL + JSON + API_KEY )  // Неверный алгоритм
```

---

## Структура данных в коде

### PHP
```php
class Client {
    private $account_id;     // Account ID
    private $api_key;        // API Key
    
    private function getSignature($request) {
        // URL
        $url = $request->getUrl();
        
        // JSON данные
        $json = json_encode($request->jsonSerialize());
        
        // Конкатенация
        $string = $url . $json . $this->api_key;
        
        // MD5
        return md5($string);
    }
}
```

### TypeScript
```typescript
class MegaCrmClient {
    private accountId: number;
    private apiKey: string;
    
    private generateSignature(url: string, data: any): string {
        // URL
        const endpoint = url;
        
        // JSON данные
        const json = JSON.stringify(data);
        
        // Конкатенация
        const stringToHash = endpoint + json + this.apiKey;
        
        // MD5
        return crypto
            .createHash('md5')
            .update(stringToHash)
            .digest('hex');
    }
}
```

---

## Типичные ошибки

### Ошибка 1: Неверный порядок компонентов
```typescript
// ❌ НЕПРАВИЛЬНО
md5(apiKey + url + json)

// ✅ ПРАВИЛЬНО
md5(url + json + apiKey)
```

### Ошибка 2: Неверный алгоритм хеширования
```typescript
// ❌ НЕПРАВИЛЬНО
sha256(url + json + apiKey)

// ✅ ПРАВИЛЬНО
md5(url + json + apiKey)
```

### Ошибка 3: JSON с пробелами
```typescript
// ❌ НЕПРАВИЛЬНО
JSON.stringify(data, null, 2)  // С отступами

// ✅ ПРАВИЛЬНО
JSON.stringify(data)  // Без пробелов
```

### Ошибка 4: Забыли JSON.stringify для GET параметров
```typescript
// ❌ НЕПРАВИЛЬНО (для GET)
const signature = md5(url + queryString + apiKey);

// ✅ ПРАВИЛЬНО (для GET)
const signature = md5(url + JSON.stringify(params) + apiKey);
```

### Ошибка 5: Неверный формат URL
```typescript
// ❌ НЕПРАВИЛЬНО
const url = "https://api.megacrm.ru/v1/deal/create";

// ✅ ПРАВИЛЬНО
const url = "/deal/create";
```

---

## Checklist для проверки

- [ ] Используется MD5 (не SHA256, не HMAC)
- [ ] Порядок: URL → JSON → API_KEY
- [ ] URL является относительным путем (начинается с `/`)
- [ ] JSON без пробелов и отступов
- [ ] Параметры GET запросов тоже в JSON
- [ ] Заголовок `X-MegaCrm-ApiSignature` содержит MD5 хеш
- [ ] Заголовок `X-MegaCrm-AccountId` содержит ID аккаунта
- [ ] MD5 хеш в hex формате (32 символа, lowercase)

---

## Инструменты для отладки

### Онлайн MD5 калькулятор
https://www.md5hashgenerator.com/

### Пример проверки в консоли браузера
```javascript
// В консоли браузера (если есть crypto)
const url = "/deal/create";
const data = {title: "Test", price: 1000};
const apiKey = "test_key";

const json = JSON.stringify(data);
const str = url + json + apiKey;

console.log("String to hash:", str);

// Для Node.js или с crypto-js
const crypto = require('crypto');
const signature = crypto.createHash('md5').update(str).digest('hex');
console.log("Signature:", signature);
```

### Скрипт для отладки (Node.js)
```bash
# Сохранить как test-signature.js
node test-signature.js
```

```javascript
const crypto = require('crypto');

function test(url, data, apiKey) {
    const json = JSON.stringify(data);
    const str = url + json + apiKey;
    const sig = crypto.createHash('md5').update(str).digest('hex');
    
    console.log('\n=== TEST SIGNATURE ===');
    console.log('URL:', url);
    console.log('Data:', data);
    console.log('JSON:', json);
    console.log('String:', str);
    console.log('Signature:', sig);
    console.log('===================\n');
}

test('/deal/create', {title: 'Test', price: 1000}, 'test_key');
```

---

## Диаграмма потока данных

```
┌─────────────┐
│   Client    │
│  Frontend   │
└──────┬──────┘
       │
       │ 1. Подготовка данных
       ▼
┌─────────────────────┐
│  URL + Data         │
│  + AccountID        │
│  + ApiKey           │
└──────┬──────────────┘
       │
       │ 2. Генерация подписи
       ▼
┌─────────────────────┐
│ MD5(URL+JSON+KEY)   │
└──────┬──────────────┘
       │
       │ 3. Формирование запроса
       ▼
┌─────────────────────┐
│  HTTP Request       │
│  + Headers          │
│    - Signature      │
│    - AccountId      │
└──────┬──────────────┘
       │
       │ 4. Отправка
       ▼
┌─────────────────────┐
│  MegaCRM API Server │
│  api.megacrm.ru     │
└──────┬──────────────┘
       │
       │ 5. Проверка подписи
       ▼
┌─────────────────────┐
│  Validation         │
│  - Signature OK?    │
│  - Account exists?  │
└──────┬──────────────┘
       │
       │ 6. Обработка
       ▼
┌─────────────────────┐
│  Response           │
│  JSON Data          │
└─────────────────────┘
```

---

## Резюме

**Алгоритм:** `MD5(URL + JSON + API_KEY)`

**Порядок компонентов:** 
1. URL endpoint (относительный путь)
2. JSON string (данные запроса)
3. API Key (секретный ключ)

**Заголовки:**
- `X-MegaCrm-ApiSignature`: MD5 подпись
- `X-MegaCrm-AccountId`: ID аккаунта

**Важно:** 
- Используется MD5, не другой алгоритм
- Порядок компонентов строго определен
- JSON без пробелов
- URL относительный, не полный
