import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Deal } from '../types';

interface ApprovedDealCardProps {
  deal: Deal;
}

const ApprovedDealCard = ({ deal }: ApprovedDealCardProps) => {
  const loanTerm = deal.custom_fields?.find(f => f.field_name === 'Срок займа' || f.field_code === 'LOAN_TERM')?.values?.[0]?.value || 'Не указан';
  const paymentMethod = deal.custom_fields?.find(f => f.field_name === 'Способ получения' || f.field_code === 'PAYMENT_METHOD')?.values?.[0]?.value || 'Не указан';

  return (
    <Card className="border-green-500/30 bg-green-950/20 backdrop-blur-md overflow-hidden">
      <CardContent className="p-8">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center border-4 border-green-500/30 animate-pulse">
            <Icon name="Check" size={40} className="text-green-500" />
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-green-400 mb-4">Заявка одобрена!</h3>
            
            <div className="grid gap-4 text-left max-w-md mx-auto">
              <div className="p-4 bg-muted/20 rounded-lg border border-border/30">
                <p className="text-xs text-muted-foreground mb-1">Одобренная сумма</p>
                <p className="text-3xl font-bold font-montserrat bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                  {deal.price.toLocaleString('ru-RU')} ₽
                </p>
              </div>
              
              <div className="p-4 bg-muted/20 rounded-lg border border-border/30">
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Icon name="Calendar" size={14} />
                  Срок займа
                </p>
                <p className="text-lg font-semibold text-white">{loanTerm}</p>
              </div>
              
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Icon name="Banknote" size={14} />
                  Способ получения займа
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                    <Icon name="Check" size={14} className="text-white" />
                  </div>
                  <p className="text-lg font-semibold text-green-400">{paymentMethod}</p>
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
