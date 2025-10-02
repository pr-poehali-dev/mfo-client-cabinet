import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface LoginPageProps {
  onLogin: (phone: string) => void;
}

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [storedCode, setStoredCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const digits = phone.replace(/\D/g, '');
    
    if (digits.length !== 11) {
      setError('Введите корректный номер телефона');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const smsResponse = await fetch(
        'https://functions.poehali.dev/cf45200f-62b4-4c40-8f00-49ac52fd6b0e',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: digits,
            action: 'send'
          })
        }
      );

      const smsData = await smsResponse.json();

      if (smsData.success) {
        setStoredCode(smsData.code);
        setStep('code');
      } else {
        setError(smsData.error || 'Не удалось отправить SMS');
      }
      
    } catch (err) {
      console.error('Send SMS error:', err);
      setError('Не удалось отправить SMS');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code.length !== 4) {
      setError('Введите 4-значный код');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (code === storedCode) {
        const digits = phone.replace(/\D/g, '');
        onLogin(digits);
      } else {
        setError('Неверный код. Попробуйте еще раз.');
      }
    } catch (err) {
      console.error('Verify error:', err);
      setError('Ошибка проверки кода');
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
            {step === 'phone' ? 'Вход в личный кабинет' : 'Введите код из SMS'}
          </CardTitle>
          <CardDescription>
            {step === 'phone' 
              ? 'Введите номер телефона для получения SMS-кода'
              : `Код отправлен на номер ${phone}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'phone' ? (
            <form onSubmit={handleSendCode} className="space-y-4">
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
                    Отправка...
                  </>
                ) : (
                  <>
                    <Icon name="MessageSquare" size={20} className="mr-2" />
                    Получить SMS-код
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">SMS-код</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="0000"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.replace(/\D/g, '').slice(0, 4));
                    setError('');
                  }}
                  disabled={loading}
                  className="text-2xl text-center tracking-widest"
                  maxLength={4}
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
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setStep('phone');
                  setCode('');
                  setError('');
                }}
              >
                <Icon name="ArrowLeft" size={18} className="mr-2" />
                Изменить номер
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Нет доступа к кабинету?{' '}
              <a href="#" className="text-primary hover:underline">
                Свяжитесь с менеджером
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;