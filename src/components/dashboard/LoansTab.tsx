import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Loan } from './types';
import OverdueLoanCard from './loans/OverdueLoanCard';

interface LoansTabProps {
  loans: Loan[];
}

const LoansTab = ({ loans }: LoansTabProps) => {
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

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold font-montserrat">Мои займы</h2>
        <Button className="bg-gradient-to-r from-primary to-secondary" onClick={() => window.open('https://your-loan-application-link.com', '_blank')}>
          <Icon name="Plus" size={18} className="mr-2" />
          Новый займ
        </Button>
      </div>

      {loans.map((loan) => 
        loan.status === 'overdue' ? (
          <OverdueLoanCard key={loan.id} loan={loan} />
        ) : (
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
                  <Button variant="outline" size="sm" className="flex-1 md:flex-none" onClick={() => alert(`Детали займа №${loan.id}`)}>
                    <Icon name="FileText" size={16} className="mr-2" />
                    Детали
                  </Button>
                  {loan.status === 'active' && (
                    <Button size="sm" className="flex-1 md:flex-none bg-gradient-to-r from-primary to-secondary" onClick={() => window.open('https://your-payment-link.com', '_blank')}>
                      <Icon name="CreditCard" size={16} className="mr-2" />
                      Оплатить
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
};

export default LoansTab;