import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';

export default function Register() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    setError('');
    setSuccess('');

    const cleanPhone = phone.replace(/\D/g, '');

    if (cleanPhone.length !== 11) {
      setError('Введите корректный номер телефона');
      return;
    }

    if (!fullName.trim()) {
      setError('Введите ФИО');
      return;
    }

    if (password.length < 4) {
      setError('Пароль должен быть не менее 4 символов');
      return;
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch('https://functions.poehali.dev/9f6f96b6-4717-4745-b49d-f5e4683a8911', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: cleanPhone,
          password: password,
          full_name: fullName.trim()
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Ошибка регистрации');
      }

      setSuccess('Регистрация успешна! Перенаправляем на страницу входа...');
      
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f1419] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
            <Icon name="UserPlus" size={32} className="text-white" />
          </div>
          <CardTitle className="text-3xl font-montserrat">
            Регистрация
          </CardTitle>
          <CardDescription>
            Создайте учётную запись для доступа к системе
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert className="mb-6 bg-red-500/10 border-red-500/30">
              <Icon name="AlertCircle" size={18} className="text-red-500" />
              <AlertDescription className="text-red-500">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 bg-green-500/10 border-green-500/30">
              <Icon name="CheckCircle" size={18} className="text-green-500" />
              <AlertDescription className="text-green-500">
                {success}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">ФИО *</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setError('');
                }}
                required
                placeholder="Иванов Иван Иванович"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Номер телефона *</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                required
                maxLength={18}
                placeholder="+7 (999) 123-45-67"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль *</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                required
                placeholder="Минимум 4 символа"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Подтвердите пароль *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError('');
                }}
                required
                placeholder="Повторите пароль"
                disabled={loading}
              />
            </div>

            <div className="p-3 bg-accent/10 border border-accent/30 rounded-lg flex items-start gap-2">
              <Icon name="Info" size={16} className="text-accent flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                После регистрации вы сможете войти в систему используя номер телефона и пароль
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-secondary text-lg py-6"
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

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => navigate('/login')}
                className="text-primary hover:text-primary/80"
                disabled={loading}
              >
                Уже есть аккаунт? Войти
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
