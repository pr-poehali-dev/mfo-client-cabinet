import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ClientLogin = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    setSuccess('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const cleanPhone = phone.replace(/\D/g, '');

    try {
      const response = await fetch('https://functions.poehali.dev/3ef6f7cb-856a-4e15-bcf8-124143d9c136', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          password: password
        })
      });
      const data = await response.json();

      if (data.success && data.client) {
        localStorage.setItem('clientPhone', data.client.phone);
        localStorage.setItem('clientName', data.client.full_name);
        navigate('/cabinet');
      } else {
        setError(data.error || 'Ошибка входа');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const cleanPhone = phone.replace(/\D/g, '');

    if (password.length < 4) {
      setError('Пароль должен быть минимум 4 символа');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('https://functions.poehali.dev/9f6f96b6-4717-4745-b49d-f5e4683a8911', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          password: password,
          full_name: fullName,
          email: email
        })
      });
      const data = await response.json();

      if (data.success) {
        setSuccess('Регистрация успешна! Теперь войдите в систему.');
        setTimeout(() => {
          setPhone('');
          setPassword('');
          setFullName('');
          setEmail('');
          setSuccess('');
        }, 2000);
      } else {
        setError(data.error || 'Ошибка регистрации');
      }
    } catch (err) {
      console.error('Register error:', err);
      setError('Ошибка подключения к серверу');
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
            Войдите или зарегистрируйтесь для доступа
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-phone">Номер телефона</Label>
                  <Input
                    id="login-phone"
                    type="tel"
                    placeholder="+7 (999) 999-99-99"
                    value={phone}
                    onChange={handlePhoneChange}
                    maxLength={18}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password">Пароль</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Введите пароль"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    required
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
                  disabled={loading || phone.length < 18 || !password}
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

                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => navigate('/register')}
                    className="text-primary hover:text-primary/80"
                  >
                    Нет аккаунта? Зарегистрироваться
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">ФИО</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Иван Иванов"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      setError('');
                    }}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-phone">Номер телефона</Label>
                  <Input
                    id="register-phone"
                    type="tel"
                    placeholder="+7 (999) 999-99-99"
                    value={phone}
                    onChange={handlePhoneChange}
                    maxLength={18}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-password">Пароль</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Минимум 4 символа"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email (необязательно)</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="example@mail.ru"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
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
                
                {success && (
                  <Alert className="bg-green-500/10 border-green-500/30">
                    <Icon name="CheckCircle" size={18} className="text-green-500" />
                    <AlertDescription className="text-green-500">
                      {success}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={loading || phone.length < 18 || !password || !fullName}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                >
                  {loading ? (
                    <>
                      <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                      Регистрация...
                    </>
                  ) : (
                    <>
                      <Icon name="UserPlus" size={20} className="mr-2" />
                      Зарегистрироваться
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientLogin;