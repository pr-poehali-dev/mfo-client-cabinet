import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Deal } from '../types';

interface RejectedDealCardProps {
  deal: Deal;
}

const RejectedDealCard = ({ deal }: RejectedDealCardProps) => {
  return (
    <Card className="border-red-500/30 bg-red-950/20 backdrop-blur-md overflow-hidden opacity-70">
      <CardContent className="p-4 sm:p-6 md:p-8">
        <div className="text-center space-y-4 sm:space-y-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-red-500/20 flex items-center justify-center border-4 border-red-500/30">
            <Icon name="X" size={32} className="text-red-500 sm:w-10 sm:h-10" />
          </div>
          
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-red-400 mb-3 sm:mb-4">Заявка не одобрена</h3>
            
            <div className="p-3 sm:p-4 bg-muted/20 rounded-xl border border-border/30 max-w-xs mx-auto">
              <p className="text-xs text-muted-foreground mb-1">Запрошенная сумма</p>
              <p className="text-2xl sm:text-3xl font-bold font-montserrat text-white">
                {deal.price.toLocaleString('ru-RU')} ₽
              </p>
            </div>
          </div>

          <div className="p-3 sm:p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-yellow-400">
              <Icon name="Clock" size={20} className="shrink-0" />
              <p className="font-semibold text-sm sm:text-base text-center">Повторная подача через 5 дней</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RejectedDealCard;