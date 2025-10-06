import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Deal } from '../types';
import { useState, useEffect } from 'react';

interface OverdueDealCardProps {
  deal: Deal;
}

const OverdueDealCard = ({ deal }: OverdueDealCardProps) => {
  const loanTermField = deal.custom_fields?.find(f => f.field_name === 'Срок займа' || f.field_code === 'LOAN_TERM')?.values?.[0]?.value || '30';
  const loanTermDays = parseInt(String(loanTermField).replace(/\D/g, '')) || 30;
  
  const calculateOverdueDays = () => {
    const createdDate = new Date(deal.created_at.split(' ')[0].split('.').reverse().join('-'));
    const dueDate = new Date(createdDate);
    dueDate.setDate(dueDate.getDate() + loanTermDays);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - dueDate.getTime();
    const overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      overdueDays: overdueDays > 0 ? overdueDays : 0,
      dueDate: dueDate.toLocaleDateString('ru-RU')
    };
  };
  
  const [overdueInfo, setOverdueInfo] = useState(calculateOverdueDays());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setOverdueInfo(calculateOverdueDays());
    }, 1000 * 60 * 60 * 6);
    
    return () => clearInterval(timer);
  }, [deal.created_at, loanTermDays]);

  const penalty = Math.round(deal.price * 0.001 * overdueInfo.overdueDays);
  const totalDebt = deal.price + penalty;

  return (
    <Card className="border-red-500/50 bg-red-950/30 backdrop-blur-md overflow-hidden">
      <CardContent className="p-4 sm:p-6 md:p-8">
        <div className="text-center space-y-4 sm:space-y-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-red-500/30 flex items-center justify-center border-4 border-red-500/50 animate-pulse">
            <Icon name="AlertCircle" size={32} className="text-red-500 sm:w-10 sm:h-10" />
          </div>
          
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-red-400 mb-3 sm:mb-4">🚨 Ваш займ просрочен!</h3>
            
            <div className="mb-4">
              <div className="p-4 bg-gradient-to-br from-red-500/20 via-red-500/10 to-red-500/20 rounded-xl border-2 border-red-500/50">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center shrink-0 animate-pulse">
                    <Icon name="AlertTriangle" size={24} className="text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-base sm:text-lg font-bold text-red-400 mb-1">Необходимо погасить задолженность</p>
                    <p className="text-sm text-muted-foreground">Свяжитесь с нами для урегулирования</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid gap-3 sm:gap-4 text-left max-w-md mx-auto">
              <div className="p-4 sm:p-5 bg-red-500/20 rounded-xl border-2 border-red-500/50">
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                  <Icon name="AlertCircle" size={14} />
                  Общая сумма долга
                </p>
                <p className="text-3xl sm:text-4xl font-bold font-montserrat text-red-400">
                  {totalDebt.toLocaleString('ru-RU')} ₽
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="p-3 sm:p-4 bg-muted/20 rounded-xl border border-border/30">
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Icon name="Banknote" size={14} />
                    Основной долг
                  </p>
                  <p className="text-base sm:text-lg font-semibold text-white">{deal.price.toLocaleString('ru-RU')} ₽</p>
                </div>
                
                <div className="p-3 sm:p-4 bg-red-500/10 rounded-xl border border-red-500/30">
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Icon name="TrendingUp" size={14} />
                    Пени
                  </p>
                  <p className="text-base sm:text-lg font-semibold text-red-400">{penalty.toLocaleString('ru-RU')} ₽</p>
                </div>
              </div>
              
              <div className="p-4 bg-red-500/20 rounded-xl border border-red-500/40">
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Icon name="CalendarX" size={14} />
                  Дней просрочки
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-red-400">{overdueInfo.overdueDays} дн.</p>
              </div>
              
              <div className="p-3 sm:p-4 bg-muted/20 rounded-xl border border-border/30">
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Icon name="CalendarDays" size={14} />
                  Дата погашения была
                </p>
                <p className="text-base sm:text-lg font-semibold text-white">{overdueInfo.dueDate}</p>
              </div>
              
              <div className="p-3 sm:p-4 bg-muted/20 rounded-xl border border-border/30">
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Icon name="FileText" size={14} />
                  Номер заявки
                </p>
                <p className="text-base sm:text-lg font-semibold text-white">#{deal.id}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OverdueDealCard;
