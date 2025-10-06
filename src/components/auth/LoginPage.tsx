import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface LoginPageProps {
  onLogin: (phone: string) => void;
}

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [supportDialogOpen, setSupportDialogOpen] = useState(false);
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [smsInfo, setSmsInfo] = useState<string>('');
  const [storedCode, setStoredCode] = useState<string>('');

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return '';
    if (digits.length <= 1) return `+7`;
    if (digits.length <= 4) return `+7 (${digits.slice(1)}`;
    if (digits.length <= 7) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`;
    if (digits.length <= 9) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
    setError('');
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const digits = phone.replace(/\D/g, '');
    
    if (digits.length !== 11) {
      setError('Введите корректный номер телефона');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://functions.poehali.dev/291aa98a-124e-4714-8e23-ab5309099dea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', phone: digits })
      });

      const responseText = await response.text();
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        setError('Ошибка сервера. Попробуйте позже');
        setLoading(false);
        return;
      }

      if (response.ok && data.success) {
        setStep('code');
        setStoredCode(data.code || '');
        if (data.code) {
          setSmsInfo(`Код для входа: ${data.code}`);
        } else {
          setSmsInfo('Код отправлен на ваш телефон');
        }
      } else {
        if (response.status === 404 || data.not_found) {
          setError('Клиент с таким номером не найден в системе. Обратитесь в службу поддержки для получения доступа.');
        } else {
          setError(data.error || 'Ошибка при отправке SMS');
        }
      }
    } catch (err) {
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (code.length !== 4) {
      setError('Введите 4-значный код из SMS');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const digits = phone.replace(/\D/g, '');
      const response = await fetch('https://functions.poehali.dev/291aa98a-124e-4714-8e23-ab5309099dea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', phone: digits, code, stored_code: storedCode })
      });

      const responseText = await response.text();
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        setError('Ошибка сервера. Попробуйте позже');
        setLoading(false);
        return;
      }

      if (response.ok && data.success) {
        onLogin(digits);
      } else {
        setError(data.error || 'Неверный код');
      }
    } catch (err) {
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f1419] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
            <Icon name="Wallet" size={32} className="text-white" />
          </div>
          <CardTitle className="text-3xl font-montserrat">
            {step === 'phone' ? 'Вход в личный кабинет' : 'Подтверждение входа'}
          </CardTitle>
          <CardDescription>
            {step === 'phone' 
              ? 'Введите номер телефона, указанный при оформлении займа'
              : 'Введите код из SMS для входа в кабинет'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'phone' ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Номер телефона</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+7 (999) 123-45-67"
                  value={phone}
                  onChange={handlePhoneChange}
                  disabled={loading}
                  className="text-lg"
                  autoComplete="tel"
                  autoFocus
                />
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-center gap-2">
                  <Icon name="AlertCircle" size={18} className="text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-secondary text-lg py-6"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                    Отправка SMS...
                  </>
                ) : (
                  <>
                    <Icon name="MessageSquare" size={20} className="mr-2" />
                    Получить код
                  </>
                )}
              </Button>

              <div className="p-3 bg-accent/10 border border-accent/30 rounded-lg flex items-start gap-2">
                <Icon name="Info" size={18} className="text-accent flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Используйте номер телефона, указанный при оформлении займа
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Код из SMS</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="1234"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.replace(/\D/g, '').slice(0, 4));
                    setError('');
                  }}
                  disabled={loading}
                  className="text-lg text-center tracking-widest"
                  maxLength={4}
                  autoFocus
                />
              </div>

              {smsInfo && (
                <div className="p-3 bg-accent/10 border border-accent/30 rounded-lg flex items-center gap-2">
                  <Icon name="CheckCircle" size={18} className="text-accent flex-shrink-0" />
                  <p className="text-sm text-accent">{smsInfo}</p>
                </div>
              )}

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-center gap-2">
                  <Icon name="AlertCircle" size={18} className="text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-secondary text-lg py-6"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                    Проверка...
                  </>
                ) : (
                  <>
                    <Icon name="LogIn" size={20} className="mr-2" />
                    Войти
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setStep('phone');
                  setCode('');
                  setError('');
                  setSmsInfo('');
                }}
              >
                <Icon name="ChevronLeft" size={18} className="mr-2" />
                Изменить номер
              </Button>
            </form>
          )}

          <div className="mt-6">
            <p className="text-sm text-muted-foreground text-center">
              Нет доступа к кабинету?{' '}
              <Dialog open={supportDialogOpen} onOpenChange={setSupportDialogOpen}>
                <DialogTrigger asChild>
                  <button className="text-primary hover:underline font-medium">
                    Свяжитесь с поддержкой
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                        <Icon name="Headphones" size={20} className="text-white" />
                      </div>
                      Служба поддержки
                    </DialogTitle>
                    <DialogDescription>
                      Свяжитесь с нами для получения доступа к личному кабинету
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon name="Phone" size={20} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground mb-1">Телефон</p>
                        <a href="tel:+78001234567" className="text-lg font-semibold hover:text-primary transition-colors">
                          +7 (800) 123-45-67
                        </a>
                        <p className="text-xs text-muted-foreground mt-1">Круглосуточно</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                        <Icon name="Mail" size={20} className="text-secondary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground mb-1">Email</p>
                        <a href="mailto:support@example.com" className="text-lg font-semibold hover:text-primary transition-colors break-all">
                          support@example.com
                        </a>
                        <p className="text-xs text-muted-foreground mt-1">Ответ в течение 24 часов</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                        <Icon name="MessageCircle" size={20} className="text-green-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground mb-1">Telegram</p>
                        <a href="https://t.me/support" target="_blank" rel="noopener noreferrer" className="text-lg font-semibold hover:text-primary transition-colors">
                          @support
                        </a>
                        <p className="text-xs text-muted-foreground mt-1">Быстрый ответ</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setSupportDialogOpen(false)}
                    >
                      Закрыть
                    </Button>
                    <Button
                      className="flex-1 bg-gradient-to-r from-primary to-secondary"
                      onClick={() => {
                        window.location.href = 'tel:+78001234567';
                      }}
                    >
                      <Icon name="Phone" size={18} className="mr-2" />
                      Позвонить
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;