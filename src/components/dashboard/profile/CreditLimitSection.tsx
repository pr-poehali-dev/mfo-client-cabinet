import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface ClientLimit {
  max_loan_amount: number;
  current_debt: number;
  available_limit: number;
  credit_rating: string;
  is_blocked: boolean;
  blocked_reason?: string;
}

interface CreditLimitSectionProps {
  clientLimit?: ClientLimit;
}

const CreditLimitSection = ({ clientLimit }: CreditLimitSectionProps) => {
  if (!clientLimit) return null;

  return (
    <div className="p-5 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/30">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg">
          <Icon name="Wallet" size={20} className="text-green-500" />
        </div>
        Ваш кредитный лимит
      </h3>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Максимальная сумма</Label>
          <div className="p-3 bg-background/60 rounded-lg border border-border/50">
            <p className="font-bold text-2xl text-green-500">{clientLimit.max_loan_amount.toLocaleString('ru-RU')} ₽</p>
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Текущий долг</Label>
          <div className="p-3 bg-background/60 rounded-lg border border-border/50">
            <p className="font-bold text-2xl text-orange-500">{clientLimit.current_debt.toLocaleString('ru-RU')} ₽</p>
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Доступно для займа</Label>
          <div className="p-3 bg-background/60 rounded-lg border border-border/50">
            <p className="font-bold text-2xl text-blue-500">{clientLimit.available_limit.toLocaleString('ru-RU')} ₽</p>
          </div>
        </div>
      </div>
      {clientLimit.is_blocked && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
          <Icon name="AlertCircle" size={18} className="text-red-500" />
          <p className="text-sm text-red-500 font-semibold">
            {clientLimit.blocked_reason || 'Новые займы временно недоступны'}
          </p>
        </div>
      )}
    </div>
  );
};

export default CreditLimitSection;
