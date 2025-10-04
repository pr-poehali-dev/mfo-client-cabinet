import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import funcUrls from '@/../backend/func2url.json';

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
      const response = await fetch(funcUrls['amocrm-sync'], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: clientPhone,
          amount: amount,
          term: `${termDays} дней`
        })
      });

      if (!response.ok) throw new Error('Ошибка отправки');

      toast.success('Заявка успешно отправлена!');
      setIsDialogOpen(false);
      setAmount(50000);
      setTermDays(30);
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
        <Button className="bg-gradient-to-r from-primary to-secondary">
          <Icon name="Plus" size={18} className="mr-2" />
          Подать заявку
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-montserrat">Новая заявка на займ</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-6">
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

          <div className="p-5 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl border-2 border-primary/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Процентная ставка</span>
              <span className="text-lg font-bold">{interestRate}% в день</span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <span className="text-base font-semibold">Сумма к возврату</span>
              <span className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {Math.round(totalReturn).toLocaleString('ru-RU')} ₽
              </span>
            </div>
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