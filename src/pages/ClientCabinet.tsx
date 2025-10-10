import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';

interface Deal {
  id: number;
  name: string;
  price: number;
  stage_id: string;
  created_at: string;
  updated_at: string;
}

const ClientCabinet = () => {
  const navigate = useNavigate();
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const phone = localStorage.getItem('clientPhone');
    const name = localStorage.getItem('clientName');
    
    if (!phone) {
      navigate('/login');
      return;
    }

    setClientPhone(phone);
    setClientName(name || 'Клиент');
    loadDeals(phone);
  }, [navigate]);

  const loadDeals = async (phone: string) => {
    setLoading(true);
    setError('');

    try {
      const url = `https://functions.poehali.dev/40d400f9-c52e-41e3-bd22-032a937010cd?phone=${phone}`;
      const response = await fetch(url);
      const data = await response.json();

      console.log('Bitrix24 response:', data);

      if (data.success) {
        setDeals(data.deals || []);
        if (data.client?.name) {
          setClientName(data.client.name);
          localStorage.setItem('clientName', data.client.name);
        }
      } else {
        if (data.not_found) {
          setError('Клиент не найден в системе.');
        } else {
          setError(data.error || 'Ошибка загрузки данных');
        }
      }
    } catch (err) {
      console.error('Load deals error:', err);
      setError('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('clientPhone');
    localStorage.removeItem('clientName');
    navigate('/login');
  };

  const handleRefresh = () => {
    if (clientPhone) {
      loadDeals(clientPhone);
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

  const getStatusColor = (stageId: string) => {
    if (stageId.includes('WON') || stageId.includes('SUCCESS')) {
      return 'bg-green-500/20 text-green-300 border-green-500/30';
    }
    if (stageId.includes('LOSE') || stageId.includes('FAIL')) {
      return 'bg-red-500/20 text-red-300 border-red-500/30';
    }
    if (stageId.includes('NEW')) {
      return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
    return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
  };

  const getStatusName = (stageId: string) => {
    const stageNames: Record<string, string> = {
      'NEW': 'Новая заявка',
      'PREPARATION': 'Подготовка документов',
      'PREPAYMENT_INVOICE': 'Выставлен счет',
      'EXECUTING': 'Выполняется',
      'FINAL_INVOICE': 'Финальный счет',
      'WON': 'Успешно завершена',
      'LOSE': 'Отклонена'
    };

    for (const [key, name] of Object.entries(stageNames)) {
      if (stageId.includes(key)) return name;
    }

    const parts = stageId.split(':');
    return parts[parts.length - 1] || stageId;
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
                    {clientName}
                  </CardTitle>
                  <CardDescription className="text-lg">
                    {formatPhone(clientPhone)}
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
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-2xl font-montserrat flex items-center gap-2">
                  <Icon name="Briefcase" size={28} />
                  Мои заявки
                </CardTitle>
                <CardDescription>
                  {loading ? 'Загрузка...' : `Всего заявок: ${deals.length}`}
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
                <p className="text-muted-foreground">Загружаем ваши заявки...</p>
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
                <p className="text-lg font-medium">У вас пока нет заявок</p>
                <p className="text-sm mt-2">Заявки появятся здесь после их создания в системе</p>
              </div>
            ) : (
              <div className="space-y-4">
                {deals.map((deal) => (
                  <Card key={deal.id} className="border-border/30 bg-background/30 hover:bg-background/50 transition-colors">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-semibold mb-2 truncate">{deal.name}</h3>
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(deal.stage_id)}`}>
                              {getStatusName(deal.stage_id)}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-right">
                            <Icon name="DollarSign" size={20} className="text-primary" />
                            <span className="font-bold text-xl text-primary">
                              {formatPrice(deal.price)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-border/30">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Icon name="Calendar" size={16} />
                            <span>Создана: {formatDate(deal.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Icon name="Clock" size={16} />
                            <span>Обновлена: {formatDate(deal.updated_at)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                          <Icon name="Hash" size={14} />
                          <span>ID: {deal.id}</span>
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
