import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

const ClientRegister = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    birthDate: '',
    passportSeries: '',
    passportNumber: '',
    phone: ''
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    if (field === 'passportSeries') {
      value = value.replace(/\D/g, '').slice(0, 4);
    } else if (field === 'passportNumber') {
      value = value.replace(/\D/g, '').slice(0, 6);
    }

    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatDate = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return digits.slice(0, 2) + '.' + digits.slice(2);
    return digits.slice(0, 2) + '.' + digits.slice(2, 4) + '.' + digits.slice(4, 8);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDate(e.target.value);
    setFormData(prev => ({ ...prev, birthDate: formatted }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('https://functions.poehali.dev/YOUR_FUNCTION_URL', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('clientData', JSON.stringify(data.client));
        navigate('/cabinet');
      }
    } catch (err) {
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.lastName.length >= 2 &&
      formData.firstName.length >= 2 &&
      formData.birthDate.length === 10 &&
      formData.passportSeries.length === 4 &&
      formData.passportNumber.length === 6
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center lg:p-6">
      <div className="w-full min-h-screen lg:min-h-0 lg:max-w-md lg:rounded-2xl lg:shadow-2xl bg-[#F5F5F5] flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-center lg:rounded-t-2xl">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#FFD500] flex items-center justify-center flex-shrink-0">
            <span className="text-black font-bold text-xs sm:text-sm leading-tight text-center">ТВОИ<br/>ЗАЙМЫ</span>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 pt-6 sm:pt-8 pb-6 sm:pb-8 overflow-y-auto">
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 text-gray-600 mb-4 sm:mb-6 hover:text-gray-900 transition-colors"
          >
            <Icon name="ArrowLeft" size={20} className="sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Назад</span>
          </button>

          <h1 className="text-2xl sm:text-3xl font-bold text-black mb-1 sm:mb-2">Регистрация</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">Заполните данные для создания аккаунта</p>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 mb-1.5 block">
                Фамилия
              </Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Иванов"
                value={formData.lastName}
                onChange={handleChange('lastName')}
                className="w-full h-12 sm:h-14 px-3 sm:px-4 text-base bg-white border-2 border-gray-300 rounded-xl focus:border-[#DC3545] focus:ring-2 focus:ring-[#DC3545] focus:ring-offset-1 transition-all"
                disabled={loading}
                required
              />
            </div>

            <div>
              <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 mb-1.5 block">
                Имя
              </Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Иван"
                value={formData.firstName}
                onChange={handleChange('firstName')}
                className="w-full h-12 sm:h-14 px-3 sm:px-4 text-base bg-white border-2 border-gray-300 rounded-xl focus:border-[#DC3545] focus:ring-2 focus:ring-[#DC3545] focus:ring-offset-1 transition-all"
                disabled={loading}
                required
              />
            </div>

            <div>
              <Label htmlFor="middleName" className="text-sm font-medium text-gray-700 mb-1.5 block">
                Отчество
              </Label>
              <Input
                id="middleName"
                type="text"
                placeholder="Иванович"
                value={formData.middleName}
                onChange={handleChange('middleName')}
                className="w-full h-12 sm:h-14 px-3 sm:px-4 text-base bg-white border-2 border-gray-300 rounded-xl focus:border-[#DC3545] focus:ring-2 focus:ring-[#DC3545] focus:ring-offset-1 transition-all"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="birthDate" className="text-sm font-medium text-gray-700 mb-1.5 block">
                Дата рождения
              </Label>
              <Input
                id="birthDate"
                type="text"
                placeholder="ДД.ММ.ГГГГ"
                value={formData.birthDate}
                onChange={handleDateChange}
                className="w-full h-12 sm:h-14 px-3 sm:px-4 text-base bg-white border-2 border-gray-300 rounded-xl focus:border-[#DC3545] focus:ring-2 focus:ring-[#DC3545] focus:ring-offset-1 transition-all"
                disabled={loading}
                maxLength={10}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="passportSeries" className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Серия паспорта
                </Label>
                <Input
                  id="passportSeries"
                  type="text"
                  placeholder="0000"
                  value={formData.passportSeries}
                  onChange={handleChange('passportSeries')}
                  className="w-full h-12 sm:h-14 px-3 sm:px-4 text-base bg-white border-2 border-gray-300 rounded-xl focus:border-[#DC3545] focus:ring-2 focus:ring-[#DC3545] focus:ring-offset-1 transition-all"
                  disabled={loading}
                  maxLength={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="passportNumber" className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Номер паспорта
                </Label>
                <Input
                  id="passportNumber"
                  type="text"
                  placeholder="000000"
                  value={formData.passportNumber}
                  onChange={handleChange('passportNumber')}
                  className="w-full h-12 sm:h-14 px-3 sm:px-4 text-base bg-white border-2 border-gray-300 rounded-xl focus:border-[#DC3545] focus:ring-2 focus:ring-[#DC3545] focus:ring-offset-1 transition-all"
                  disabled={loading}
                  maxLength={6}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-[#28A745] hover:bg-[#218838] text-white rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm mt-6"
              disabled={loading || !isFormValid()}
            >
              {loading ? (
                <>
                  <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                  Регистрация...
                </>
              ) : (
                'Зарегистрироваться'
              )}
            </Button>
          </form>
        </main>

        <footer className="px-4 sm:px-6 pb-6 sm:pb-8 space-y-3 sm:space-y-4 lg:rounded-b-2xl">
          <a href="mailto:help@tvoizaymy.ru" className="flex items-center gap-3 text-gray-700 hover:text-gray-900 transition-colors">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg border border-gray-200 flex-shrink-0">
              <Icon name="Mail" size={20} className="text-[#9B6FFF] sm:w-6 sm:h-6" />
            </div>
            <span className="text-sm sm:text-base">help@tvoizaymy.ru</span>
          </a>

          <a href="#" className="flex items-center gap-3 text-gray-700 hover:text-gray-900 transition-colors">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg border border-gray-200 flex-shrink-0">
              <Icon name="MessageCircle" size={20} className="text-[#9B6FFF] sm:w-6 sm:h-6" />
            </div>
            <span className="text-sm sm:text-base">Онлайн чат</span>
          </a>
        </footer>
      </div>
    </div>
  );
};

export default ClientRegister;
