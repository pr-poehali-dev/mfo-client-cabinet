import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

interface ReviewTimerProps {
  dealId: string;
  amount: number;
  createdAt: string;
}

const ReviewTimer = ({ dealId, amount, createdAt }: ReviewTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(1200);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const parseCreatedDate = () => {
      try {
        const parts = createdAt.split(' ');
        const datePart = parts[0];
        const timePart = parts[1] || '00:00:00';
        
        const [day, month, year] = datePart.split('.');
        const [hours, minutes, seconds] = timePart.split(':');
        
        return new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          parseInt(hours || '0'),
          parseInt(minutes || '0'),
          parseInt(seconds || '0')
        );
      } catch (e) {
        console.error('Date parse error:', e);
        return new Date();
      }
    };

    const created = parseCreatedDate();
    
    const calculateTimeLeft = () => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - created.getTime()) / 1000);
      const remaining = Math.max(0, 1200 - elapsed);
      
      setTimeLeft(remaining);
      setIsExpired(remaining === 0);
      
      if (remaining === 0) {
        clearInterval(interval);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 5000);
    
    return () => clearInterval(interval);
  }, [createdAt]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = (timeLeft / 1200) * 100;

  return (
    <div className="mb-4 p-5 bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/10 rounded-xl border-2 border-primary/30 relative overflow-hidden">
      <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-primary to-secondary transition-all duration-1000" style={{ width: `${progress}%` }} />
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center animate-pulse">
            <Icon name="Clock" size={24} className="text-white" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Время рассмотрения</p>
            <p className="text-2xl font-bold font-montserrat tabular-nums">
              {isExpired ? (
                <span className="text-yellow-500">Ожидает проверки</span>
              ) : (
                <span className={timeLeft < 180 ? 'text-yellow-500 animate-pulse' : 'text-primary'}>
                  {minutes}:{seconds.toString().padStart(2, '0')}
                </span>
              )}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-muted-foreground mb-1">Сумма займа</p>
          <p className="text-2xl font-bold font-montserrat bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {amount.toLocaleString('ru-RU')} ₽
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon name="Info" size={14} />
        <span>
          {isExpired 
            ? 'Время истекло. Ожидайте решения менеджера.'
            : timeLeft < 180
            ? 'Осталось менее 3 минут до завершения проверки'
            : 'Ваша заявка проверяется автоматически'}
        </span>
      </div>
    </div>
  );
};

export default ReviewTimer;