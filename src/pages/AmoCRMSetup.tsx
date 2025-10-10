import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';

const AmoCRMSetup = () => {
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<{
    configured: boolean;
    message: string;
    details?: string;
  } | null>(null);

  const checkConfiguration = async () => {
    setChecking(true);
    setStatus(null);

    try {
      const response = await fetch(
        'https://functions.poehali.dev/e6a0215a-0de8-499a-9306-b86675ec02d5?phone=79991234567'
      );

      const data = await response.json();

      if (response.ok) {
        setStatus({
          configured: true,
          message: '✅ AmoCRM настроен правильно!',
          details: `Найдено сделок: ${data.total_deals || 0}`
        });
      } else if (response.status === 404) {
        setStatus({
          configured: true,
          message: '✅ AmoCRM настроен правильно!',
          details: 'API работает (тестовый номер не найден, но это нормально)'
        });
      } else if (response.status === 401) {
        setStatus({
          configured: false,
          message: '❌ Токен недействителен',
          details: 'Токен AMOCRM_ACCESS_TOKEN истёк или неверный. Нужно обновить.'
        });
      } else if (data.error?.includes('секреты')) {
        setStatus({
          configured: false,
          message: '❌ Секреты не настроены',
          details: 'Проверьте, что все 6 секретов заполнены правильными значениями'
        });
      } else {
        setStatus({
          configured: false,
          message: '❌ Ошибка подключения',
          details: data.error || 'Неизвестная ошибка'
        });
      }
    } catch (err) {
      setStatus({
        configured: false,
        message: '❌ Ошибка сети',
        details: 'Не удалось подключиться к API'
      });
    } finally {
      setChecking(false);
    }
  };

  const requiredSecrets = [
    {
      name: 'AMOCRM_SUBDOMAIN',
      example: 'stepanmalik88',
      description: 'Ваш поддомен из адреса stepanmalik88.amocrm.ru'
    },
    {
      name: 'AMOCRM_CLIENT_ID',
      example: 'd71f2423-d72b-4589-95dc-f28927138046',
      description: 'ID интеграции из настроек AmoCRM'
    },
    {
      name: 'AMOCRM_CLIENT_SECRET',
      example: '2yDEDiU8pz5eU8J6hBDoCE...',
      description: 'Секретный ключ из настроек AmoCRM'
    },
    {
      name: 'AMOCRM_REDIRECT_URI',
      example: 'https://poehali.dev',
      description: 'URL для редиректа (должен совпадать с настройками интеграции)'
    },
    {
      name: 'AMOCRM_ACCESS_TOKEN',
      example: 'eyJ0eXAiOiJKV1QiLCJ...',
      description: 'Токен доступа (получается через OAuth)'
    },
    {
      name: 'AMOCRM_REFRESH_TOKEN',
      example: 'def502004f6a4e...',
      description: 'Токен обновления (получается вместе с Access Token)'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f1419] p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm mb-6">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
              <Icon name="Settings" size={32} className="text-white" />
            </div>
            <CardTitle className="text-3xl font-montserrat">
              Настройка AmoCRM
            </CardTitle>
            <CardDescription>
              Пошаговая инструкция по подключению AmoCRM к вашему сайту
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Button
                onClick={checkConfiguration}
                disabled={checking}
                className="w-full bg-gradient-to-r from-primary to-secondary"
                size="lg"
              >
                {checking ? (
                  <>
                    <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                    Проверка...
                  </>
                ) : (
                  <>
                    <Icon name="CheckCircle" size={20} className="mr-2" />
                    Проверить настройку AmoCRM
                  </>
                )}
              </Button>

              {status && (
                <Alert className={`mt-4 ${status.configured ? 'bg-accent/10 border-accent/30' : 'bg-destructive/10 border-destructive/30'}`}>
                  <Icon name={status.configured ? 'CheckCircle' : 'AlertCircle'} size={18} className={status.configured ? 'text-accent' : 'text-destructive'} />
                  <AlertDescription className={status.configured ? 'text-accent' : 'text-destructive'}>
                    <div className="font-semibold">{status.message}</div>
                    {status.details && <div className="text-sm mt-1">{status.details}</div>}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">1</div>
              Создайте интеграцию в AmoCRM
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ol className="list-decimal ml-5 space-y-2 text-sm">
              <li>Войдите в ваш AmoCRM аккаунт: <code className="bg-muted px-2 py-1 rounded">stepanmalik88.amocrm.ru</code></li>
              <li>Перейдите в <strong>Настройки</strong> → <strong>Интеграции</strong> → <strong>Создать интеграцию</strong></li>
              <li>Заполните форму:
                <ul className="list-disc ml-5 mt-2 space-y-1">
                  <li>Название: <code className="bg-muted px-2 py-1 rounded">Мой сайт</code></li>
                  <li>Redirect URI: <code className="bg-muted px-2 py-1 rounded">https://poehali.dev</code></li>
                </ul>
              </li>
              <li>Сохраните и скопируйте <strong>Client ID</strong> и <strong>Client Secret</strong></li>
            </ol>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">2</div>
              Добавьте секреты в проект
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Icon name="Info" size={18} />
              <AlertDescription>
                Откройте <strong>Настройки проекта → Секреты</strong> и заполните следующие поля:
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              {requiredSecrets.map((secret) => (
                <div key={secret.name} className="p-3 bg-muted/30 rounded-lg">
                  <div className="font-mono text-sm font-semibold text-primary mb-1">
                    {secret.name}
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    {secret.description}
                  </div>
                  <code className="text-xs bg-muted px-2 py-1 rounded block break-all">
                    {secret.example}
                  </code>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">3</div>
              Получите токены доступа
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Icon name="Key" size={18} />
              <AlertDescription>
                Для получения <strong>AMOCRM_ACCESS_TOKEN</strong> и <strong>AMOCRM_REFRESH_TOKEN</strong>:
              </AlertDescription>
            </Alert>

            <Button
              onClick={() => window.location.href = '/amocrm-auth'}
              className="w-full bg-gradient-to-r from-primary to-secondary"
              size="lg"
            >
              <Icon name="Key" size={20} className="mr-2" />
              Перейти к получению токенов
            </Button>

            <div className="text-sm text-muted-foreground">
              <p>На странице авторизации вы сможете:</p>
              <ul className="list-disc ml-5 mt-2 space-y-1">
                <li>Авторизоваться в AmoCRM</li>
                <li>Получить Access Token и Refresh Token</li>
                <li>Скопировать токены для добавления в секреты</li>
                <li>Автоматически обновить истёкший токен</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AmoCRMSetup;
