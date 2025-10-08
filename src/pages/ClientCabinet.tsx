import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';

interface Deal {
  id: number;
  amocrm_id: number;
  name: string;
  price: number;
  status: string;
  created_at: string;
  client_name: string;
  client_phone: string;
}

interface ClientData {
  id: number;
  name: string;
  phone: string;
}

const ClientCabinet = () => {
  const navigate = useNavigate();
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedData = localStorage.getItem('clientData');
    if (!storedData) {
      navigate('/login');
      return;
    }

    const client: ClientData = JSON.parse(storedData);
    setClientData(client);
    loadDeals(client.id);
  }, [navigate]);

  const loadDeals = async (clientId: number) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `https://functions.poehali.dev/f9d7139b-9387-46c7-be03-87947f532a1b?client_id=${clientId}`
      );

      const data = await response.json();

      if (data.success) {
        setDeals(data.deals || []);
      } else {
        setError(data.error || 'Ошибка загрузки заявок');
      }
    } catch (err) {
      setError('Ошибка подключения');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('clientData');
    navigate('/login');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'Новая заявка': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'В работе': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'Выполнена': 'bg-green-500/20 text-green-300 border-green-500/30',
      'Отменена': 'bg-red-500/20 text-red-300 border-red-500/30'
    };
    return statusMap[status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  if (!clientData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f1419] p-4">
      <div className="max-w-6xl mx-auto space-y-6 py-8">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                  <Icon name="User" size={32} className="text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-montserrat">
                    {clientData.name}
                  </CardTitle>
                  <CardDescription className="text-lg">
                    {clientData.phone}
                  </CardDescription>
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

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-montserrat flex items-center gap-2">
              <Icon name="FileText" size={28} />
              Мои заявки
            </CardTitle>
            <CardDescription>
              Всего заявок: {deals.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Icon name="Loader2" size={40} className="animate-spin text-primary" />
              </div>
            ) : error ? (
              <Alert className="bg-red-500/10 border-red-500/30">
                <Icon name="AlertCircle" size={18} className="text-red-500" />
                <AlertDescription className="text-red-500">
                  {error}
                </AlertDescription>
              </Alert>
            ) : deals.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Icon name="Inbox" size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">У вас пока нет заявок</p>
              </div>
            ) : (
              <div className="space-y-4">
                {deals.map((deal) => (
                  <Card key={deal.id} className="border-border/30 bg-background/30">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-semibold">{deal.name}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(deal.status)}`}>
                              {deal.status}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Icon name="DollarSign" size={16} />
                              <span className="font-semibold text-foreground text-lg">
                                {formatPrice(deal.price)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Icon name="Calendar" size={16} />
                              <span>{formatDate(deal.created_at)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Icon name="Hash" size={14} />
                            <span>ID заявки: {deal.amocrm_id}</span>
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

export default ClientCabinet;
