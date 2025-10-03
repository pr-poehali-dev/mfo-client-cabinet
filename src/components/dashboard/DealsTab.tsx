import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { Deal } from './types';
import { toast } from 'sonner';

interface DealsTabProps {
  deals: Deal[];
  clientPhone: string;
  onApplicationSubmit: () => void;
}

interface ReviewTimerProps {
  dealId: string;
  amount: number;
  createdAt: string;
}

const ReviewTimer = ({ dealId, amount, createdAt }: ReviewTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(600);
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

    const calculateTimeLeft = () => {
      const created = parseCreatedDate();
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - created.getTime()) / 1000);
      const remaining = Math.max(0, 600 - elapsed);
      
      setTimeLeft(remaining);
      setIsExpired(remaining === 0);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(interval);
  }, [createdAt]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = (timeLeft / 600) * 100;

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

const DealsTab = ({ deals, clientPhone, onApplicationSubmit }: DealsTabProps) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAmount, setNewAmount] = useState('');
  const [newTerm, setNewTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const hasRejectedDeal = deals.some(deal => deal.status_name === 'Заявка отклонена');
  const hasApprovedDeal = deals.some(deal => deal.status_name === 'Заявка одобрена');
  const canSubmitNewApplication = !hasRejectedDeal && !hasApprovedDeal;

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 204, g: 204, b: 204 };
  };

  const filteredDeals = deals.filter(deal => {
    const isRejected = deal.status_name === 'Заявка отклонена';
    const isApproved = deal.status_name === 'Заявка одобрена';
    
    if (filter === 'all') return !isRejected;
    if (filter === 'completed') return isRejected;
    if (filter === 'active') return isApproved;
    return deal.status === filter;
  });

  const activeCount = deals.filter(d => d.status_name === 'Заявка одобрена').length;
  const completedCount = deals.filter(d => d.status_name === 'Заявка отклонена').length;

  const handleSubmitApplication = async () => {
    if (!newAmount || !newTerm) {
      toast.error('Заполните все поля');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('https://functions.poehali.dev/6e80b3d4-1759-415b-bd93-5e37f93088a5', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: clientPhone,
          amount: parseFloat(newAmount),
          term: newTerm
        })
      });

      if (!response.ok) throw new Error('Ошибка отправки');

      toast.success('Заявка успешно отправлена!');
      setIsDialogOpen(false);
      setNewAmount('');
      setNewTerm('');
      onApplicationSubmit();
    } catch (error) {
      toast.error('Не удалось отправить заявку');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold font-montserrat">Ваши заявки</h2>
          
          {canSubmitNewApplication && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-secondary">
                  <Icon name="Plus" size={18} className="mr-2" />
                  Подать заявку
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Новая заявка на займ</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Сумма займа (₽)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Например: 50000"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="term">Срок займа</Label>
                    <Input
                      id="term"
                      placeholder="Например: 30 дней"
                      value={newTerm}
                      onChange={(e) => setNewTerm(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={handleSubmitApplication} 
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-primary to-secondary"
                  >
                    {submitting ? 'Отправка...' : 'Отправить заявку'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-gradient-to-r from-primary to-secondary' : ''}
          >
            <Icon name="FileText" size={16} className="mr-2" />
            Все ({deals.length})
          </Button>
          
          <Button
            variant={filter === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('active')}
            className={filter === 'active' ? 'bg-gradient-to-r from-primary to-secondary' : ''}
          >
            <Icon name="Play" size={16} className="mr-2" />
            Активные ({activeCount})
          </Button>
          
          <Button
            variant={filter === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('completed')}
            className={filter === 'completed' ? 'bg-gradient-to-r from-primary to-secondary' : ''}
          >
            <Icon name="XCircle" size={16} className="mr-2" />
            Отклонены ({completedCount})
          </Button>
        </div>
      </div>

      {filteredDeals.length === 0 ? (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
              <Icon name="FileText" size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Нет заявок</h3>
            <p className="text-muted-foreground">
              {deals.length === 0 
                ? 'Ваши заявки будут отображаться здесь'
                : `Нет ${filter === 'active' ? 'активных' : 'отклоненных'} заявок`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredDeals.map((deal) => {
            const rgb = hexToRgb(deal.status_color);
            const bgColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`;
            const borderColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`;
            const textColor = deal.status_color;
            const isRejected = deal.status_name === 'Заявка отклонена';
            const isApproved = deal.status_name === 'Заявка одобрена';

            if (isApproved) {
              const loanTerm = deal.custom_fields?.find(f => f.field_name === 'Срок займа' || f.field_code === 'LOAN_TERM')?.values?.[0]?.value || 'Не указан';
              const paymentMethod = deal.custom_fields?.find(f => f.field_name === 'Способ получения' || f.field_code === 'PAYMENT_METHOD')?.values?.[0]?.value || 'Не указан';
              
              return (
                <Card key={deal.id} className="border-green-500/30 bg-green-950/20 backdrop-blur-md overflow-hidden">
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
            }

            if (isRejected) {
              return (
                <Card key={deal.id} className="border-red-500/30 bg-red-950/20 backdrop-blur-md overflow-hidden">
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
            }

            return (
              <Card key={deal.id} className="border-border/30 bg-card/80 backdrop-blur-md hover:shadow-2xl transition-all duration-300 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <CardHeader className="relative pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20">
                          <Icon name="FileText" size={20} className="text-primary" />
                        </div>
                        <Badge variant="outline" className="text-xs font-mono">#{deal.id}</Badge>
                      </div>
                      <CardTitle className="text-xl mb-3 truncate">{deal.name}</CardTitle>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div 
                          className="px-4 py-1.5 rounded-full text-sm font-semibold border-2 shadow-sm"
                          style={{ 
                            backgroundColor: bgColor,
                            borderColor: borderColor,
                            color: textColor
                          }}
                        >
                          {deal.status_name}
                        </div>
                        <Badge variant="secondary" className="text-xs px-3">
                          <Icon name="GitBranch" size={12} className="mr-1.5" />
                          {deal.pipeline_name}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground mb-1">Сумма</p>
                      <p className="text-3xl font-bold font-montserrat bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        {deal.price.toLocaleString('ru-RU')} ₽
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="relative pt-0">
                  {deal.status_name === 'Заявка на рассмотрение' && (
                    <ReviewTimer 
                      dealId={deal.id} 
                      amount={deal.price}
                      createdAt={deal.created_at}
                    />
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Icon name="Calendar" size={14} />
                        Создана
                      </p>
                      <p className="font-semibold text-sm">{deal.created_at}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Icon name="Clock" size={14} />
                        Обновлена
                      </p>
                      <p className="font-semibold text-sm">{deal.updated_at}</p>
                    </div>
                  </div>

                  {deal.custom_fields && deal.custom_fields.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Icon name="Info" size={16} className="text-primary" />
                        Детали заявки
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {deal.custom_fields.map((field, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border border-border/30">
                            <Icon name="ChevronRight" size={16} className="text-primary mt-0.5 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-muted-foreground mb-0.5">{field.field_name}</p>
                              <p className="font-medium text-sm truncate">
                                {field.values && field.values.length > 0 
                                  ? String(field.values[0].value) 
                                  : '-'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DealsTab;