import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';

const ClientLogin = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return '';
    if (digits.length <= 1) return `+${digits}`;
    if (digits.length <= 4) return `+${digits[0]} (${digits.slice(1)}`;
    if (digits.length <= 7) return `+${digits[0]} (${digits.slice(1, 4)}) ${digits.slice(4)}`;
    if (digits.length <= 9) return `+${digits[0]} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    return `+${digits[0]} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const cleanPhone = phone.replace(/\D/g, '');

    try {
      const response = await fetch('https://functions.poehali.dev/40525570-e354-46cc-9a4e-8d464ca14921', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone: cleanPhone })
      });

      const data = await response.json();

      if (data.success && data.client) {
        localStorage.setItem('clientData', JSON.stringify(data.client));
        navigate('/cabinet');
      } else {
        setError(data.error || 'Клиент не найден');
      }
    } catch (err) {
      setError('Ошибка подключения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f1419] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
            <Icon name="User" size={32} className="text-white" />
          </div>
          <CardTitle className="text-3xl font-montserrat">
            Личный кабинет
          </CardTitle>
          <CardDescription>
            Введите номер телефона для входа
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="phone">Номер телефона</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+7 (999) 999-99-99"
                value={phone}
                onChange={handlePhoneChange}
                maxLength={18}
                required
                className="text-lg"
              />
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
              disabled={loading || phone.length < 18}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            >
              {loading ? (
                <>
                  <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                  Вход...
                </>
              ) : (
                <>
                  <Icon name="LogIn" size={20} className="mr-2" />
                  Войти
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientLogin;
