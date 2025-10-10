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
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [code, setCode] = useState('');
  const [storedCode, setStoredCode] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientData, setClientData] = useState<{ name: string; phone: string } | null>(null);

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
    setClientData(null);
  };

  const handleCheckPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setClientData(null);

    const cleanPhone = phone.replace(/\D/g, '');

    try {
      const response = await fetch('https://functions.poehali.dev/40d400f9-c52e-41e3-bd22-032a937010cd?phone=' + cleanPhone);
      const data = await response.json();

      console.log('Phone check response:', data);

      if (data.success && data.client) {
        setClientData({
          name: data.client.name,
          phone: phone
        });
        setClientName(data.client.name);
      } else {
        if (data.not_found) {
          setError('Клиент с таким номером не найден в системе.');
        } else {
          setError(data.error || 'Ошибка проверки номера');
        }
      }
    } catch (err) {
      console.error('Phone check error:', err);
      setError('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async () => {
    if (!clientData) return;

    setLoading(true);
    setError('');

    const cleanPhone = phone.replace(/\D/g, '');

    try {
      const response = await fetch('https://functions.poehali.dev/291aa98a-124e-4714-8e23-ab5309099dea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          fullName: clientData.name,
          action: 'send'
        })
      });
      const data = await response.json();

      console.log('Send SMS response:', data);

      if (data.success) {
        setStoredCode(data.code);
        setStep('code');
      } else {
        setError(data.error || 'Ошибка отправки SMS');
      }
    } catch (err) {
      console.error('Send SMS error:', err);
      setError('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const cleanPhone = phone.replace(/\D/g, '');

    try {
      const response = await fetch('https://functions.poehali.dev/291aa98a-124e-4714-8e23-ab5309099dea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          action: 'verify',
          code: code,
          stored_code: storedCode,
          client_name: clientName
        })
      });
      const data = await response.json();

      if (data.success && data.verified) {
        localStorage.setItem('clientPhone', cleanPhone);
        localStorage.setItem('clientName', clientName);
        navigate('/cabinet');
      } else {
        setError('Неверный код. Попробуйте ещё раз.');
      }
    } catch (err) {
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
            <Icon name="User" size={32} className="text-white" />
          </div>
          <CardTitle className="text-3xl font-montserrat">
            Личный кабинет
          </CardTitle>
          <CardDescription>
            {step === 'phone' && 'Введите номер телефона для входа'}
            {step === 'code' && `SMS-код отправлен на ${phone}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'phone' && (
          <form onSubmit={handleCheckPhone} className="space-y-6">
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
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Введите номер телефона, указанный при регистрации
              </p>
            </div>

            {clientData && (
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Icon name="CheckCircle" size={24} className="text-primary" />
                    <div>
                      <p className="font-semibold text-sm text-muted-foreground">Найден клиент:</p>
                      <p className="font-semibold text-lg">{clientData.name}</p>
                      <p className="text-sm text-muted-foreground">{clientData.phone}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={handleSendCode}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                  >
                    {loading ? (
                      <>
                        <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                        Отправка SMS...
                      </>
                    ) : (
                      <>
                        <Icon name="Send" size={20} className="mr-2" />
                        Получить SMS-код
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {error && (
              <Alert className="bg-red-500/10 border-red-500/30">
                <Icon name="AlertCircle" size={18} className="text-red-500" />
                <AlertDescription className="text-red-500">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {!clientData && (
              <Button
                type="submit"
                disabled={loading || phone.length < 18}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
              >
                {loading ? (
                  <>
                    <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                    Поиск...
                  </>
                ) : (
                  <>
                    <Icon name="Search" size={20} className="mr-2" />
                    Найти клиента
                  </>
                )}
              </Button>
            )}
          </form>
          )}

          {step === 'code' && (
          <form onSubmit={handleVerifyCode} className="space-y-6">
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/30 mb-4">
              <div className="flex items-center gap-3">
                <Icon name="User" size={24} className="text-primary" />
                <div>
                  <p className="font-semibold text-lg">{clientName}</p>
                  <p className="text-sm text-muted-foreground">{phone}</p>
                </div>
              </div>
            </div>

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
                maxLength={4}
                required
                className="text-lg text-center tracking-widest"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Введите 4-значный код из SMS
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

            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setCode('');
                  setError('');
                  setClientData(null);
                }}
                variant="outline"
                className="flex-1"
              >
                Назад
              </Button>
              <Button
                type="submit"
                disabled={loading || code.length !== 4}
                className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
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
            </div>
          </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientLogin;
