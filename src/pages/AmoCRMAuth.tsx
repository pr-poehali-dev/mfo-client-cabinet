import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';

const AmoCRMAuth = () => {
  const [step, setStep] = useState<'input' | 'tokens'>('input');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const subdomain = 'stepanmalik88';
  const clientId = 'd71f2423-d72b-4589-95dc-f28927138046';
  const clientSecret = '2yDEDiU8pz5eU8J6hBDoCESmq35KLZOYSdrm8qnFbC8b2unZ0eFBAapGcC0YC11B';
  const redirectUri = 'https://poehali.dev';

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');
    if (authCode) {
      setCode(authCode);
    }
  }, []);

  const authUrl = `https://${subdomain}.amocrm.ru/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=amocrm_auth`;

  const handleGetToken = async () => {
    if (!code) {
      setError('Код авторизации обязателен');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        'https://functions.poehali.dev/a83ccba2-ed09-422c-82fd-2cb908a2b8f7',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code })
        }
      );

      const data = await response.json();

      if (data.success && data.access_token) {
        setAccessToken(data.access_token);
        setRefreshToken(data.refresh_token);
        setStep('tokens');
      } else {
        setError(data.error || 'Не удалось получить токен');
      }
    } catch (err) {
      console.error('OAuth error:', err);
      setError('Ошибка подключения к серверу');
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
        `https://functions.poehali.dev/e6a0215a-0de8-499a-9306-b86675ec02d5?phone=79991234567`
      );
      
      const data = await response.json();

      if (response.ok) {
        setTestResult({
          success: true,
          message: `Подключение работает! Найдено сделок: ${data.total_deals || 0}`
        });
      } else if (response.status === 404) {
        setTestResult({
          success: true,
          message: 'Подключение работает! (Тестовый номер не найден, но API отвечает)'
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Ошибка подключения'
        });
      }
    } catch (err) {
      console.error('Test error:', err);
      setTestResult({
        success: false,
        message: 'Не удалось проверить подключение'
      });
    } finally {
      setTestLoading(false);
    }
  };

  const handleRefreshToken = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        'https://functions.poehali.dev/bd4f1139-f517-46a8-a562-642004ca1f36',
        { method: 'POST' }
      );

      const data = await response.json();

      if (data.success) {
        setAccessToken(data.access_token);
        setRefreshToken(data.refresh_token);
        setStep('tokens');
        setTestResult({
          success: true,
          message: 'Токен успешно обновлён!'
        });
      } else {
        setError(data.error || 'Не удалось обновить токен');
      }
    } catch (err) {
      console.error('Refresh error:', err);
      setError('Ошибка обновления токена');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f1419] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
            <Icon name="Key" size={32} className="text-white" />
          </div>
          <CardTitle className="text-3xl font-montserrat">
            Авторизация AmoCRM
          </CardTitle>
          <CardDescription>
            Получите Access Token для подключения к AmoCRM
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="mb-6">
            <Button
              onClick={handleTestConnection}
              disabled={testLoading}
              variant="outline"
              className="w-full"
            >
              {testLoading ? (
                <>
                  <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                  Проверка подключения...
                </>
              ) : (
                <>
                  <Icon name="Wifi" size={20} className="mr-2" />
                  Проверить текущее подключение
                </>
              )}
            </Button>

            {testResult && (
              <Alert className={`mt-4 ${testResult.success ? 'bg-accent/10 border-accent/30' : 'bg-destructive/10 border-destructive/30'}`}>
                <Icon name={testResult.success ? 'CheckCircle' : 'AlertCircle'} size={18} className={testResult.success ? 'text-accent' : 'text-destructive'} />
                <AlertDescription className={testResult.success ? 'text-accent' : 'text-destructive'}>
                  {testResult.message}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {step === 'input' ? (
            <div className="space-y-4">
              <Alert>
                <Icon name="Info" size={18} />
                <AlertDescription>
                  <strong>Шаг 1:</strong> Авторизуйтесь в AmoCRM по кнопке ниже
                </AlertDescription>
              </Alert>

              <Button
                onClick={() => window.open(authUrl, '_blank')}
                className="w-full bg-gradient-to-r from-primary to-secondary"
              >
                <Icon name="ExternalLink" size={20} className="mr-2" />
                Авторизоваться в AmoCRM
              </Button>

              <Alert>
                <Icon name="Info" size={18} />
                <AlertDescription>
                  <strong>Шаг 2:</strong> После авторизации скопируйте код из URL (параметр <code>code=</code>)
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="code">Код авторизации</Label>
                <Input
                  id="code"
                  placeholder="def50200..."
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>

              {error && (
                <Alert className="bg-destructive/10 border-destructive/30">
                  <Icon name="AlertCircle" size={18} className="text-destructive" />
                  <AlertDescription className="text-destructive">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleGetToken}
                disabled={loading || !code}
                className="w-full bg-gradient-to-r from-primary to-secondary"
              >
                {loading ? (
                  <>
                    <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                    Получение токена...
                  </>
                ) : (
                  <>
                    <Icon name="Key" size={20} className="mr-2" />
                    Получить токены
                  </>
                )}
              </Button>

              <div className="pt-4 border-t">
                <Alert>
                  <Icon name="RefreshCw" size={18} />
                  <AlertDescription>
                    <strong>Или обновите существующий токен:</strong>
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={handleRefreshToken}
                  disabled={loading}
                  variant="outline"
                  className="w-full mt-4"
                >
                  <Icon name="RefreshCw" size={20} className="mr-2" />
                  Обновить токен
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert className="bg-accent/10 border-accent/30">
                <Icon name="CheckCircle" size={18} className="text-accent" />
                <AlertDescription className="text-accent">
                  <strong>Токены получены!</strong> Скопируйте их в секреты проекта
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>AMOCRM_ACCESS_TOKEN</Label>
                <div className="flex gap-2">
                  <Input
                    value={accessToken}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(accessToken)}
                  >
                    <Icon name="Copy" size={16} />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>AMOCRM_REFRESH_TOKEN</Label>
                <div className="flex gap-2">
                  <Input
                    value={refreshToken}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(refreshToken)}
                  >
                    <Icon name="Copy" size={16} />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>AMOCRM_SUBDOMAIN</Label>
                <div className="flex gap-2">
                  <Input
                    value={subdomain}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(subdomain)}
                  >
                    <Icon name="Copy" size={16} />
                  </Button>
                </div>
              </div>

              <Alert>
                <Icon name="Info" size={18} />
                <AlertDescription>
                  <strong>Следующий шаг:</strong>
                  <ol className="list-decimal ml-4 mt-2 space-y-1 text-sm">
                    <li>Откройте настройки проекта → Секреты</li>
                    <li>Обновите <code>AMOCRM_ACCESS_TOKEN</code></li>
                    <li>Обновите <code>AMOCRM_REFRESH_TOKEN</code></li>
                    <li>Нажмите "Проверить подключение" выше</li>
                  </ol>
                </AlertDescription>
              </Alert>

              <Button
                onClick={() => {
                  setStep('input');
                  setCode('');
                  setAccessToken('');
                  setRefreshToken('');
                }}
                variant="outline"
                className="w-full"
              >
                <Icon name="ArrowLeft" size={20} className="mr-2" />
                Получить новые токены
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AmoCRMAuth;