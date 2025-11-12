import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

const MegagroupLogin = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

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
    const digits = phone.replace(/\D/g, '');
    
    if (digits.length !== 11) return;

    setLoading(true);

    try {
      const url = `https://functions.poehali.dev/44db4f9d-e497-4fac-b36c-64aa9c7edf64?phone=${digits}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('megagroupPhone', digits);
        localStorage.setItem('megagroupClient', JSON.stringify(data.client));
        navigate('/megagroup-cabinet');
      }
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-14 h-14 rounded-full bg-[#FFD500] flex items-center justify-center">
            <span className="text-black font-bold text-sm leading-tight">ТВОИ<br/>ЗАЙМЫ</span>
          </div>
        </div>
        <Icon name="Edit" size={24} className="text-[#9B6FFF]" />
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 pt-16 pb-8">
        <h1 className="text-4xl font-bold text-black mb-2">Войдите или</h1>
        <h1 className="text-4xl font-bold text-black mb-12">зарегистрируйтесь</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Input
              type="tel"
              placeholder="Мобильный телефон"
              value={phone}
              onChange={handlePhoneChange}
              className="w-full h-14 px-4 text-lg bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
              autoFocus
              disabled={loading}
            />
          </div>

          <p className="text-sm text-gray-600 leading-relaxed">
            Нажимая на кнопку «Продолжить» и вводя код в специальное поле, я соглашаюсь с{' '}
            <a href="#" className="text-blue-600 underline">условиями обработки персональных данных</a>
            , а также даю{' '}
            <a href="#" className="text-blue-600 underline">согласие на обработку персональных данных</a>
          </p>

          <Button
            type="submit"
            className="w-full h-14 text-lg font-medium bg-gray-300 hover:bg-gray-400 text-gray-500 rounded-full transition-colors disabled:opacity-50"
            disabled={loading || phone.replace(/\D/g, '').length !== 11}
          >
            {loading ? 'Отправка...' : 'Продолжить'}
          </Button>
        </form>
      </main>

      {/* Footer */}
      <footer className="px-6 pb-8 space-y-4">
        <a href="mailto:help@tvoizaymy.ru" className="flex items-center gap-3 text-gray-700">
          <div className="flex items-center justify-center w-12 h-12 bg-white rounded-lg border border-gray-200">
            <Icon name="Mail" size={24} className="text-[#9B6FFF]" />
          </div>
          <span className="text-base">help@tvoizaymy.ru</span>
        </a>

        <a href="#" className="flex items-center gap-3 text-gray-700">
          <div className="flex items-center justify-center w-12 h-12 bg-white rounded-lg border border-gray-200">
            <Icon name="MessageCircle" size={24} className="text-[#9B6FFF]" />
          </div>
          <span className="text-base">Онлайн чат</span>
        </a>
      </footer>
    </div>
  );
};

export default MegagroupLogin;
