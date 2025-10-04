import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import funcUrls from '@/../backend/func2url.json';
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
  const navigate = useNavigate();
  const [loginMode, setLoginMode] = useState<'phone' | 'sms' | 'email'>('sms');
  const [phone, setPhone] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [smsStep, setSmsStep] = useState<'phone' | 'code'>('phone');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [supportDialogOpen, setSupportDialogOpen] = useState(false);

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
      const response = await fetch(funcUrls['user-auth'], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'login', phone: digits })
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Ошибка входа');
        setLoading(false);
        return;
      }

      const data = await response.json();
      localStorage.setItem('userName', data.name);
      localStorage.setItem('userEmail', data.email || '');
      
      onLogin(digits);
    } catch (err) {
      setError('Не удалось войти. Проверьте подключение к интернету');
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Заполните все поля');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(funcUrls['user-auth'], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'login', email, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Неверный email или пароль');
        setLoading(false);
        return;
      }

      const data = await response.json();
      localStorage.setItem('userName', data.name);
      localStorage.setItem('userEmail', data.email);
      
      onLogin(data.phone);
    } catch (err) {
      setError('Не удалось войти. Проверьте подключение к интернету');
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
            Вход в личный кабинет
          </CardTitle>
          <CardDescription>
            {loginMode === 'sms' 
              ? (smsStep === 'phone' ? 'Введите номер телефона' : 'Введите код из СМС')
              : loginMode === 'phone'
              ? 'Введите номер телефона для быстрого входа'
              : 'Войдите с помощью email и пароля'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => { setLoginMode('sms'); setSmsStep('phone'); setSmsCode(''); }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                loginMode === 'sms'
                  ? 'bg-primary text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Icon name="MessageSquare" size={18} className="inline mr-2" />
              По СМС
            </button>
            <button
              onClick={() => setLoginMode('phone')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                loginMode === 'phone'
                  ? 'bg-primary text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Icon name="Phone" size={18} className="inline mr-2" />
              Телефон
            </button>
            <button
              onClick={() => setLoginMode('email')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                loginMode === 'email'
                  ? 'bg-primary text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Icon name="Mail" size={18} className="inline mr-2" />
              Email
            </button>
          </div>

          {loginMode === 'sms' ? (
            <form onSubmit={async (e) => {
              e.preventDefault();
              
              if (smsStep === 'phone') {
                const digits = phone.replace(/\D/g, '');
                if (digits.length !== 11) {
                  setError('Введите корректный номер телефона');
                  return;
                }
                
                setLoading(true);
                setError('');
                
                try {
                  const response = await fetch(funcUrls['user-auth'], {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'send-sms', phone: digits })
                  });

                  if (!response.ok) {
                    const errorData = await response.json();
                    setError(errorData.error || 'Не удалось отправить СМС');
                    setLoading(false);
                    return;
                  }

                  setSmsStep('code');
                  setLoading(false);
                } catch (err) {
                  setError('Не удалось отправить СМС. Проверьте подключение');
                  setLoading(false);
                }
              } else {
                if (!smsCode || smsCode.length < 4) {
                  setError('Введите код из СМС');
                  return;
                }
                
                setLoading(true);
                setError('');
                
                try {
                  const digits = phone.replace(/\D/g, '');
                  const response = await fetch(funcUrls['user-auth'], {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'verify-sms', phone: digits, code: smsCode })
                  });

                  if (!response.ok) {
                    const errorData = await response.json();
                    setError(errorData.error || 'Неверный код');
                    setLoading(false);
                    return;
                  }

                  const data = await response.json();
                  localStorage.setItem('userName', data.name);
                  localStorage.setItem('userEmail', data.email || '');
                  
                  onLogin(digits);
                } catch (err) {
                  setError('Ошибка проверки кода');
                  setLoading(false);
                }
              }
            }} className="space-y-4">
              {smsStep === 'phone' ? (
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
                    autoFocus
                  />
                </div>
              ) : (
                <>
                  <div className="p-3 bg-accent/10 border border-accent/30 rounded-lg">
                    <p className="text-sm text-center">
                      Код отправлен на номер <span className="font-bold">{phone}</span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sms-code">Код из СМС</Label>
                    <Input
                      id="sms-code"
                      type="text"
                      placeholder="1234"
                      value={smsCode}
                      onChange={(e) => {
                        setSmsCode(e.target.value.replace(/\D/g, ''));
                        setError('');
                      }}
                      disabled={loading}
                      className="text-lg text-center tracking-widest"
                      maxLength={6}
                      autoFocus
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSmsStep('phone');
                      setSmsCode('');
                      setError('');
                    }}
                    className="w-full"
                  >
                    <Icon name="ArrowLeft" size={18} className="mr-2" />
                    Изменить номер
                  </Button>
                </>
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
                    {smsStep === 'phone' ? 'Отправка...' : 'Проверка...'}
                  </>
                ) : (
                  <>
                    <Icon name={smsStep === 'phone' ? 'Send' : 'LogIn'} size={20} className="mr-2" />
                    {smsStep === 'phone' ? 'Получить код' : 'Войти'}
                  </>
                )}
              </Button>
            </form>
          ) : loginMode === 'phone' ? (
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
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@mail.ru"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  disabled={loading}
                  className="text-lg"
                  autoComplete="email"
                  autoFocus
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
                  autoComplete="current-password"
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
          )}

          <div className="mt-6 space-y-3">
            <div className="p-3 bg-accent/10 border border-accent/30 rounded-lg flex items-start gap-2">
              <Icon name="Info" size={18} className="text-accent flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                {loginMode === 'sms'
                  ? 'На указанный номер придёт СМС с кодом подтверждения'
                  : loginMode === 'phone' 
                  ? 'Используйте номер телефона, указанный при регистрации'
                  : 'Используйте email и пароль, указанные при регистрации'
                }
              </p>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Нет аккаунта?{' '}
                <button 
                  onClick={() => navigate('/register')}
                  className="text-primary hover:underline font-medium"
                >
                  Зарегистрироваться
                </button>
              </p>
              <p className="text-sm text-muted-foreground">
                Проблемы со входом?{' '}
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
                        Свяжитесь с нами для получения помощи
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon name="Phone" size={20} className="text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground mb-1">Телефон</p>
                          <a href="tel:+74951340801" className="text-lg font-semibold hover:text-primary transition-colors">
                            +7 (495) 134-08-01
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
                          <a href="mailto:support@manifesto.ru" className="text-lg font-semibold hover:text-primary transition-colors break-all">
                            support@manifesto.ru
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
                          window.location.href = 'tel:+74951340801';
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;