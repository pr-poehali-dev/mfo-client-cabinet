import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Deal } from '../types';
import { useState, useEffect } from 'react';

interface ApprovedDealCardProps {
  deal: Deal;
}

const ApprovedDealCard = ({ deal }: ApprovedDealCardProps) => {
  const loanTermField = deal.custom_fields?.find(f => f.field_name === 'Срок займа' || f.field_code === 'LOAN_TERM')?.values?.[0]?.value || '30';
  const paymentMethod = deal.custom_fields?.find(f => f.field_name === 'Способ получения' || f.field_code === 'PAYMENT_METHOD')?.values?.[0]?.value || 'Не указан';
  
  const loanTermDays = parseInt(String(loanTermField).replace(/\D/g, '')) || 30;
  
  const calculateDaysLeft = () => {
    const createdDate = new Date(deal.created_at.split(' ')[0].split('.').reverse().join('-'));
    const dueDate = new Date(createdDate);
    dueDate.setDate(dueDate.getDate() + loanTermDays);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      daysLeft: diffDays,
      dueDate: dueDate.toLocaleDateString('ru-RU')
    };
  };
  
  const [countdown, setCountdown] = useState(calculateDaysLeft());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(calculateDaysLeft());
    }, 1000 * 60 * 60 * 6);
    
    return () => clearInterval(timer);
  }, [deal.created_at, loanTermDays]);

  return (
    <Card className="border-green-500/30 bg-green-950/20 backdrop-blur-md overflow-hidden">
      <CardContent className="p-4 sm:p-6 md:p-8">
        <div className="text-center space-y-4 sm:space-y-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center border-4 border-green-500/30 animate-pulse">
            <Icon name="Check" size={32} className="text-green-500 sm:w-10 sm:h-10" />
          </div>
          
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-green-400 mb-3 sm:mb-4">Заявка одобрена!</h3>
            
            <div className="mb-4">
              <div className="p-4 bg-gradient-to-br from-green-500/10 via-green-500/5 to-green-500/10 rounded-xl border-2 border-green-500/30">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shrink-0 animate-pulse">
                    <Icon name="Check" size={24} className="text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-base sm:text-lg font-bold text-green-400 mb-1">Деньги отправлены на ваш счёт</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <Icon name="Clock" size={14} />
                      Время зачисления от 20 минут
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid gap-3 sm:gap-4 text-left max-w-md mx-auto">
              <div className="p-3 sm:p-4 bg-muted/20 rounded-xl border border-border/30">
                <p className="text-xs text-muted-foreground mb-1">Одобренная сумма</p>
                <p className="text-2xl sm:text-3xl font-bold font-montserrat bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                  {deal.price.toLocaleString('ru-RU')} ₽
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="p-3 sm:p-4 bg-muted/20 rounded-xl border border-border/30">
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Icon name="Calendar" size={14} />
                    Срок
                  </p>
                  <p className="text-base sm:text-lg font-semibold text-white">{loanTermDays} дн.</p>
                </div>
                
                <div className="p-3 sm:p-4 bg-muted/20 rounded-xl border border-border/30">
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Icon name="CalendarClock" size={14} />
                    Осталось
                  </p>
                  <p className={`text-base sm:text-lg font-semibold ${
                    countdown.daysLeft <= 3 ? 'text-red-400' : 
                    countdown.daysLeft <= 7 ? 'text-yellow-400' : 
                    'text-white'
                  }`}>
                    {countdown.daysLeft > 0 ? `${countdown.daysLeft} дн.` : 'Просрочен'}
                  </p>
                </div>
              </div>
              
              <div className={`p-3 sm:p-4 rounded-xl border ${
                countdown.daysLeft <= 3 ? 'bg-red-500/10 border-red-500/30' :
                countdown.daysLeft <= 7 ? 'bg-yellow-500/10 border-yellow-500/30' :
                'bg-blue-500/10 border-blue-500/30'
              }`}>
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Icon name="CalendarDays" size={14} />
                  Дата погашения
                </p>
                <p className="text-base sm:text-lg font-semibold text-white">{countdown.dueDate}</p>
              </div>
              
              <div className="p-3 sm:p-4 bg-green-500/10 rounded-xl border border-green-500/30">
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Icon name="Banknote" size={14} />
                  Способ получения
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                    <Icon name="Check" size={14} className="text-white" />
                  </div>
                  <p className="text-base sm:text-lg font-semibold text-green-400 break-words">{paymentMethod}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApprovedDealCard;