import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';

const MegagroupLogin = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatPhoneInput = (value: string) => {
    const digits = value.replace(/\D/g, '');
    
    if (!digits) return '';
    
    let formatted = '+7';
    if (digits.length > 1) {
      formatted += ' (' + digits.substring(1, 4);
    }
    if (digits.length >= 5) {
      formatted += ') ' + digits.substring(4, 7);
    }
    if (digits.length >= 8) {
      formatted += '-' + digits.substring(7, 9);
    }
    if (digits.length >= 10) {
      formatted += '-' + digits.substring(9, 11);
    }
    
    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneInput(e.target.value);
    setPhone(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const digits = phone.replace(/\D/g, '');
    
    if (digits.length !== 11) {
      setError('Введите корректный номер телефона');
      return;
    }

    setLoading(true);

    try {
      const url = `https://functions.poehali.dev/44db4f9d-e497-4fac-b36c-64aa9c7edf64?phone=${digits}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('megagroupPhone', digits);
        localStorage.setItem('megagroupClient', JSON.stringify(data.client));
        navigate('/megagroup-cabinet');
      } else {
        if (data.not_found) {
          setError('Клиент с таким номером не найден в системе МегаГрупп');
        } else {
          setError(data.error || 'Ошибка авторизации');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f1419] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
            <Icon name="ShoppingBag" size={40} className="text-white" />
          </div>
          <CardTitle className="text-3xl font-montserrat">МегаГрупп</CardTitle>
          <CardDescription className="text-base">
            Войдите в личный кабинет
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="phone">Номер телефона</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+7 (___) ___-__-__"
                value={phone}
                onChange={handlePhoneChange}
                className="text-lg"
                autoFocus
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Введите номер телефона, указанный при регистрации
              </p>
            </div>

            {error && (
              <Alert className="bg-red-500/10 border-red-500/30">
                <Icon name="AlertCircle" size={18} className="text-red-500" />
                <AlertDescription className="text-red-500">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full text-lg h-12"
              disabled={loading || phone.replace(/\D/g, '').length !== 11}
            >
              {loading ? (
                <>
                  <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                  Проверяем...
                </>
              ) : (
                <>
                  <Icon name="LogIn" size={20} className="mr-2" />
                  Войти
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Нет аккаунта? Обратитесь к администратору</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MegagroupLogin;
