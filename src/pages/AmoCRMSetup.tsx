import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Icon from '@/components/ui/icon';

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
  const [clientSecret, setClientSecret] = useState('');
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
                  Проверить подключение к AmoCRM
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

          {step === 'info' ? (
            <div className="space-y-6">
              <Accordion type="single" collapsible className="mb-6">
                <AccordionItem value="instruction" className="border border-blue-500/30 rounded-lg px-4 bg-blue-500/5">
                  <AccordionTrigger className="text-blue-100 hover:text-blue-50">
                    <div className="flex items-center gap-2">
                      <Icon name="BookOpen" size={18} />
                      <strong>📖 Подробная инструкция: Как создать интеграцию в AmoCRM</strong>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-300 space-y-4 pt-4">
                    <div className="space-y-3">
                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                          <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">1</span>
                          Войдите в AmoCRM
                        </h4>
                        <p>Откройте ваш аккаунт AmoCRM: <code className="bg-white/10 px-2 py-1 rounded">https://ваш-поддомен.amocrm.ru</code></p>
                      </div>

                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                          <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">2</span>
                          Откройте настройки интеграций
                        </h4>
                        <ul className="list-disc ml-6 space-y-1">
                          <li>Нажмите на <strong>иконку профиля</strong> (правый верхний угол)</li>
                          <li>Выберите <strong>"Настройки"</strong></li>
                          <li>В левом меню найдите раздел <strong>"Интеграции"</strong></li>
                        </ul>
                      </div>

                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                          <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">3</span>
                          Создайте новую интеграцию
                        </h4>
                        <ul className="list-disc ml-6 space-y-1">
                          <li>Нажмите <strong>"+ Создать интеграцию"</strong> в правом верхнем углу</li>
                          <li>Выберите <strong>"Создать приватную интеграцию"</strong></li>
                          <li>Заполните название (например: "Личный кабинет клиентов")</li>
                        </ul>
                      </div>

                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                          <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">4</span>
                          Настройте Redirect URI
                        </h4>
                        <p className="mb-2">В поле <strong>"Redirect URI"</strong> вставьте:</p>
                        <code className="block bg-black/30 px-3 py-2 rounded border border-primary/30 text-primary">https://poehali.dev/amocrm-setup</code>
                        <p className="mt-2 text-yellow-300">⚠️ Это обязательное поле! Без него авторизация не сработает.</p>
                      </div>

                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                          <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">5</span>
                          Настройте права доступа
                        </h4>
                        <p className="mb-2">Включите следующие разрешения:</p>
                        <ul className="list-disc ml-6 space-y-1">
                          <li>✅ Контакты: <strong>Чтение</strong> и <strong>Запись</strong></li>
                          <li>✅ Сделки: <strong>Чтение</strong> и <strong>Запись</strong></li>
                          <li>✅ Задачи: <strong>Чтение</strong> и <strong>Запись</strong></li>
                          <li>✅ Примечания: <strong>Чтение</strong> и <strong>Запись</strong></li>
                        </ul>
                      </div>

                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                          <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">6</span>
                          Сохраните интеграцию
                        </h4>
                        <p>Нажмите <strong>"Сохранить"</strong> внизу страницы</p>
                      </div>

                      <div className="bg-white/5 rounded-lg p-4 border border-green-500/30">
                        <h4 className="font-bold text-green-400 mb-2 flex items-center gap-2">
                          <Icon name="CheckCircle" size={18} />
                          Скопируйте данные для подключения
                        </h4>
                        <p className="mb-2">После сохранения вы увидите:</p>
                        <ul className="list-disc ml-6 space-y-1">
                          <li><strong>ID интеграции</strong> (Client ID) - UUID формата</li>
                          <li><strong>Секретный ключ</strong> (Client Secret) - длинная строка</li>
                        </ul>
                        <p className="mt-2 text-green-300">✅ Скопируйте эти значения и вставьте в поля ниже!</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Alert>
                <Icon name="Info" size={18} />
                <AlertDescription>
                  <strong>Краткая инструкция:</strong>
                  <ol className="list-decimal ml-4 mt-2 space-y-1 text-sm">
                    <li>Зайдите в AmoCRM → Настройки → Интеграции</li>
                    <li>Создайте новую интеграцию или используйте существующую</li>
                    <li>Скопируйте ID интеграции и Секретный ключ</li>
                    <li>Перейдите по ссылке авторизации (будет ниже)</li>
                    <li>Скопируйте код из адресной строки после авторизации</li>
                  </ol>
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subdomain">Поддомен AmoCRM</Label>
                  <Input
                    id="subdomain"
                    placeholder="mycompany"
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Из адреса: https://<strong>mycompany</strong>.amocrm.ru
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientId">ID интеграции (Client ID)</Label>
                  <Input
                    id="clientId"
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientSecret">Секретный ключ (Client Secret)</Label>
                  <Input
                    id="clientSecret"
                    type="password"
                    placeholder="xxxxxxxxxxxxxxxxxxxxxxxx"
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="redirectUri">Redirect URI</Label>
                  <Input
                    id="redirectUri"
                    placeholder="https://example.com"
                    value={redirectUri}
                    onChange={(e) => setRedirectUri(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Должен совпадать с указанным в настройках интеграции
                  </p>
                </div>

                {subdomain && clientId && redirectUri && (
                  <Alert className="bg-secondary/10 border-secondary/30">
                    <Icon name="Link" size={18} />
                    <AlertDescription>
                      <p className="font-semibold mb-2">Ссылка для авторизации:</p>
                      <div className="flex gap-2">
                        <code className="flex-1 p-2 bg-muted/50 rounded text-xs break-all">
                          {`https://${subdomain}.amocrm.ru/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=random_string`}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`https://${subdomain}.amocrm.ru/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=random_string`, '_blank')}
                        >
                          <Icon name="ExternalLink" size={16} />
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="code">Код авторизации (из URL после авторизации)</Label>
                  <Input
                    id="code"
                    placeholder="def50200..."
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    После авторизации скопируйте параметр <code>code=</code> из адресной строки
                  </p>
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
                  disabled={loading}
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
                      Получить Access Token
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <Alert className="bg-accent/10 border-accent/30">
                <Icon name="CheckCircle" size={18} className="text-accent" />
                <AlertDescription>
                  <strong className="text-accent">Успешно!</strong> Access Token получен
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Access Token (ACCESS_TOKEN)</Label>
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
                  <Label>Refresh Token (AMOCRM_REFRESH_TOKEN)</Label>
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
                  <p className="text-xs text-muted-foreground">
                    Используется для автоматического обновления токена
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Домен AmoCRM (AMOCRM_DOMAIN)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={`${subdomain}.amocrm.ru`}
                      readOnly
                      className="font-mono text-xs"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(`${subdomain}.amocrm.ru`)}
                    >
                      <Icon name="Copy" size={16} />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Client ID (AMOCRM_CLIENT_ID)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={clientId}
                      readOnly
                      className="font-mono text-xs"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(clientId)}
                    >
                      <Icon name="Copy" size={16} />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Client Secret (AMOCRM_CLIENT_SECRET)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={clientSecret}
                      readOnly
                      className="font-mono text-xs"
                      type="password"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(clientSecret)}
                    >
                      <Icon name="Copy" size={16} />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Redirect URI (AMOCRM_REDIRECT_URI)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={redirectUri}
                      readOnly
                      className="font-mono text-xs"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(redirectUri)}
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
                      <li>Откройте <strong>Настройки → Секреты проекта</strong></li>
                      <li>Скопируйте все значения выше в соответствующие секреты</li>
                      <li><strong>ВАЖНО:</strong> Добавьте все 6 секретов для автообновления токена</li>
                      <li>Сохраните изменения</li>
                    </ol>
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={() => window.location.href = '/'}
                  className="w-full bg-gradient-to-r from-primary to-secondary"
                >
                  <Icon name="Home" size={20} className="mr-2" />
                  Перейти в личный кабинет
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AmoCRMSetup;