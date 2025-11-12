import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

const MegagroupLogin = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);

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

  useEffect(() => {
    if (step === 'code' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, countdown]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    
    if (digits.length !== 11) return;

    setLoading(true);

    try {
      // TODO: Send SMS code API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStep('code');
      setCountdown(60);
    } catch (err) {
      console.error('SMS send error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 4) return;

    setLoading(true);

    try {
      const digits = phone.replace(/\D/g, '');
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

  const handleResendCode = () => {
    setCountdown(60);
    // TODO: Resend SMS code
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCode(value);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center lg:p-6">
      {/* Mobile & Desktop Container */}
      <div className="w-full min-h-screen lg:min-h-0 lg:max-w-md lg:rounded-2xl lg:shadow-2xl bg-[#F5F5F5] flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between lg:rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#FFD500] flex items-center justify-center flex-shrink-0">
              <span className="text-black font-bold text-xs sm:text-sm leading-tight text-center">ТВОИ<br/>ЗАЙМЫ</span>
            </div>
          </div>
          <Icon name="Edit" size={20} className="text-[#9B6FFF] sm:w-6 sm:h-6" />
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-6 pt-10 sm:pt-16 pb-6 sm:pb-8">
          {step === 'phone' ? (
            <>
              <h1 className="text-3xl sm:text-4xl font-bold text-black mb-1 sm:mb-2">Войдите или</h1>
              <h1 className="text-3xl sm:text-4xl font-bold text-black mb-8 sm:mb-12">зарегистрируйтесь</h1>

              <form onSubmit={handlePhoneSubmit} className="space-y-5 sm:space-y-6">
                <div>
                  <Input
                    type="tel"
                    placeholder="Мобильный телефон"
                    value={phone}
                    onChange={handlePhoneChange}
                    className="w-full h-12 sm:h-14 px-3 sm:px-4 text-base sm:text-lg bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
                    autoFocus
                    disabled={loading}
                  />
                </div>

                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Нажимая на кнопку «Продолжить» и вводя код в специальное поле, я соглашаюсь с{' '}
                  <a href="#" className="text-blue-600 underline">условиями обработки персональных данных</a>
                  , а также даю{' '}
                  <a href="#" className="text-blue-600 underline">согласие на обработку персональных данных</a>
                </p>

                <Button
                  type="submit"
                  className="w-full h-12 sm:h-14 text-base sm:text-lg font-medium bg-gray-300 hover:bg-gray-400 text-gray-500 rounded-full transition-colors disabled:opacity-50"
                  disabled={loading || phone.replace(/\D/g, '').length !== 11}
                >
                  {loading ? 'Отправка...' : 'Продолжить'}
                </Button>
              </form>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep('phone')}
                className="flex items-center gap-2 text-gray-600 mb-6 sm:mb-8 hover:text-gray-900 transition-colors"
              >
                <Icon name="ArrowLeft" size={20} className="sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Назад</span>
              </button>

              <h1 className="text-3xl sm:text-4xl font-bold text-black mb-3 sm:mb-4">Введите код</h1>
              <p className="text-sm sm:text-base text-gray-600 mb-8 sm:mb-12">
                Мы отправили SMS с кодом на номер<br />
                <span className="font-medium text-black">{phone}</span>
              </p>

              <form onSubmit={handleCodeSubmit} className="space-y-5 sm:space-y-6">
                <div>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="_ _ _ _"
                    value={code}
                    onChange={handleCodeChange}
                    className="w-full h-12 sm:h-14 px-3 sm:px-4 text-2xl sm:text-3xl text-center tracking-widest bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
                    autoFocus
                    disabled={loading}
                    maxLength={4}
                  />
                </div>

                {countdown > 0 ? (
                  <p className="text-xs sm:text-sm text-gray-600 text-center">
                    Отправить код повторно через {countdown} сек
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="text-xs sm:text-sm text-blue-600 underline w-full text-center hover:text-blue-800 transition-colors"
                  >
                    Отправить код повторно
                  </button>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 sm:h-14 text-base sm:text-lg font-medium bg-gray-300 hover:bg-gray-400 text-gray-500 rounded-full transition-colors disabled:opacity-50"
                  disabled={loading || code.length !== 4}
                >
                  {loading ? 'Проверка...' : 'Подтвердить'}
                </Button>
              </form>
            </>
          )}
        </main>

        {/* Footer */}
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

export default MegagroupLogin;