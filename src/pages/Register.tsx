import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Icon name="UserPlus" size={32} className="text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Регистрация</h1>
          <p className="text-gray-600">Создайте личный кабинет для доступа к услугам</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <Icon name="AlertCircle" size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Фамилия *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Иванов"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Имя *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Иван"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Отчество
              </label>
              <input
                type="text"
                name="middleName"
                value={formData.middleName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Иванович"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Серия паспорта *
              </label>
              <input
                type="text"
                name="passportSeries"
                value={formData.passportSeries}
                onChange={handleChange}
                required
                maxLength={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Номер паспорта *
              </label>
              <input
                type="text"
                name="passportNumber"
                value={formData.passportNumber}
                onChange={handleChange}
                required
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="000000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Номер телефона *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="79991234567"
            />
            <p className="text-xs text-gray-500 mt-1">11 цифр без пробелов и знаков</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="example@mail.ru"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Пароль *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Минимум 6 символов"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Подтвердите пароль *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Повторите пароль"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Icon name="Loader2" size={20} className="animate-spin" />
                Регистрация...
              </>
            ) : (
              <>
                <Icon name="UserPlus" size={20} />
                Зарегистрироваться
              </>
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Уже есть аккаунт? Войти
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}