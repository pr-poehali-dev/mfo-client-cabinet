import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';

const DealsDistribution = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f1419] p-4">
      <div className="max-w-4xl mx-auto space-y-6 py-8">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
              <Icon name="Users" size={32} className="text-white" />
            </div>
            <CardTitle className="text-3xl font-montserrat">
              Распределение заявок по номеру телефона
            </CardTitle>
            <CardDescription className="text-lg">
              Как система связывает клиентов и их заявки
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-montserrat flex items-center gap-2">
              <Icon name="Info" size={28} />
              Как работает система
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Синхронизация из AmoCRM</h3>
                  <p className="text-muted-foreground">
                    Система загружает все сделки из AmoCRM и находит контакты с номерами телефонов
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-secondary/5 border border-secondary/20">
                <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-secondary">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Нормализация телефонов</h3>
                  <p className="text-muted-foreground">
                    Все номера приводятся к единому формату: <code className="px-2 py-1 bg-background/50 rounded">+7XXXXXXXXXX</code>
                  </p>
                  <ul className="list-disc ml-6 mt-2 text-sm text-muted-foreground space-y-1">
                    <li>8 (999) 123-45-67 → +79991234567</li>
                    <li>+7 999 123 45 67 → +79991234567</li>
                    <li>79991234567 → +79991234567</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-green-500">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Создание клиентов</h3>
                  <p className="text-muted-foreground">
                    Для каждого уникального номера телефона создаётся клиент в базе данных
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-blue-500">4</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Привязка заявок</h3>
                  <p className="text-muted-foreground">
                    Каждая сделка из AmoCRM привязывается к клиенту по номеру телефона
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-purple-500">5</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Вход в личный кабинет</h3>
                  <p className="text-muted-foreground">
                    Клиент вводит свой номер телефона и видит только свои заявки
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-montserrat flex items-center gap-2">
              <Icon name="Shield" size={28} />
              Защита от дублей и чужих заявок
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-green-500/10 border-green-500/30">
              <Icon name="CheckCircle" size={18} className="text-green-500" />
              <AlertDescription className="text-green-500">
                <strong>Один телефон = Один клиент</strong>
                <p className="mt-2 text-sm">
                  Даже если у клиента много заявок, все они привязаны к одному номеру телефона
                </p>
              </AlertDescription>
            </Alert>

            <Alert className="bg-blue-500/10 border-blue-500/30">
              <Icon name="Lock" size={18} className="text-blue-500" />
              <AlertDescription className="text-blue-500">
                <strong>Фильтрация на уровне БД</strong>
                <p className="mt-2 text-sm">
                  SQL запрос выбирает заявки только с конкретным client_id - невозможно увидеть чужие данные
                </p>
              </AlertDescription>
            </Alert>

            <Alert className="bg-orange-500/10 border-orange-500/30">
              <Icon name="Zap" size={18} className="text-orange-500" />
              <AlertDescription className="text-orange-500">
                <strong>Пропуск дублей</strong>
                <p className="mt-2 text-sm">
                  При синхронизации система проверяет ID сделки и пропускает уже существующие
                </p>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-montserrat flex items-center gap-2">
              <Icon name="Database" size={28} />
              Структура базы данных
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-background/30 border border-border/30">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Icon name="Table" size={20} />
                  Таблица: amocrm_clients
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground ml-6">
                  <li><code>id</code> - Уникальный ID клиента</li>
                  <li><code>phone</code> - Номер телефона (формат +7XXXXXXXXXX)</li>
                  <li><code>name</code> - Имя клиента из AmoCRM</li>
                  <li><code>created_at</code> - Дата создания</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-background/30 border border-border/30">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Icon name="FileText" size={20} />
                  Таблица: amocrm_deals
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground ml-6">
                  <li><code>id</code> - ID сделки из AmoCRM</li>
                  <li><code>client_id</code> - Ссылка на клиента (по телефону)</li>
                  <li><code>name</code> - Название заявки</li>
                  <li><code>price</code> - Сумма</li>
                  <li><code>status_name</code> - Статус заявки</li>
                  <li><code>created_at</code> - Дата создания</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DealsDistribution;
