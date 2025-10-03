import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Deal } from '../types';

interface RejectedDealCardProps {
  deal: Deal;
}

const RejectedDealCard = ({ deal }: RejectedDealCardProps) => {
  return (
    <Card className="border-red-500/30 bg-red-950/20 backdrop-blur-md overflow-hidden">
      <CardContent className="p-8">
        <div className="text-center space-y-6">
          <div className="w-32 h-32 mx-auto relative">
            <img 
              src="/img/6c48b6b5-6279-4336-b7cd-e14f0bd52e47.jpg" 
              alt="Заявка отклонена" 
              className="w-full h-full object-cover rounded-2xl opacity-90"
            />
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-red-400 mb-4">Заявка не одобрена</h3>
            
            <div className="p-4 bg-muted/20 rounded-lg border border-border/30 max-w-xs mx-auto">
              <p className="text-xs text-muted-foreground mb-1">Запрошенная сумма</p>
              <p className="text-3xl font-bold font-montserrat text-white">
                {deal.price.toLocaleString('ru-RU')} ₽
              </p>
            </div>
          </div>

          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-yellow-400">
              <Icon name="Clock" size={20} />
              <p className="font-semibold">Повторная подача заявки через 30 дней</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RejectedDealCard;
