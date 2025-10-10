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
  stage_id?: string;
  status_id?: number;
  pipeline_id?: number;
  created_at: string | number;
  updated_at: string | number;
}

const ClientCabinet = () => {
  const navigate = useNavigate();
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientFullName, setClientFullName] = useState('');
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const phone = localStorage.getItem('clientPhone');
    const name = localStorage.getItem('clientName');
    const fullName = localStorage.getItem('clientFullName');
    
    if (!phone) {
      navigate('/login');
      return;
    }

    setClientPhone(phone);
    setClientName(name || 'Клиент');
    setClientFullName(fullName || '');
    loadDeals(phone, fullName || '');
  }, [navigate]);

  const loadDeals = async (phone: string, fullName: string) => {
    setLoading(true);
    setError('');

    try {
      const url = `https://functions.poehali.dev/40d400f9-c52e-41e3-bd22-032a937010cd?phone=${phone}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setDeals(data.deals || []);
        if (data.client?.name) {
          setClientName(data.client.name);
          localStorage.setItem('clientName', data.client.name);
        }
      } else {
        if (data.not_found) {
          setError('Клиент не найден. Проверьте номер телефона.');
        } else {
          setError(data.error || 'Ошибка загрузки заявок из Битрикс24');
        }
      }
    } catch (err) {
      setError('Ошибка подключения к Битрикс24');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('clientPhone');
    localStorage.removeItem('clientName');
    localStorage.removeItem('clientFullName');
    navigate('/login');
  };

  const handleRefresh = () => {
    if (clientPhone) {
      loadDeals(clientPhone, clientFullName);
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

  const formatDate = (timestamp: string | number) => {
    if (typeof timestamp === 'string') {
      return new Date(timestamp).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return new Date(timestamp * 1000).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (deal: Deal) => {
    const stageId = deal.stage_id || '';
    
    if (stageId.includes('WON') || stageId.includes('SUCCESS')) return 'bg-green-500/20 text-green-300 border-green-500/30';
    if (stageId.includes('LOSE') || stageId.includes('FAIL')) return 'bg-red-500/20 text-red-300 border-red-500/30';
    if (stageId.includes('NEW')) return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
  };

  const getStatusName = (deal: Deal) => {
    const stageId = deal.stage_id || '';
    
    const stageNames: Record<string, string> = {
      'NEW': 'Новая заявка',
      'PREPARATION': 'Подготовка документов',
      'PREPAYMENT_INVOICE': 'Выставлен счет',
      'EXECUTING': 'Выполняется',
      'FINAL_INVOICE': 'Финальный счет',
      'WON': 'Успешно завершена',
      'LOSE': 'Провалена'
    };
    for (const [key, name] of Object.entries(stageNames)) {
      if (stageId.includes(key)) return name;
    }
    return stageId.split(':').pop() || stageId;
  };

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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-montserrat flex items-center gap-2">
                  <Icon name="FileText" size={28} />
                  Мои заявки из Битрикс24
                </CardTitle>
                <CardDescription>
                  Всего заявок: {deals.length}
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
                <p className="text-lg">У вас пока нет заявок в Битрикс24</p>
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
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(deal)}`}>
                              {getStatusName(deal)}
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
                            <span>ID заявки: {deal.id}</span>
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