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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-2xl shadow-emerald-500/30 mb-6">
            <Icon name="Wallet" size={48} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Микрозаймы</h1>
          <p className="text-gray-600 text-lg">Войдите в личный кабинет</p>
        </div>
        
      <Card className="border-gray-200 bg-white shadow-xl">
        <CardContent className="pt-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="phone" className="text-base font-semibold text-gray-700">
                Номер телефона
              </Label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Icon name="Phone" size={20} />
                </div>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+7 (___) ___-__-__"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="text-lg h-14 pl-12 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                  autoFocus
                  disabled={loading}
                />
              </div>
              <p className="text-sm text-gray-500">
                Введите номер телефона для входа
              </p>
            </div>

            {error && (
              <Alert className="bg-red-50 border-red-200">
                <Icon name="AlertCircle" size={18} className="text-red-600" />
                <AlertDescription className="text-red-700 font-medium">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full text-lg h-14 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/30 transition-all"
              disabled={loading || phone.replace(/\D/g, '').length !== 11}
            >
              {loading ? (
                <>
                  <Icon name="Loader2" size={22} className="mr-2 animate-spin" />
                  Проверяем...
                </>
              ) : (
                <>
                  <Icon name="Lock" size={22} className="mr-2" />
                  Войти в кабинет
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <Icon name="Shield" size={18} className="text-emerald-600" />
              <p className="text-sm">Защищенное соединение</p>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default MegagroupLogin;