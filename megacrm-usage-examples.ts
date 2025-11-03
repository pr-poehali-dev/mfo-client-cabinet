/**
 * Примеры использования MegaCRM API Client
 */

import MegaCrmClient, {
  generateMegaCrmSignature,
  getMegaCrmHeaders,
  debugSignature
} from './megacrm-signature-utils';

// ============================================
// ПРИМЕР 1: Использование класса MegaCrmClient
// ============================================

async function example1_UsingClient() {
  console.log('\n=== EXAMPLE 1: Using MegaCrmClient ===\n');
  
  // Инициализация клиента
  const client = new MegaCrmClient(
    12345678, // Account ID
    'edaf8e71d644fd09d30f1fc417e1aebe1e66a366' // API Key
  );
  
  try {
    // Создание сделки (POST запрос)
    const createDealResponse = await client.post('/deal/create', {
      title: 'New Deal',
      price: 5000,
      tags: ['VIP', 'Priority']
    });
    
    console.log('Deal created:', createDealResponse);
    
    // Получение списка сделок (GET запрос)
    const dealsList = await client.get('/deal/list', {
      limit: 10,
      offset: 0
    });
    
    console.log('Deals list:', dealsList);
    
  } catch (error) {
    console.error('API Error:', error);
  }
}

// ============================================
// ПРИМЕР 2: Ручная генерация подписи
// ============================================

function example2_ManualSignature() {
  console.log('\n=== EXAMPLE 2: Manual Signature Generation ===\n');
  
  const url = '/deal/create';
  const data = {
    title: 'Test Deal',
    price: 1000,
    tags: ['VIP']
  };
  const apiKey = 'edaf8e71d644fd09d30f1fc417e1aebe1e66a366';
  
  // Генерируем подпись
  const signature = generateMegaCrmSignature(url, data, apiKey);
  
  console.log('Generated Signature:', signature);
  
  // Отладочная информация
  debugSignature(url, data, apiKey);
}

// ============================================
// ПРИМЕР 3: Получение заголовков для запроса
// ============================================

function example3_GetHeaders() {
  console.log('\n=== EXAMPLE 3: Get Request Headers ===\n');
  
  const credentials = {
    accountId: 12345678,
    apiKey: 'edaf8e71d644fd09d30f1fc417e1aebe1e66a366'
  };
  
  const url = '/deal/create';
  const data = {
    title: 'Test Deal',
    price: 1000
  };
  
  // Получаем заголовки
  const headers = getMegaCrmHeaders(url, data, credentials);
  
  console.log('Request Headers:');
  console.log(JSON.stringify(headers, null, 2));
}

// ============================================
// ПРИМЕР 4: Использование с fetch напрямую
// ============================================

async function example4_DirectFetch() {
  console.log('\n=== EXAMPLE 4: Direct Fetch Usage ===\n');
  
  const baseUrl = 'https://api.megacrm.ru/v1';
  const url = '/deal/create';
  
  const credentials = {
    accountId: 12345678,
    apiKey: 'edaf8e71d644fd09d30f1fc417e1aebe1e66a366'
  };
  
  const requestData = {
    title: 'Direct Fetch Deal',
    price: 2000,
    tags: ['Test']
  };
  
  // Генерируем заголовки
  const headers = getMegaCrmHeaders(url, requestData, credentials);
  
  try {
    const response = await fetch(baseUrl + url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const result = await response.json();
    console.log('Response:', result);
    
  } catch (error) {
    console.error('Fetch Error:', error);
  }
}

// ============================================
// ПРИМЕР 5: GET запрос с параметрами
// ============================================

async function example5_GetRequest() {
  console.log('\n=== EXAMPLE 5: GET Request with Parameters ===\n');
  
  const client = new MegaCrmClient(
    12345678,
    'edaf8e71d644fd09d30f1fc417e1aebe1e66a366'
  );
  
  try {
    // Получение сделок с фильтрами
    const deals = await client.get('/deal/list', {
      limit: 20,
      offset: 0,
      status: 'active'
    });
    
    console.log('Filtered Deals:', deals);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// ============================================
// ПРИМЕР 6: Обновление данных (PUT запрос)
// ============================================

async function example6_UpdateRequest() {
  console.log('\n=== EXAMPLE 6: Update Request (PUT) ===\n');
  
  const client = new MegaCrmClient(
    12345678,
    'edaf8e71d644fd09d30f1fc417e1aebe1e66a366'
  );
  
  try {
    // Обновление сделки
    const updateResponse = await client.put('/deal/update', {
      id: 123,
      title: 'Updated Deal Title',
      price: 7500
    });
    
    console.log('Deal Updated:', updateResponse);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// ============================================
// ПРИМЕР 7: Работа с контактами
// ============================================

async function example7_ContactsApi() {
  console.log('\n=== EXAMPLE 7: Contacts API ===\n');
  
  const client = new MegaCrmClient(
    12345678,
    'edaf8e71d644fd09d30f1fc417e1aebe1e66a366'
  );
  
  try {
    // Создание контакта
    const contact = await client.post('/contact/create', {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+79001234567',
      tags: ['Lead', 'Email']
    });
    
    console.log('Contact Created:', contact);
    
    // Получение списка контактов
    const contacts = await client.get('/contact/list', {
      limit: 50
    });
    
    console.log('Contacts Count:', contacts.length);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// ============================================
// ПРИМЕР 8: Обработка ошибок
// ============================================

async function example8_ErrorHandling() {
  console.log('\n=== EXAMPLE 8: Error Handling ===\n');
  
  const client = new MegaCrmClient(
    12345678,
    'wrong_api_key' // Неверный API ключ для демонстрации ошибки
  );
  
  try {
    await client.post('/deal/create', {
      title: 'This will fail'
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Caught Error:');
      console.error('Message:', error.message);
      
      // Проверяем, является ли это ошибкой API
      if (error.message.includes('MegaCRM API Error')) {
        console.error('This is a MegaCRM API error');
        // Можно обработать специфичные ошибки API
      }
    }
  }
}

// ============================================
// ПРИМЕР 9: Пакетные операции
// ============================================

async function example9_BatchOperations() {
  console.log('\n=== EXAMPLE 9: Batch Operations ===\n');
  
  const client = new MegaCrmClient(
    12345678,
    'edaf8e71d644fd09d30f1fc417e1aebe1e66a366'
  );
  
  try {
    // Создание нескольких сделок
    const dealsToCreate = [
      { title: 'Deal 1', price: 1000 },
      { title: 'Deal 2', price: 2000 },
      { title: 'Deal 3', price: 3000 }
    ];
    
    const createdDeals = await Promise.all(
      dealsToCreate.map(deal => 
        client.post('/deal/create', deal)
      )
    );
    
    console.log('Created Deals:', createdDeals.length);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// ============================================
// ПРИМЕР 10: Отладка подписи
// ============================================

function example10_DebugSignature() {
  console.log('\n=== EXAMPLE 10: Debug Signature ===\n');
  
  // Пример 1: POST запрос
  debugSignature(
    '/deal/create',
    { title: 'Test', price: 100 },
    'test_api_key_123'
  );
  
  console.log('\n---\n');
  
  // Пример 2: GET запрос с параметрами
  debugSignature(
    '/deal/list',
    { limit: 10, offset: 0 },
    'test_api_key_123'
  );
  
  console.log('\n---\n');
  
  // Пример 3: Пустые данные
  debugSignature(
    '/deal/delete',
    {},
    'test_api_key_123'
  );
}

// ============================================
// ЗАПУСК ПРИМЕРОВ
// ============================================

async function runExamples() {
  console.log('========================================');
  console.log('MegaCRM API Client - Usage Examples');
  console.log('========================================');
  
  // Запускаем примеры (закомментируйте ненужные)
  
  // await example1_UsingClient();
  example2_ManualSignature();
  example3_GetHeaders();
  // await example4_DirectFetch();
  // await example5_GetRequest();
  // await example6_UpdateRequest();
  // await example7_ContactsApi();
  // await example8_ErrorHandling();
  // await example9_BatchOperations();
  example10_DebugSignature();
  
  console.log('\n========================================');
  console.log('Examples completed!');
  console.log('========================================\n');
}

// Экспорт функций для использования в других модулях
export {
  example1_UsingClient,
  example2_ManualSignature,
  example3_GetHeaders,
  example4_DirectFetch,
  example5_GetRequest,
  example6_UpdateRequest,
  example7_ContactsApi,
  example8_ErrorHandling,
  example9_BatchOperations,
  example10_DebugSignature
};

// Запуск, если файл выполняется напрямую
if (require.main === module) {
  runExamples().catch(console.error);
}
