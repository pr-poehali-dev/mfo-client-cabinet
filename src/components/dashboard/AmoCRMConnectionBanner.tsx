import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const AmoCRMConnectionBanner = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setStatus('checking');
    try {
      const response = await fetch(
        'https://functions.poehali.dev/6e80b3d4-1759-415b-bd93-5e37f93088a5?phone=79991234567'
      );

      if (response.ok || response.status === 404) {
        setStatus('connected');
      } else if (response.status === 401) {
        setStatus('error');
        setErrorMessage('Токен AmoCRM недействителен или истёк');
      } else {
        const data = await response.json();
        if (data.error?.includes('credentials') || data.error?.includes('ACCESS_TOKEN')) {
          setStatus('error');
          setErrorMessage('AmoCRM не подключен. Требуется настройка токенов.');
        } else {
          setStatus('connected');
        }
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Не удалось проверить подключение к AmoCRM');
    }
  };

  if (status === 'checking') {
    return (
      <Alert className="mb-4 bg-blue-500/10 border-blue-500/30">
        <Icon name="Loader2" size={18} className="animate-spin text-blue-400" />
        <AlertDescription className="text-blue-100">
          Проверка подключения к AmoCRM...
        </AlertDescription>
      </Alert>
    );
  }

  if (status === 'error') {
    return (
      <Alert className="mb-4 bg-yellow-500/10 border-yellow-500/30">
        <Icon name="AlertTriangle" size={18} className="text-yellow-400" />
        <AlertDescription className="text-yellow-100 flex items-center justify-between">
          <div>
            <strong>⚠️ AmoCRM не подключен</strong>
            <p className="text-sm mt-1">{errorMessage}</p>
          </div>
          <Button
            onClick={() => window.location.href = '/amocrm-setup'}
            variant="outline"
            size="sm"
            className="ml-4 border-yellow-500/50 text-yellow-100 hover:bg-yellow-500/20"
          >
            <Icon name="Settings" size={16} className="mr-2" />
            Настроить
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default AmoCRMConnectionBanner;
