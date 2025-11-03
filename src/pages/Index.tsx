import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="border-gray-200 bg-white shadow-xl">
          <CardContent className="pt-12 pb-10 px-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-2xl shadow-emerald-500/30 mb-6">
                <Icon name="Home" size={64} className="text-white" />
              </div>
              <h1 className="text-5xl font-bold text-gray-900 mb-3">Деньги в дом</h1>
              <p className="text-gray-600 text-xl">
                Микрозаймы для вашего комфорта
              </p>
            </div>

            <Button
              onClick={() => navigate('/megagroup-login')}
              className="w-full text-xl h-16 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/30 transition-all mb-8"
            >
              <Icon name="Lock" size={24} className="mr-3" />
              Вход в личный кабинет
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 mb-10">
              <div className="text-center p-5">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
                  <Icon name="CheckCircle2" size={32} className="text-emerald-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Быстро</h3>
                <p className="text-sm text-gray-600">Деньги на карту за 15 минут</p>
              </div>

              <div className="text-center p-5">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center">
                  <Icon name="Shield" size={32} className="text-teal-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Надежно</h3>
                <p className="text-sm text-gray-600">Конфиденциальность гарантирована</p>
              </div>

              <div className="text-center p-5">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                  <Icon name="Percent" size={32} className="text-amber-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Выгодно</h3>
                <p className="text-sm text-gray-600">Низкие процентные ставки</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-8 mt-8">
              <h2 className="text-center text-xl font-bold text-gray-900 mb-6">Служба поддержки</h2>
              
              <div className="space-y-4">
                <a 
                  href="tel:+78005553535"
                  className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                    <Icon name="Phone" size={24} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">Горячая линия</p>
                    <p className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                      8 (800) 555-35-35
                    </p>
                  </div>
                  <Icon name="ChevronRight" size={24} className="text-gray-400 group-hover:text-emerald-500 transition-colors" />
                </a>

                <a 
                  href="https://wa.me/78005553535"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0">
                    <Icon name="MessageCircle" size={24} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">WhatsApp</p>
                    <p className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                      Написать в WhatsApp
                    </p>
                  </div>
                  <Icon name="ChevronRight" size={24} className="text-gray-400 group-hover:text-green-500 transition-colors" />
                </a>

                <a 
                  href="mailto:support@dengivdom.ru"
                  className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                    <Icon name="Mail" size={24} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <p className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      support@dengivdom.ru
                    </p>
                  </div>
                  <Icon name="ChevronRight" size={24} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                </a>
              </div>

              <div className="mt-6 text-center text-sm text-gray-500">
                <p>Работаем ежедневно с 9:00 до 21:00</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            © 2025 Деньги в дом. Все права защищены.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
