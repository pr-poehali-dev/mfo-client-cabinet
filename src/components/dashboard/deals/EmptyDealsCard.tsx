import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface EmptyDealsCardProps {
  totalDeals: number;
}

const EmptyDealsCard = ({ totalDeals }: EmptyDealsCardProps) => {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
          <Icon name="FileText" size={32} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Нет заявок</h3>
        <p className="text-muted-foreground">
          {totalDeals === 0 
            ? 'Ваши заявки будут отображаться здесь'
            : 'Нет активных заявок'}
        </p>
      </CardContent>
    </Card>
  );
};

export default EmptyDealsCard;
