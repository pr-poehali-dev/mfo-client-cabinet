import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Loan, Notification } from './types';

interface DashboardTabProps {
  loans: Loan[];
  notifications: Notification[];
}

const DashboardTab = ({ loans, notifications }: DashboardTabProps) => {
  const activeLoan = loans.find(l => l.status === 'active');
  const progress = activeLoan ? (activeLoan.paid / activeLoan.amount) * 100 : 0;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return 'CheckCircle';
      case 'warning': return 'AlertCircle';
      case 'info': return 'Info';
      default: return 'Bell';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
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
              <Button className="bg-white text-primary hover:bg-white/90" onClick={() => window.open('https://your-payment-link.com', '_blank')}>
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
    </div>
  );
};

export default DashboardTab;