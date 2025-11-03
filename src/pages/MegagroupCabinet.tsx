import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  balance: number;
  bonus_balance: number;
  discount: number;
}

interface Order {
  id: string;
  number: string;
  date: string;
  status: string;
  total: number;
  items_count: number;
  title?: string;
}

const MegagroupCabinet = () => {
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const phone = localStorage.getItem('megagroupPhone');
    
    if (!phone) {
      navigate('/megagroup-login');
      return;
    }

    loadClientData(phone);
  }, [navigate]);

  const loadClientData = async (phone: string) => {
    setLoading(true);
    setError('');

    try {
      const url = `https://functions.poehali.dev/44db4f9d-e497-4fac-b36c-64aa9c7edf64?phone=${phone}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setClient(data.client);
        setOrders(data.orders || []);
        localStorage.setItem('megagroupClient', JSON.stringify(data.client));
      } else {
        if (data.not_found) {
          setError('Клиент не найден в системе МегаГрупп');
        } else {
          setError(data.error || 'Ошибка загрузки данных');
        }
      }
    } catch (err) {
      console.error('Load client error:', err);
      setError('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('megagroupPhone');
    localStorage.removeItem('megagroupClient');
    navigate('/megagroup-login');
  };

  const handleRefresh = () => {
    const phone = localStorage.getItem('megagroupPhone');
    if (phone) {
      loadClientData(phone);
    }
  };

  const formatPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11) {
      return `+${digits[0]} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
    }
    return phone;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusConfig = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: string; color: string }> = {
      'active': { label: 'Активный', variant: 'default', icon: 'CheckCircle2', color: 'bg-emerald-500' },
      'pending': { label: 'Ожидает', variant: 'secondary', icon: 'Clock', color: 'bg-amber-500' },
      'approved': { label: 'Одобрен', variant: 'default', icon: 'CheckCircle2', color: 'bg-emerald-500' },
      'rejected': { label: 'Отклонен', variant: 'destructive', icon: 'XCircle', color: 'bg-red-500' },
      'completed': { label: 'Завершен', variant: 'outline', icon: 'Check', color: 'bg-gray-400' },
      'overdue': { label: 'Просрочен', variant: 'destructive', icon: 'AlertTriangle', color: 'bg-red-500' },
    };
    
    return statusMap[status.toLowerCase()] || { label: status, variant: 'secondary', icon: 'HelpCircle', color: 'bg-gray-400' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Загружаем данные...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-4 sm:py-6 shadow-lg">
        <div className="max-w-6xl mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between flex-wrap gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <Icon name="User" size={24} className="text-white sm:w-8 sm:h-8" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold truncate">
                  {client?.name || 'Загрузка...'}
                </h1>
                <p className="text-emerald-100 text-xs sm:text-sm">
                  {client ? formatPhone(client.phone) : ''}
                </p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 text-xs sm:text-sm h-8 sm:h-10"
            >
              <Icon name="LogOut" size={16} className="mr-1 sm:mr-2 sm:w-4 sm:h-4" />
              Выйти
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6">
        {error && (
          <Alert className="bg-red-50 border-red-200">
            <Icon name="AlertCircle" size={18} className="text-red-600" />
            <AlertDescription className="text-red-700 font-medium">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {client && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            <Card className="border-gray-200 bg-white shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-4 pb-4 sm:pt-6 sm:pb-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Icon name="Wallet" size={24} className="text-white sm:w-7 sm:h-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-500 font-medium">Баланс счета</p>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-0.5 sm:mt-1 truncate">
                      {formatPrice(client.balance)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-white shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-4 pb-4 sm:pt-6 sm:pb-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center flex-shrink-0">
                    <Icon name="Star" size={24} className="text-white sm:w-7 sm:h-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-500 font-medium">Бонусы</p>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-0.5 sm:mt-1 truncate">
                      {formatPrice(client.bonus_balance)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-white shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-4 pb-4 sm:pt-6 sm:pb-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                    <Icon name="Percent" size={24} className="text-white sm:w-7 sm:h-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-500 font-medium">Скидка</p>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-0.5 sm:mt-1">
                      {client.discount}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="border-gray-200 bg-white shadow-lg">
          <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
            <div className="flex items-center justify-between flex-wrap gap-3 sm:gap-4">
              <div className="min-w-0 flex-1">
                <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                  <Icon name="CreditCard" size={24} className="text-emerald-500 flex-shrink-0 sm:w-7 sm:h-7" />
                  <span className="truncate">Мои займы</span>
                </CardTitle>
                <CardDescription className="text-sm sm:text-base mt-1">
                  Всего займов: {orders.length}
                </CardDescription>
              </div>
              <Button
                onClick={handleRefresh}
                disabled={loading}
                variant="outline"
                size="sm"
                className="border-gray-300 text-xs sm:text-sm h-8 sm:h-10 flex-shrink-0"
              >
                <Icon name="RefreshCw" size={16} className={`mr-1 sm:mr-2 ${loading ? 'animate-spin' : ''} sm:w-4 sm:h-4`} />
                Обновить
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 py-4 sm:py-6">
            {orders.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 mb-3 sm:mb-4">
                  <Icon name="Inbox" size={32} className="text-gray-400 sm:w-10 sm:h-10" />
                </div>
                <p className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">Нет активных займов</p>
                <p className="text-sm sm:text-base text-gray-500">Ваши займы появятся здесь</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {orders.map((order) => {
                  const statusConfig = getStatusConfig(order.status);
                  
                  return (
                    <Card key={order.id} className="border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:shadow-md transition-all">
                      <CardContent className="pt-4 pb-4 sm:pt-6 sm:pb-6">
                        <div className="flex items-start justify-between gap-3 sm:gap-4 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                              <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${statusConfig.color} flex-shrink-0`}></div>
                              <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 truncate">
                                {order.title || `Заказ №${order.number}`}
                              </h3>
                            </div>
                            
                            <div className="space-y-1 sm:space-y-2">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Icon name="Calendar" size={14} className="flex-shrink-0 sm:w-4 sm:h-4" />
                                <span className="text-xs sm:text-sm">{formatDate(order.date)}</span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-gray-600">
                                <Icon name="Package" size={14} className="flex-shrink-0 sm:w-4 sm:h-4" />
                                <span className="text-xs sm:text-sm">Позиций: {order.items_count}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2 sm:gap-3 flex-shrink-0">
                            <Badge 
                              variant={statusConfig.variant}
                              className="text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1"
                            >
                              <Icon name={statusConfig.icon} size={12} className="mr-1 sm:w-3.5 sm:h-3.5" />
                              {statusConfig.label}
                            </Badge>
                            
                            <div className="text-right">
                              <p className="text-xs sm:text-sm text-gray-500">Сумма займа</p>
                              <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 whitespace-nowrap">
                                {formatPrice(order.total)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center py-3 sm:py-4">
          <p className="text-xs sm:text-sm text-gray-500 flex items-center justify-center gap-1.5 sm:gap-2">
            <Icon name="Shield" size={14} className="text-emerald-600 flex-shrink-0 sm:w-4 sm:h-4" />
            <span>Ваши данные защищены и конфиденциальны</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MegagroupCabinet;