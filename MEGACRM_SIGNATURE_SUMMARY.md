# MegaCRM API - Краткое резюме по генерации подписи

## Основная информация

**Репозиторий:** https://github.com/megagroup-official/megacrm-api-client

**Файл с алгоритмом:** `src/Client.php`

**Метод генерации подписи:** `getSignature()`

---

## Алгоритм генерации подписи (коротко)

```
X-MegaCrm-ApiSignature = MD5(URL + JSON_BODY + API_KEY)
```

### Формула в PHP:
```php
$signature = md5($url . json_encode($data) . $api_key);
```

### Формула в TypeScript:
```typescript
const signature = crypto
  .createHash('md5')
  .update(url + JSON.stringify(data) + apiKey)
  .digest('hex');
```

---

## Ответы на ваши вопросы

### 1. Как генерируется подпись для заголовка X-MegaCrm-ApiSignature?

Подпись генерируется путем конкатенации трех компонентов и применения MD5 хеша:

```php
private function getSignature(RequestInterface $request)
{
    return md5(
        $request->getUrl()                      // URL эндпоинта
        . json_encode($request->jsonSerialize()) // JSON данные
        . $this->api_key                        // API ключ
    );
}
```

### 2. Какие данные используются для создания подписи?

Три компонента в строгом порядке:

1. **URL** - Относительный путь эндпоинта (например: `/deal/create`)
2. **JSON Body** - JSON-строка с данными запроса (параметры для GET или body для POST)
3. **API Key** - Секретный ключ API

**Важно:** Порядок строго определен и не может быть изменен!

### 3. Какой алгоритм используется?

**MD5** (Message Digest Algorithm 5)

- НЕ SHA256
- НЕ HMAC
- НЕ SHA1

Простое MD5 хеширование конкатенированной строки.

### 4. В каком порядке собираются данные для подписи?

**Порядок:**
1. URL (первым)
2. JSON-encoded данные (вторым)
3. API Key (последним)

**Пример конкатенации:**
```
/deal/create{"title":"Test","price":1000}edaf8e71d644fd09d30f1fc417e1aebe1e66a366
```

---

## Исходный код из репозитория

### Метод генерации подписи (PHP):

```php
/**
 * @param RequestInterface $request
 * @return string
 */
private function getSignature(RequestInterface $request)
{
    return md5(
        $request->getUrl()
        . json_encode($request->jsonSerialize())
        . $this->api_key
    );
}
```

### Метод формирования заголовков (PHP):

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

## Необходимые заголовки

Каждый запрос должен содержать:

```
X-MegaCrm-ApiSignature: <MD5 подпись>
X-MegaCrm-AccountId: <ID аккаунта>
Content-Type: application/json
```

---

## Пример запроса

### Исходные данные:
```
URL: /deal/create
Account ID: 12345678
API Key: edaf8e71d644fd09d30f1fc417e1aebe1e66a366

Data: {
  "title": "Test Deal",
  "price": 1000
}
```

### Генерация подписи:

**Шаг 1:** Формируем строку для хеширования:
```
/deal/create{"title":"Test Deal","price":1000}edaf8e71d644fd09d30f1fc417e1aebe1e66a366
```

**Шаг 2:** Вычисляем MD5:
```php
$signature = md5('/deal/create{"title":"Test Deal","price":1000}edaf8e71d644fd09d30f1fc417e1aebe1e66a366');
```

**Шаг 3:** Формируем заголовки:
```
X-MegaCrm-ApiSignature: <вычисленный MD5>
X-MegaCrm-AccountId: 12345678
Content-Type: application/json
```

---

## Пример кода на TypeScript (для вашего проекта)

```typescript
import crypto from 'crypto';

function generateMegaCrmSignature(
  url: string,
  data: any,
  apiKey: string
): string {
  const jsonData = JSON.stringify(data);
  const stringToHash = url + jsonData + apiKey;
  
  return crypto
    .createHash('md5')
    .update(stringToHash)
    .digest('hex');
}

// Использование:
const signature = generateMegaCrmSignature(
  '/deal/create',
  { title: 'Test', price: 1000 },
  'your_api_key_here'
);

const headers = {
  'X-MegaCrm-ApiSignature': signature,
  'X-MegaCrm-AccountId': '12345678',
  'Content-Type': 'application/json'
};
```

---

## Важные детали

1. **Алгоритм:** MD5 (не SHA256, не HMAC)
2. **Порядок:** URL → JSON → API_KEY (строго!)
3. **Кодировка:** UTF-8
4. **JSON:** Без пробелов, стандартная сериализация
5. **URL:** Относительный путь от базового endpoint
6. **Пустые данные:** Используется `{}`
7. **GET запросы:** Параметры также сериализуются в JSON

---

## Файлы в проекте

1. **megacrm_client_decoded.php** - Декодированный исходник PHP клиента
2. **MEGACRM_API_SIGNATURE_ALGORITHM.md** - Полная документация с примерами
3. **megacrm-signature-utils.ts** - TypeScript утилиты для генерации подписи
4. **megacrm-usage-examples.ts** - Примеры использования на TypeScript

---

## Базовый endpoint

```
https://api.megacrm.ru/v1/
```

---

## Проверено

Алгоритм извлечен из официального репозитория:
- Repository: https://github.com/megagroup-official/megacrm-api-client
- File: src/Client.php
- Commit: 80be5ffc4568bf1a7e7ea7428d2abfff909fbe75
- Method: getSignature()
