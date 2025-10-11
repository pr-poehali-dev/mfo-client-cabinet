import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import funcUrls from '../../backend/func2url.json';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    passportSeries: '',
    passportNumber: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'passportSeries') {
      const cleaned = value.replace(/\D/g, '').slice(0, 4);
      setFormData(prev => ({ ...prev, [name]: cleaned }));
    } else if (name === 'passportNumber') {
      const cleaned = value.replace(/\D/g, '').slice(0, 6);
      setFormData(prev => ({ ...prev, [name]: cleaned }));
    } else if (name === 'phone') {
      const cleaned = value.replace(/\D/g, '').slice(0, 11);
      setFormData(prev => ({ ...prev, [name]: cleaned }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (formData.password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }

    if (formData.passportSeries.length !== 4 || formData.passportNumber.length !== 6) {
      setError('Проверьте правильность серии и номера паспорта');
      return;
    }

    if (formData.phone.length !== 11) {
      setError('Введите корректный номер телефона (11 цифр)');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(funcUrls['user-auth'], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'register',
          firstName: formData.firstName,
          lastName: formData.lastName,
          middleName: formData.middleName,
          passportSeries: formData.passportSeries,
          passportNumber: formData.passportNumber,
          phone: formData.phone,
          email: formData.email,
          password: formData.password
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка регистрации');
      }

      const data = await response.json();
      
      localStorage.setItem('userPhone', data.phone);
      localStorage.setItem('userEmail', data.email);
      localStorage.setItem('userName', data.name);
      
      navigate('/');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f1419] flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
            <Icon name="UserPlus" size={32} className="text-white" />
          </div>
          <CardTitle className="text-3xl font-montserrat">
            Регистрация
          </CardTitle>
          <CardDescription>
            Создайте личный кабинет для доступа к услугам
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lastName">Фамилия *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Иванов"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="firstName">Имя *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="Иван"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="middleName">Отчество</Label>
                <Input
                  id="middleName"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleChange}
                  placeholder="Иванович"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="passportSeries">Серия паспорта *</Label>
                <Input
                  id="passportSeries"
                  name="passportSeries"
                  value={formData.passportSeries}
                  onChange={handleChange}
                  required
                  maxLength={4}
                  placeholder="0000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passportNumber">Номер паспорта *</Label>
                <Input
                  id="passportNumber"
                  name="passportNumber"
                  value={formData.passportNumber}
                  onChange={handleChange}
                  required
                  maxLength={6}
                  placeholder="000000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Номер телефона *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formatPhone(formData.phone)}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '');
                  handleChange({ ...e, target: { ...e.target, name: 'phone', value: digits } });
                }}
                required
                placeholder="+7 (999) 123-45-67"
              />
              <p className="text-xs text-muted-foreground">11 цифр</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="example@mail.ru"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Пароль *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Минимум 6 символов"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Подтвердите пароль *</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Повторите пароль"
                />
              </div>
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
                onClick={() => navigate('/')}
                className="text-primary hover:text-primary/80"
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
