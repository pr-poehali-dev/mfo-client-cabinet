import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
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

      console.log('МегаГрупп response:', data);

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
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f1419] p-4">
      <div className="max-w-6xl mx-auto space-y-6 py-8">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                  <Icon name="User" size={32} className="text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-montserrat">
                    {client?.name || 'Загрузка...'}
                  </CardTitle>
                  <CardDescription className="text-lg">
                    {client ? formatPhone(client.phone) : ''}
                  </CardDescription>
                  {client?.email && (
                    <p className="text-sm text-muted-foreground mt-1">{client.email}</p>
                  )}
                </div>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-border/50"
              >
                <Icon name="LogOut" size={18} className="mr-2" />
                Выйти
              </Button>
            </div>
          </CardHeader>
        </Card>

        {client && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardDescription>Баланс</CardDescription>
                <CardTitle className="text-3xl">
                  {formatPrice(client.balance)}
                </CardTitle>
              </CardHeader>
            </Card>
            
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardDescription>Бонусы</CardDescription>
                <CardTitle className="text-3xl">
                  {formatPrice(client.bonus_balance)}
                </CardTitle>
              </CardHeader>
            </Card>
            
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardDescription>Скидка</CardDescription>
                <CardTitle className="text-3xl">
                  {client.discount}%
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-2xl font-montserrat flex items-center gap-2">
                  <Icon name="ShoppingCart" size={28} />
                  Мои заказы
                </CardTitle>
                <CardDescription>
                  {loading ? 'Загрузка...' : `Всего заказов: ${orders.length}`}
                </CardDescription>
              </div>
              <Button
                onClick={handleRefresh}
                disabled={loading}
                variant="outline"
                className="border-border/50"
              >
                <Icon name="RefreshCw" size={18} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                Обновить
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Icon name="Loader2" size={40} className="animate-spin text-primary" />
                <p className="text-muted-foreground">Загружаем ваши заказы...</p>
              </div>
            ) : error ? (
              <Alert className="bg-red-500/10 border-red-500/30">
                <Icon name="AlertCircle" size={18} className="text-red-500" />
                <AlertDescription className="text-red-500">
                  {error}
                </AlertDescription>
              </Alert>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Icon name="Inbox" size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">У вас пока нет заказов</p>
                <p className="text-sm mt-2">Заказы появятся здесь после их создания</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="border-border/30 bg-background/30 hover:bg-background/50 transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2">
                            {order.title || `Заказ №${order.number}`}
                          </h3>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <p className="flex items-center gap-2">
                              <Icon name="Calendar" size={16} />
                              {formatDate(order.date)}
                            </p>
                            <p className="flex items-center gap-2">
                              <Icon name="Tag" size={16} />
                              Статус: {order.status}
                            </p>
                            {order.total > 0 && (
                              <p className="flex items-center gap-2">
                                <Icon name="Ruble" size={16} />
                                {formatPrice(order.total)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MegagroupCabinet;
