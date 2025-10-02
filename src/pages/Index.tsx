import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';

interface Loan {
  id: string;
  amount: number;
  paid: number;
  status: 'active' | 'completed' | 'overdue';
  date: string;
  nextPayment: string;
  rate: number;
}

interface Payment {
  id: string;
  amount: number;
  date: string;
  type: 'payment' | 'fee' | 'penalty';
  status: 'success' | 'pending';
}

interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'info' | 'warning' | 'success';
}

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const loans: Loan[] = [
    {
      id: '4500000',
      amount: 4500000,
      paid: 890000,
      status: 'active',
      date: '15.08.2024',
      nextPayment: '15.10.2024',
      rate: 24.5
    },
    {
      id: '3250000',
      amount: 3250000,
      paid: 3250000,
      status: 'completed',
      date: '10.05.2022',
      nextPayment: '-',
      rate: 24.0
    }
  ];

  const payments: Payment[] = [
    { id: '1', amount: 150000, date: '15.09.2024', type: 'payment', status: 'success' },
    { id: '2', amount: 150000, date: '15.08.2024', type: 'payment', status: 'success' },
    { id: '3', amount: 5000, date: '20.07.2024', type: 'fee', status: 'success' },
    { id: '4', amount: 150000, date: '15.07.2024', type: 'payment', status: 'success' }
  ];

  const notifications: Notification[] = [
    {
      id: '1',
      title: 'Платеж принят',
      message: 'Ваш платеж на сумму 150 000 ₽ успешно обработан',
      date: '15.09.2024',
      read: false,
      type: 'success'
    },
    {
      id: '2',
      title: 'Приближается дата платежа',
      message: 'Следующий платеж 150 000 ₽ необходимо внести до 15.10.2024',
      date: '10.09.2024',
      read: false,
      type: 'warning'
    },
    {
      id: '3',
      title: 'Обновление условий',
      message: 'Изменились условия предоставления займов',
      date: '01.09.2024',
      read: true,
      type: 'info'
    }
  ];

  const activeLoan = loans.find(l => l.status === 'active');
  const progress = activeLoan ? (activeLoan.paid / activeLoan.amount) * 100 : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'overdue': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Активный';
      case 'completed': return 'Погашен';
      case 'overdue': return 'Просрочен';
      default: return status;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return 'CheckCircle';
      case 'warning': return 'AlertCircle';
      case 'info': return 'Info';
      default: return 'Bell';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f1419]">
      <div className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
              <Icon name="Wallet" size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold">МФО Личный Кабинет</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Icon name="Bell" size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            <Avatar>
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary text-white font-semibold">АИ</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-card/50 backdrop-blur-sm p-1 h-auto">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary py-3">
              <Icon name="LayoutDashboard" size={18} />
              <span className="hidden sm:inline">Дашборд</span>
            </TabsTrigger>
            <TabsTrigger value="loans" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary py-3">
              <Icon name="FileText" size={18} />
              <span className="hidden sm:inline">Займы</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary py-3">
              <Icon name="CreditCard" size={18} />
              <span className="hidden sm:inline">Платежи</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary py-3">
              <Icon name="User" size={18} />
              <span className="hidden sm:inline">Профиль</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6 animate-fade-in">
            {activeLoan && (
              <Card className="overflow-hidden border-none shadow-2xl bg-gradient-to-br from-primary via-[#FF8C42] to-secondary">
                <CardContent className="p-6 text-white">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm opacity-90 mb-1">Активный займ</p>
                      <h2 className="text-4xl font-bold font-montserrat">{activeLoan.amount.toLocaleString('ru-RU')} ₽</h2>
                    </div>
                    <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                      {activeLoan.rate}%
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="opacity-90">Погашено</span>
                      <span className="font-semibold">{activeLoan.paid.toLocaleString('ru-RU')} ₽</span>
                    </div>
                    <Progress value={progress} className="h-2 bg-white/20" />
                    <div className="flex justify-between text-sm">
                      <span className="opacity-90">Осталось</span>
                      <span className="font-semibold">{(activeLoan.amount - activeLoan.paid).toLocaleString('ru-RU')} ₽</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/20">
                    <div>
                      <p className="text-xs opacity-75">Следующий платеж</p>
                      <p className="font-semibold">{activeLoan.nextPayment}</p>
                    </div>
                    <Button className="bg-white text-primary hover:bg-white/90">
                      Оплатить
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid md:grid-cols-3 gap-4">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all hover:scale-105 duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                      <Icon name="TrendingUp" size={20} className="text-secondary" />
                    </div>
                    <p className="text-sm text-muted-foreground">Всего займов</p>
                  </div>
                  <p className="text-3xl font-bold font-montserrat">{loans.length}</p>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all hover:scale-105 duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                      <Icon name="CheckCircle" size={20} className="text-accent" />
                    </div>
                    <p className="text-sm text-muted-foreground">Погашено</p>
                  </div>
                  <p className="text-3xl font-bold font-montserrat">{loans.filter(l => l.status === 'completed').length}</p>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all hover:scale-105 duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Icon name="Bell" size={20} className="text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">Уведомления</p>
                  </div>
                  <p className="text-3xl font-bold font-montserrat">{notifications.filter(n => !n.read).length}</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Bell" size={20} />
                  Последние уведомления
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {notifications.slice(0, 3).map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                      notif.read ? 'bg-muted/30 border-border/50' : 'bg-primary/5 border-primary/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        notif.type === 'success' ? 'bg-accent/20' :
                        notif.type === 'warning' ? 'bg-primary/20' : 'bg-secondary/20'
                      }`}>
                        <Icon 
                          name={getNotificationIcon(notif.type)} 
                          size={16}
                          className={
                            notif.type === 'success' ? 'text-accent' :
                            notif.type === 'warning' ? 'text-primary' : 'text-secondary'
                          }
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-sm">{notif.title}</h4>
                          <span className="text-xs text-muted-foreground">{notif.date}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{notif.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="loans" className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold font-montserrat">Мои займы</h2>
              <Button className="bg-gradient-to-r from-primary to-secondary">
                <Icon name="Plus" size={18} className="mr-2" />
                Новый займ
              </Button>
            </div>

            {loans.map((loan) => (
              <Card key={loan.id} className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-2xl font-bold font-montserrat">
                          {loan.amount.toLocaleString('ru-RU')} ₽
                        </h3>
                        <Badge className={`${getStatusColor(loan.status)} border-0`}>
                          {getStatusText(loan.status)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Дата выдачи</p>
                          <p className="font-medium">{loan.date}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Ставка</p>
                          <p className="font-medium">{loan.rate}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Погашено</p>
                          <p className="font-medium">{loan.paid.toLocaleString('ru-RU')} ₽</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">След. платеж</p>
                          <p className="font-medium">{loan.nextPayment}</p>
                        </div>
                      </div>

                      {loan.status === 'active' && (
                        <Progress value={(loan.paid / loan.amount) * 100} className="h-2" />
                      )}
                    </div>

                    <div className="flex md:flex-col gap-2">
                      <Button variant="outline" size="sm" className="flex-1 md:flex-none">
                        <Icon name="FileText" size={16} className="mr-2" />
                        Детали
                      </Button>
                      {loan.status === 'active' && (
                        <Button size="sm" className="flex-1 md:flex-none bg-gradient-to-r from-primary to-secondary">
                          <Icon name="CreditCard" size={16} className="mr-2" />
                          Оплатить
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="payments" className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold font-montserrat">История платежей</h2>
              <Button variant="outline">
                <Icon name="Download" size={18} className="mr-2" />
                Экспорт
              </Button>
            </div>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {payments.map((payment, index) => (
                    <div
                      key={payment.id}
                      className="p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            payment.type === 'payment' ? 'bg-accent/20' :
                            payment.type === 'fee' ? 'bg-secondary/20' : 'bg-destructive/20'
                          }`}>
                            <Icon 
                              name={
                                payment.type === 'payment' ? 'ArrowUpRight' :
                                payment.type === 'fee' ? 'Receipt' : 'AlertTriangle'
                              }
                              size={20}
                              className={
                                payment.type === 'payment' ? 'text-accent' :
                                payment.type === 'fee' ? 'text-secondary' : 'text-destructive'
                              }
                            />
                          </div>
                          <div>
                            <p className="font-semibold">
                              {payment.type === 'payment' ? 'Платеж по займу' :
                               payment.type === 'fee' ? 'Комиссия' : 'Пени'}
                            </p>
                            <p className="text-sm text-muted-foreground">{payment.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">-{payment.amount.toLocaleString('ru-RU')} ₽</p>
                          <Badge variant={payment.status === 'success' ? 'default' : 'secondary'} className="text-xs">
                            {payment.status === 'success' ? 'Выполнен' : 'В обработке'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6 animate-fade-in">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white text-2xl font-bold">
                      АИ
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl font-montserrat">Алексей Иванов</CardTitle>
                    <CardDescription>Клиент с 2022 года</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Separator />
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Телефон</Label>
                    <Input id="phone" value="+7 (999) 123-45-67" readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value="alexey.ivanov@example.com" readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passport">Паспорт</Label>
                    <Input id="passport" value="45 ** ******" readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inn">ИНН</Label>
                    <Input id="inn" value="7727******" readOnly />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Icon name="Settings" size={20} />
                    Настройки
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <Icon name="Mail" size={18} />
                        <span className="text-sm">Email уведомления</span>
                      </div>
                      <Badge variant="outline">Включено</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <Icon name="MessageSquare" size={18} />
                        <span className="text-sm">SMS уведомления</span>
                      </div>
                      <Badge variant="outline">Включено</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <Icon name="Shield" size={18} />
                        <span className="text-sm">Двухфакторная аутентификация</span>
                      </div>
                      <Badge variant="outline">Отключено</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1">
                    <Icon name="Edit" size={18} className="mr-2" />
                    Редактировать
                  </Button>
                  <Button className="flex-1 bg-gradient-to-r from-primary to-secondary">
                    <Icon name="Save" size={18} className="mr-2" />
                    Сохранить
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
