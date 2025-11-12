import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface NewApplicationDialogProps {
  clientPhone: string;
  onApplicationSubmit: () => void;
  canSubmitNewApplication: boolean;
}

const NewApplicationDialog = ({ clientPhone, onApplicationSubmit, canSubmitNewApplication }: NewApplicationDialogProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [amount, setAmount] = useState(50000);
  const [termDays, setTermDays] = useState(30);
  const [submitting, setSubmitting] = useState(false);

  const interestRate = 1.0;
  const totalReturn = amount + (amount * (interestRate / 100) * termDays);

  const handleSubmitApplication = async () => {
    setSubmitting(true);
    try {
      const response = await fetch('https://functions.poehali.dev/19b4b253-3352-4332-810a-30d128021b66', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: clientPhone,
          amount: amount,
          loanTerm: termDays,
          purpose: 'Займ через личный кабинет'
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Ошибка отправки');
      }

      toast.success('Заявка успешно создана!');
      setIsDialogOpen(false);
      setAmount(50000);
      setTermDays(30);
      
      // Принудительно обновляем данные
      await new Promise(resolve => setTimeout(resolve, 500));
      onApplicationSubmit();
    } catch (error) {
      toast.error('Не удалось отправить заявку');
    } finally {
      setSubmitting(false);
    }
  };

  if (!canSubmitNewApplication) {
    return null;
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity">
          <Icon name="Plus" size={18} className="mr-2" />
          Подать заявку
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg border-border/50 bg-card/95 backdrop-blur-sm">
        <DialogHeader>
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
            <Icon name="FileText" size={24} className="text-white" />
          </div>
          <DialogTitle className="text-2xl font-montserrat text-center">Новая заявка на займ</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Сумма займа</Label>
              <div className="text-2xl font-bold text-primary">
                {amount.toLocaleString('ru-RU')} ₽
              </div>
            </div>
            <Slider
              value={[amount]}
              onValueChange={(value) => setAmount(value[0])}
              min={5000}
              max={100000}
              step={1000}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5 000 ₽</span>
              <span>100 000 ₽</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Срок займа</Label>
              <div className="text-2xl font-bold text-secondary">
                {termDays} {termDays === 1 ? 'день' : termDays < 5 ? 'дня' : 'дней'}
              </div>
            </div>
            <Slider
              value={[termDays]}
              onValueChange={(value) => setTermDays(value[0])}
              min={7}
              max={90}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>7 дней</span>
              <span>90 дней</span>
            </div>
          </div>

          <div className="p-5 bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/10 rounded-xl border-2 border-primary/30 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon name="TrendingUp" size={16} className="text-primary" />
                <span className="text-sm text-muted-foreground">Процентная ставка</span>
              </div>
              <span className="text-lg font-bold text-primary">{interestRate}% в день</span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <div className="flex items-center gap-2">
                <Icon name="Wallet" size={18} className="text-secondary" />
                <span className="text-base font-semibold">Сумма к возврату</span>
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {Math.round(totalReturn).toLocaleString('ru-RU')} ₽
              </span>
            </div>
          </div>
          
          <div className="p-3 bg-accent/10 border border-accent/30 rounded-lg flex items-start gap-2">
            <Icon name="Info" size={16} className="text-accent flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Заявка будет рассмотрена в течение 15 минут. Результат придёт SMS-сообщением.
            </p>
          </div>

          <Button 
            onClick={handleSubmitApplication} 
            disabled={submitting}
            className="w-full bg-gradient-to-r from-primary to-secondary text-lg py-6"
          >
            {submitting ? (
              <>
                <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                Отправка...
              </>
            ) : (
              <>
                <Icon name="Send" size={20} className="mr-2" />
                Подать заявку
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewApplicationDialog;