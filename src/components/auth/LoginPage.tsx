import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface LoginPageProps {
  onLogin: (phone: string, clientName?: string) => void;
}

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [smsInfo, setSmsInfo] = useState<string>('');
  const [storedCode, setStoredCode] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');

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

  // Вход по SMS
  const handleSmsLogin = async (e: React.FormEvent) => {
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

      const data = await response.json();

      if (response.ok && data.success) {
        setStep('code');
        setStoredCode(data.code || '');
        setClientName(data.client_name || '');
        if (data.code) {
          setSmsInfo(`Код для входа: ${data.code}`);
        } else {
          setSmsInfo('Код отправлен на ваш телефон');
        }
      } else {
        if (response.status === 404 || data.not_found) {
          setError('Клиент с таким номером не найден в системе');
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
        body: JSON.stringify({ action: 'verify', phone: digits, code, stored_code: storedCode, client_name: clientName })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const finalName = data.client_name || clientName || '';
        if (finalName) {
          localStorage.setItem('clientName', finalName);
        }
        onLogin(digits, finalName);
      } else {
        setError(data.error || 'Неверный код');
      }
    } catch (err) {
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  // Вход по паролю
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const digits = phone.replace(/\D/g, '');
    
    if (digits.length !== 11) {
      setError('Введите корректный номер телефона');
      return;
    }

    if (!password) {
      setError('Введите пароль');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://functions.poehali.dev/3ef6f7cb-856a-4e15-bcf8-124143d9c136', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: digits,
          password: password
        })
      });
      
      const data = await response.json();

      if (data.success && data.client) {
        onLogin(digits, data.client.full_name);
      } else {
        setError(data.error || 'Неверный телефон или пароль');
      }
    } catch (err) {
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'code') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f1419] flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
              <Icon name="Wallet" size={32} className="text-white" />
            </div>
            <CardTitle className="text-3xl font-montserrat">
              Подтверждение входа
            </CardTitle>
            <CardDescription>
              Введите код из SMS для входа в кабинет
            </CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f1419] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
            <Icon name="Wallet" size={32} className="text-white" />
          </div>
          <CardTitle className="text-3xl font-montserrat">
            Личный кабинет
          </CardTitle>
          <CardDescription>
            Выберите способ входа в систему
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="password" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="password">Пароль</TabsTrigger>
              <TabsTrigger value="sms">SMS-код</TabsTrigger>
            </TabsList>
            
            <TabsContent value="password">
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password-phone">Номер телефона</Label>
                  <Input
                    id="password-phone"
                    type="tel"
                    placeholder="+7 (999) 123-45-67"
                    value={phone}
                    onChange={handlePhoneChange}
                    disabled={loading}
                    className="text-lg"
                    autoComplete="tel"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Пароль</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Введите пароль"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    disabled={loading}
                    className="text-lg"
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
                  disabled={loading || phone.length < 18 || !password}
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

                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => window.location.href = '/login'}
                    className="text-primary hover:text-primary/80"
                  >
                    Нет аккаунта? Зарегистрироваться
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="sms">
              <form onSubmit={handleSmsLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sms-phone">Номер телефона</Label>
                  <Input
                    id="sms-phone"
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
                  disabled={loading || phone.length < 18}
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

                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => window.location.href = '/login'}
                    className="text-primary hover:text-primary/80"
                  >
                    Нет аккаунта? Зарегистрироваться
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;