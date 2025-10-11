import { useState } from 'react';

interface AmoCRMClient {
  id: string;
  name: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
}

interface AmoCRMDeal {
  id: string;
  name: string;
  price: number;
  status_id: number;
  status_name: string;
  pipeline_id: number;
  created_at: number;
  updated_at: number;
  closed_at?: number;
}

interface AmoCRMData {
  client: AmoCRMClient;
  deals: AmoCRMDeal[];
  total_deals: number;
}

export const useAmoCRM = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDeals = async (phone: string): Promise<AmoCRMData | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://functions.poehali.dev/e6a0215a-0de8-499a-9306-b86675ec02d5?phone=${phone}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка получения данных');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createDeal = async (name: string, phone: string, amount?: number): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        'https://functions.poehali.dev/b260ef22-d5c1-4259-b2ef-44e4db32cb55',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, phone, amount: amount || 0 })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка создания заявки');
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async (): Promise<{ access_token: string; refresh_token: string } | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        'https://functions.poehali.dev/bd4f1139-f517-46a8-a562-642004ca1f36',
        {
          method: 'POST'
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка обновления токена');
      }

      const data = await response.json();
      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getDeals,
    createDeal,
    refreshToken
  };
};