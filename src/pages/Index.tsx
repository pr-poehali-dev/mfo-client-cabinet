import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-3 sm:p-4 md:p-6">
      <div className="w-full max-w-2xl">
        <Card className="border-gray-200 bg-white shadow-xl">
          <CardContent className="pt-8 pb-6 px-4 sm:pt-10 sm:pb-8 sm:px-6 md:pt-12 md:pb-10 md:px-8">
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-2xl shadow-emerald-500/30 mb-4 sm:mb-6">
                <Icon name="Home" size={48} className="text-white sm:w-14 sm:h-14 md:w-16 md:h-16" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2 sm:mb-3">Деньги в дом</h1>
              <p className="text-gray-600 text-base sm:text-lg md:text-xl">
                Микрозаймы для вашего комфорта
              </p>
            </div>

            <Button
              onClick={() => navigate('/megagroup-login')}
              className="w-full text-base sm:text-lg md:text-xl h-12 sm:h-14 md:h-16 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/30 transition-all mb-6 sm:mb-8"
            >
              <Icon name="Lock" size={20} className="mr-2 sm:mr-3 sm:w-6 sm:h-6" />
              Вход в личный кабинет
            </Button>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8 md:mt-10 mb-6 sm:mb-8 md:mb-10">
              <div className="text-center p-4 sm:p-5">
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
                  <Icon name="CheckCircle2" size={28} className="text-emerald-600 sm:w-8 sm:h-8" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-base sm:text-lg">Быстро</h3>
                <p className="text-xs sm:text-sm text-gray-600">Деньги на карту за 15 минут</p>
              </div>

              <div className="text-center p-4 sm:p-5">
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center">
                  <Icon name="Shield" size={28} className="text-teal-600 sm:w-8 sm:h-8" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-base sm:text-lg">Надежно</h3>
                <p className="text-xs sm:text-sm text-gray-600">Конфиденциальность гарантирована</p>
              </div>

              <div className="text-center p-4 sm:p-5">
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                  <Icon name="Percent" size={28} className="text-amber-600 sm:w-8 sm:h-8" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-base sm:text-lg">Выгодно</h3>
                <p className="text-xs sm:text-sm text-gray-600">Низкие процентные ставки</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 sm:pt-8 mt-6 sm:mt-8">
              <h2 className="text-center text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Служба поддержки</h2>
              
              <div className="space-y-3 sm:space-y-4">
                <a 
                  href="tel:+78005553535"
                  className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 transition-colors group"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                    <Icon name="Phone" size={20} className="text-white sm:w-6 sm:h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">Горячая линия</p>
                    <p className="text-base sm:text-lg md:text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                      8 (800) 555-35-35
                    </p>
                  </div>
                  <Icon name="ChevronRight" size={20} className="text-gray-400 group-hover:text-emerald-500 transition-colors flex-shrink-0 sm:w-6 sm:h-6" />
                </a>

                <a 
                  href="https://wa.me/78005553535"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-colors group"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0">
                    <Icon name="MessageCircle" size={20} className="text-white sm:w-6 sm:h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">WhatsApp</p>
                    <p className="text-sm sm:text-base md:text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors truncate">
                      Написать в WhatsApp
                    </p>
                  </div>
                  <Icon name="ChevronRight" size={20} className="text-gray-400 group-hover:text-green-500 transition-colors flex-shrink-0 sm:w-6 sm:h-6" />
                </a>

                <a 
                  href="mailto:support@dengivdom.ru"
                  className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors group"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                    <Icon name="Mail" size={20} className="text-white sm:w-6 sm:h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">Email</p>
                    <p className="text-sm sm:text-base md:text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                      support@dengivdom.ru
                    </p>
                  </div>
                  <Icon name="ChevronRight" size={20} className="text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0 sm:w-6 sm:h-6" />
                </a>
              </div>

              <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-500">
                <p>Работаем ежедневно с 9:00 до 21:00</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-4 sm:mt-6 px-4">
          <p className="text-xs sm:text-sm text-gray-500">
            © 2025 Деньги в дом. Все права защищены.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;