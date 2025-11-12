import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

const ClientLogin = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const formatPhoneInput = (value: string) => {
    const digits = value.replace(/\D/g, '');
    
    if (!digits) return '';
    
    let formatted = '';
    if (digits.length > 0) {
      formatted = '(' + digits.substring(0, 3);
    }
    if (digits.length >= 4) {
      formatted += ') ' + digits.substring(3, 6);
    }
    if (digits.length >= 7) {
      formatted += '-' + digits.substring(6, 8);
    }
    if (digits.length >= 9) {
      formatted += '-' + digits.substring(8, 10);
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
    
    if (digits.length !== 10) return;

    setLoading(true);

    try {
      const fullPhone = '7' + digits;
      const response = await fetch(`https://functions.poehali.dev/8d06286b-b17d-431a-a73d-70ed8e8e18e6?phone=${fullPhone}`);
      const data = await response.json();

      if (data.success) {
        setStep('code');
        setCountdown(60);
      }
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
      const digits = '7' + phone.replace(/\D/g, '');
      const response = await fetch(`https://functions.poehali.dev/5f4d3d46-b20d-49b2-b603-52e2238e6c77?phone=${digits}&code=${code}`);
      const data = await response.json();

      if (data.success) {
        if (data.needsRegistration) {
          localStorage.setItem('tempPhone', digits);
          navigate('/register');
        } else {
          localStorage.setItem('clientData', JSON.stringify(data.client));
          navigate('/cabinet');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    const digits = '7' + phone.replace(/\D/g, '');
    const response = await fetch(`https://functions.poehali.dev/8d06286b-b17d-431a-a73d-70ed8e8e18e6?phone=${digits}`);
    const data = await response.json();
    
    if (data.success) {
      setCountdown(60);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCode(value);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center lg:p-6">
      <div className="w-full min-h-screen lg:min-h-0 lg:max-w-md lg:rounded-2xl lg:shadow-2xl bg-[#F5F5F5] flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-center lg:rounded-t-2xl">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#FFD500] flex items-center justify-center flex-shrink-0">
            <span className="text-black font-bold text-xs sm:text-sm leading-tight text-center">ТВОИ<br/>ЗАЙМЫ</span>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 pt-10 sm:pt-16 pb-6 sm:pb-8">
          {step === 'phone' ? (
            <>
              <h1 className="text-3xl sm:text-4xl font-bold text-black mb-1 sm:mb-2">Войдите или</h1>
              <h1 className="text-3xl sm:text-4xl font-bold text-black mb-8 sm:mb-12">зарегистрируйтесь</h1>

              <form onSubmit={handlePhoneSubmit} className="space-y-5 sm:space-y-6">
                <div className="relative">
                  <div className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-base sm:text-lg text-gray-900 font-medium pointer-events-none z-10">
                    +7
                  </div>
                  <Input
                    type="tel"
                    placeholder="(___) ___-__-__"
                    value={phone}
                    onChange={handlePhoneChange}
                    className="w-full h-14 sm:h-16 pl-12 sm:pl-14 pr-4 sm:pr-5 text-base sm:text-lg bg-white border-2 border-[#DC3545] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#DC3545] focus:ring-offset-2 transition-all placeholder:text-gray-400 shadow-sm"
                    autoFocus
                    disabled={loading}
                  />
                </div>

                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Нажимая на кнопку «Продолжить» и вводя код в специальное поле, я соглашаюсь с{' '}
                  <a href="#" className="text-blue-600 underline hover:text-blue-800 transition-colors">условиями обработки персональных данных</a>
                  , а также даю{' '}
                  <a href="#" className="text-blue-600 underline hover:text-blue-800 transition-colors">согласие на обработку персональных данных</a>
                </p>

                <Button
                  type="submit"
                  className="w-full h-14 sm:h-16 text-base sm:text-lg font-semibold bg-[#E8E8E8] hover:bg-[#D8D8D8] text-gray-400 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  disabled={loading || phone.replace(/\D/g, '').length !== 10}
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
                <span className="font-medium text-black">+7 {phone}</span>
              </p>

              <form onSubmit={handleCodeSubmit} className="space-y-5 sm:space-y-6">
                <div>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="_ _ _ _"
                    value={code}
                    onChange={handleCodeChange}
                    className="w-full h-16 sm:h-20 px-4 sm:px-5 text-3xl sm:text-4xl text-center tracking-[0.5em] bg-white border-2 border-[#DC3545] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#DC3545] focus:ring-offset-2 transition-all placeholder:text-gray-300 shadow-sm"
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
                    className="text-xs sm:text-sm text-blue-600 underline w-full text-center hover:text-blue-800 transition-colors font-medium"
                  >
                    Отправить код повторно
                  </button>
                )}

                <Button
                  type="submit"
                  className="w-full h-14 sm:h-16 text-base sm:text-lg font-semibold bg-[#E8E8E8] hover:bg-[#D8D8D8] text-gray-400 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  disabled={loading || code.length !== 4}
                >
                  {loading ? 'Проверка...' : 'Подтвердить'}
                </Button>
              </form>
            </>
          )}
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

export default ClientLogin;
