/**
 * MegaCRM API Signature Utilities
 * 
 * Утилиты для генерации подписи запросов к MegaCRM API
 */

import crypto from 'crypto';

export interface MegaCrmCredentials {
  accountId: number;
  apiKey: string;
}

export interface MegaCrmRequestConfig {
  url: string;
  data?: any;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

/**
 * Генерирует подпись X-MegaCrm-ApiSignature для запроса
 * 
 * Алгоритм: MD5(URL + JSON_BODY + API_KEY)
 * 
 * @param url - Относительный URL эндпоинта (например: '/deal/create')
 * @param data - Данные запроса (для GET - query параметры, для POST - body)
 * @param apiKey - API ключ
 * @returns MD5 хеш подписи в hex формате
 */
export function generateMegaCrmSignature(
  url: string,
  data: any,
  apiKey: string
): string {
  // 1. Преобразуем данные в JSON
  // Если данных нет, используем пустой объект
  const jsonData = JSON.stringify(data || {});
  
  // 2. Конкатенируем в строгом порядке: URL + JSON + API_KEY
  const stringToHash = url + jsonData + apiKey;
  
  // 3. Вычисляем MD5 хеш
  const signature = crypto
    .createHash('md5')
    .update(stringToHash, 'utf8')
    .digest('hex');
  
  return signature;
}

/**
 * Формирует заголовки для запроса к MegaCRM API
 * 
 * @param url - Относительный URL эндпоинта
 * @param data - Данные запроса
 * @param credentials - Учетные данные (accountId и apiKey)
 * @returns Объект с заголовками
 */
export function getMegaCrmHeaders(
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

/**
 * Выполняет запрос к MegaCRM API с автоматической генерацией подписи
 * 
 * @param baseUrl - Базовый URL API (например: 'https://api.megacrm.ru/v1')
 * @param config - Конфигурация запроса
 * @param credentials - Учетные данные
 * @returns Promise с ответом API
 */
export async function megaCrmRequest<T = any>(
  baseUrl: string,
  config: MegaCrmRequestConfig,
  credentials: MegaCrmCredentials
): Promise<T> {
  const { url, data = {}, method = 'POST' } = config;
  
  // Генерируем заголовки с подписью
  const headers = getMegaCrmHeaders(url, data, credentials);
  
  // Формируем полный URL
  const fullUrl = baseUrl + url;
  
  // Для GET запросов добавляем параметры в query string
  let requestUrl = fullUrl;
  let requestBody: string | undefined;
  
  if (method === 'GET' && data && Object.keys(data).length > 0) {
    const queryParams = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      queryParams.append(key, String(value));
    });
    requestUrl = `${fullUrl}?${queryParams.toString()}`;
  } else if (method !== 'GET') {
    requestBody = JSON.stringify(data);
  }
  
  // Выполняем запрос
  const response = await fetch(requestUrl, {
    method,
    headers,
    body: requestBody
  });
  
  // Проверяем статус ответа
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `MegaCRM API Error (${response.status}): ${errorText}`
    );
  }
  
  // Парсим JSON ответ
  return await response.json();
}

/**
 * Класс для работы с MegaCRM API
 */
export class MegaCrmClient {
  private baseUrl: string;
  private credentials: MegaCrmCredentials;
  
  constructor(
    accountId: number,
    apiKey: string,
    baseUrl: string = 'https://api.megacrm.ru/v1'
  ) {
    this.baseUrl = baseUrl;
    this.credentials = {
      accountId,
      apiKey
    };
  }
  
  /**
   * Выполняет GET запрос
   */
  async get<T = any>(url: string, params?: any): Promise<T> {
    return megaCrmRequest<T>(
      this.baseUrl,
      { url, data: params, method: 'GET' },
      this.credentials
    );
  }
  
  /**
   * Выполняет POST запрос
   */
  async post<T = any>(url: string, data?: any): Promise<T> {
    return megaCrmRequest<T>(
      this.baseUrl,
      { url, data, method: 'POST' },
      this.credentials
    );
  }
  
  /**
   * Выполняет PUT запрос
   */
  async put<T = any>(url: string, data?: any): Promise<T> {
    return megaCrmRequest<T>(
      this.baseUrl,
      { url, data, method: 'PUT' },
      this.credentials
    );
  }
  
  /**
   * Выполняет DELETE запрос
   */
  async delete<T = any>(url: string, data?: any): Promise<T> {
    return megaCrmRequest<T>(
      this.baseUrl,
      { url, data, method: 'DELETE' },
      this.credentials
    );
  }
  
  /**
   * Генерирует заголовки для запроса (для отладки)
   */
  getHeaders(url: string, data?: any): Record<string, string> {
    return getMegaCrmHeaders(url, data || {}, this.credentials);
  }
}

/**
 * Функция для отладки генерации подписи
 */
export function debugSignature(url: string, data: any, apiKey: string): void {
  const jsonData = JSON.stringify(data || {});
  const stringToHash = url + jsonData + apiKey;
  const signature = generateMegaCrmSignature(url, data, apiKey);
  
  console.log('=== DEBUG MEGACRM SIGNATURE ===');
  console.log('URL:', url);
  console.log('Data:', data);
  console.log('JSON Data:', jsonData);
  console.log('API Key:', apiKey);
  console.log('String to hash:', stringToHash);
  console.log('MD5 Signature:', signature);
  console.log('===============================');
}

// Экспорт для использования в других модулях
export default MegaCrmClient;
