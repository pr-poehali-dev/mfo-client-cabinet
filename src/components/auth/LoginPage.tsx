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
  const [phone, setPhone] = useState('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const digits = phone.replace(/\D/g, '');
    
    if (digits.length !== 11) {
      setError('Введите корректный номер телефона');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `https://functions.poehali.dev/6e80b3d4-1759-415b-bd93-5e37f93088a5?phone=${digits}`
      );

      if (response.status === 404) {
        setError('Номер телефона не найден в системе. Обратитесь к менеджеру.');
        setLoading(false);
        return;
      }

      if (response.status === 500) {
        const errorData = await response.json();
        if (errorData.message?.includes('credentials')) {
          setError('Система временно недоступна. Попробуйте позже.');
        } else {
          setError('Ошибка подключения к системе');
        }
        setLoading(false);
        return;
      }

      if (!response.ok) {
        setError('Ошибка входа. Попробуйте позже.');
        setLoading(false);
        return;
      }

      const data = await response.json();
      
      if (data.id) {
        onLogin(digits);
      } else {
        setError('Не удалось получить данные клиента');
      }
      
    } catch (err) {
      console.error('Login error:', err);
      setError('Не удалось подключиться к серверу');
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
          <CardTitle className="text-3xl font-montserrat">Вход в личный кабинет</CardTitle>
          <CardDescription>
            Введите номер телефона для доступа к вашим займам
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  Проверка...
                </>
              ) : (
                <>
                  <Icon name="LogIn" size={20} className="mr-2" />
                  Войти
                </>
              )}
            </Button>
          </form>

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
