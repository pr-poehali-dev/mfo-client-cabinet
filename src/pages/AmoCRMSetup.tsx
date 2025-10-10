import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import ConnectionTest from '@/components/amocrm/ConnectionTest';
import SetupInstructions from '@/components/amocrm/SetupInstructions';
import SetupForm from '@/components/amocrm/SetupForm';
import TokensDisplay from '@/components/amocrm/TokensDisplay';

const AmoCRMSetup = () => {
  const [step, setStep] = useState<'info' | 'token'>('info');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');
    if (authCode) {
      setCode(authCode);
    }
  }, []);

  const [subdomain, setSubdomain] = useState('stepanmalik88');
  const [clientId, setClientId] = useState('d71f2423-d72b-4589-95dc-f28927138046');
  const [clientSecret, setClientSecret] = useState('2yDEDiU8pz5eU8J6hBDoCESmq35KLZOYSdrm8qnFbC8b2unZ0eFBAapGcC0YC11B');
  const [code, setCode] = useState('');
  const [redirectUri, setRedirectUri] = useState('https://poehali.dev/amocrm-setup');
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [testResult, setTestResult] = useState<{success: boolean; message: string} | null>(null);
  const [testLoading, setTestLoading] = useState(false);

  const handleGetToken = async () => {
    if (!subdomain || !clientId || !clientSecret || !code || !redirectUri) {
      setError('Заполните все поля');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        'https://functions.poehali.dev/06bc6704-e76c-4833-9904-f61f7519ea8e',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subdomain,
            client_id: clientId,
            client_secret: clientSecret,
            code,
            redirect_uri: redirectUri
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        setAccessToken(data.access_token);
        setRefreshToken(data.refresh_token);
        setStep('token');
      } else {
        setError(data.error || 'Не удалось получить токен');
      }
    } catch (err) {
      console.error('OAuth error:', err);
      setError('Ошибка подключения к AmoCRM');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleTestConnection = async () => {
    setTestLoading(true);
    setTestResult(null);

    try {
      const response = await fetch(
        `https://functions.poehali.dev/6e80b3d4-1759-415b-bd93-5e37f93088a5?phone=79991234567`
      );
      
      const data = await response.json();

      if (response.ok) {
        setTestResult({
          success: true,
          message: `Подключение успешно! Найдено сделок: ${data.total_deals || 0}`
        });
      } else if (response.status === 404) {
        setTestResult({
          success: true,
          message: 'Подключение работает! (Тестовый клиент не найден, но это нормально)'
        });
      } else if (response.status === 401) {
        setTestResult({
          success: false,
          message: 'Токен недействителен. Пройдите настройку заново или обновите токен.'
        });
      } else if (data.error?.includes('credentials')) {
        setTestResult({
          success: false,
          message: 'Секреты не настроены. Добавьте ACCESS_TOKEN и AMOCRM_DOMAIN в настройки проекта.'
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Ошибка подключения к AmoCRM'
        });
      }
    } catch (err) {
      console.error('Test connection error:', err);
      setTestResult({
        success: false,
        message: 'Не удалось проверить подключение'
      });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f1419] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
            <Icon name="Settings" size={32} className="text-white" />
          </div>
          <CardTitle className="text-3xl font-montserrat">
            Настройка AmoCRM
          </CardTitle>
          <CardDescription>
            Получите Access Token для интеграции с AmoCRM
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ConnectionTest
            testLoading={testLoading}
            testResult={testResult}
            onTest={handleTestConnection}
          />

          {step === 'info' ? (
            <div className="space-y-6">
              <SetupInstructions />
              <SetupForm
                subdomain={subdomain}
                setSubdomain={setSubdomain}
                clientId={clientId}
                setClientId={setClientId}
                clientSecret={clientSecret}
                setClientSecret={setClientSecret}
                redirectUri={redirectUri}
                setRedirectUri={setRedirectUri}
                code={code}
                setCode={setCode}
                error={error}
                loading={loading}
                onGetToken={handleGetToken}
              />
            </div>
          ) : (
            <TokensDisplay
              accessToken={accessToken}
              refreshToken={refreshToken}
              subdomain={subdomain}
              clientId={clientId}
              clientSecret={clientSecret}
              redirectUri={redirectUri}
              onCopyToClipboard={copyToClipboard}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AmoCRMSetup;
