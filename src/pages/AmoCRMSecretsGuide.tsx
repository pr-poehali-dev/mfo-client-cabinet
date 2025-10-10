import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

const AmoCRMSecretsGuide = () => {
  const secrets = [
    {
      name: 'ACCESS_TOKEN',
      description: 'Токен доступа к AmoCRM API',
      example: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6...',
      required: true,
      howToGet: 'Получите через страницу /amocrm-setup после авторизации'
    },
    {
      name: 'AMOCRM_DOMAIN',
      description: 'Домен вашего аккаунта AmoCRM',
      example: 'stepanmalik88.amocrm.ru',
      required: true,
      howToGet: 'Скопируйте из адресной строки AmoCRM без https://'
    },
    {
      name: 'AMOCRM_CLIENT_ID',
      description: 'ID интеграции из AmoCRM',
      example: '31cf6e60-2cd4-4adb-9be2-ae60c1e67bb3',
      required: true,
      howToGet: 'Получите в Настройки → Интеграции → ваша интеграция'
    },
    {
      name: 'AMOCRM_CLIENT_SECRET',
      description: 'Секретный ключ интеграции',
      example: 'xxxxxxxxxxxxxxxxxxxxxxxxxxx',
      required: true,
      howToGet: 'Получите в Настройки → Интеграции → ваша интеграция'
    },
    {
      name: 'AMOCRM_REFRESH_TOKEN',
      description: 'Токен для автоматического обновления ACCESS_TOKEN',
      example: 'def502004a2b3c4d5e6f7g8h9i0j1k2l...',
      required: true,
      howToGet: 'Получите через страницу /amocrm-setup после авторизации'
    },
    {
      name: 'AMOCRM_REDIRECT_URI',
      description: 'URL для редиректа после OAuth авторизации',
      example: 'https://poehali.dev/amocrm-setup',
      required: true,
      howToGet: 'Используйте: https://poehali.dev/amocrm-setup'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f1419] p-6">
      <div className="max-w-5xl mx-auto">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
              <Icon name="Key" size={32} className="text-white" />
            </div>
            <CardTitle className="text-3xl font-montserrat">
              Секреты для AmoCRM
            </CardTitle>
            <CardDescription>
              Полный список секретов для подключения AmoCRM к проекту
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Alert className="bg-yellow-500/10 border-yellow-500/30">
              <Icon name="AlertTriangle" size={18} className="text-yellow-400" />
              <AlertDescription className="text-yellow-100">
                <strong>Важно:</strong> Добавьте ВСЕ 6 секретов в Настройки проекта → Секреты.
                Без них интеграция с AmoCRM работать не будет!
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              {secrets.map((secret, index) => (
                <div
                  key={secret.name}
                  className="bg-white/5 border border-white/10 rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                      {index + 1}
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-mono font-bold text-white text-lg">
                          {secret.name}
                        </h3>
                        {secret.required && (
                          <span className="bg-red-500/20 text-red-300 text-xs px-2 py-1 rounded">
                            Обязательно
                          </span>
                        )}
                      </div>

                      <p className="text-gray-300 text-sm">
                        {secret.description}
                      </p>

                      <div className="bg-black/30 rounded p-3 border border-white/10">
                        <p className="text-xs text-gray-400 mb-1">Пример:</p>
                        <code className="text-green-400 text-sm break-all">
                          {secret.example}
                        </code>
                      </div>

                      <div className="bg-blue-500/10 rounded p-3 border border-blue-500/20">
                        <p className="text-xs text-blue-300 mb-1 flex items-center gap-1">
                          <Icon name="Info" size={14} />
                          Как получить:
                        </p>
                        <p className="text-blue-100 text-sm">
                          {secret.howToGet}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Alert className="bg-green-500/10 border-green-500/30">
              <Icon name="CheckCircle" size={18} className="text-green-400" />
              <AlertDescription className="text-green-100">
                <strong>Порядок действий:</strong>
                <ol className="list-decimal ml-6 mt-2 space-y-2 text-sm">
                  <li>Создайте интеграцию в AmoCRM (инструкция на странице /amocrm-setup)</li>
                  <li>Получите токены через страницу /amocrm-setup</li>
                  <li>Скопируйте все 6 значений в секреты проекта</li>
                  <li>Проверьте подключение на главной странице</li>
                </ol>
              </AlertDescription>
            </Alert>

            <div className="flex gap-4">
              <Button
                onClick={() => window.location.href = '/amocrm-setup'}
                className="flex-1 bg-gradient-to-r from-primary to-secondary"
              >
                <Icon name="Settings" size={20} className="mr-2" />
                Получить токены
              </Button>

              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="flex-1"
              >
                <Icon name="Home" size={20} className="mr-2" />
                На главную
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AmoCRMSecretsGuide;
