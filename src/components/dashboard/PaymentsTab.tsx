import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Payment } from './types';

interface PaymentsTabProps {
  payments: Payment[];
}

const PaymentsTab = ({ payments }: PaymentsTabProps) => {
  return (
    <div className="space-y-4 animate-fade-in">
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
            {payments.map((payment) => (
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
    </div>
  );
};

export default PaymentsTab;
