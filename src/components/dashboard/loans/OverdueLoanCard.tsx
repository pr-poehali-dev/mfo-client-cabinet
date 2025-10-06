import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Loan } from '../types';

interface OverdueLoanCardProps {
  loan: Loan;
}

const OverdueLoanCard = ({ loan }: OverdueLoanCardProps) => {
  const overdueDays = 15;
  const penalty = Math.round(loan.amount * 0.001 * overdueDays);
  const totalDebt = loan.amount - loan.paid + penalty;

  return (
    <Card className="border-red-500/50 bg-red-950/30 backdrop-blur-md overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-red-500/30 flex items-center justify-center border-2 border-red-500/50 shrink-0 animate-pulse">
              <Icon name="AlertCircle" size={24} className="text-red-500" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-xl font-bold text-red-400 mb-1">🚨 Займ просрочен!</h3>
              <p className="text-sm text-muted-foreground">Необходимо погасить задолженность</p>
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-red-500/20 via-red-500/10 to-red-500/20 rounded-xl border-2 border-red-500/50">
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
              <Icon name="AlertTriangle" size={14} />
              Общая сумма долга
            </p>
            <p className="text-3xl font-bold font-montserrat text-red-400">
              {totalDebt.toLocaleString('ru-RU')} ₽
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-muted/20 rounded-xl border border-border/30">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                <Icon name="Banknote" size={14} />
                Основной долг
              </p>
              <p className="text-base font-semibold text-white">{(loan.amount - loan.paid).toLocaleString('ru-RU')} ₽</p>
            </div>
            
            <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/30">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                <Icon name="TrendingUp" size={14} />
                Пени
              </p>
              <p className="text-base font-semibold text-red-400">{penalty.toLocaleString('ru-RU')} ₽</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 bg-muted/20 rounded-lg border border-border/30">
              <p className="text-xs text-muted-foreground mb-1">Дата выдачи</p>
              <p className="text-sm font-medium">{loan.date}</p>
            </div>
            <div className="p-3 bg-muted/20 rounded-lg border border-border/30">
              <p className="text-xs text-muted-foreground mb-1">Ставка</p>
              <p className="text-sm font-medium">{loan.rate}%</p>
            </div>
            <div className="p-3 bg-red-500/20 rounded-lg border border-red-500/40">
              <p className="text-xs text-muted-foreground mb-1">Просрочка</p>
              <p className="text-sm font-bold text-red-400">{overdueDays} дн.</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
              onClick={() => window.open('https://your-payment-link.com', '_blank')}
            >
              <Icon name="CreditCard" size={18} />
              Погасить долг
            </button>
            <button 
              className="px-4 py-3 bg-muted/20 hover:bg-muted/30 border border-border/30 rounded-xl transition-all"
              onClick={() => alert(`Детали займа №${loan.id}`)}
            >
              <Icon name="FileText" size={18} />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OverdueLoanCard;
