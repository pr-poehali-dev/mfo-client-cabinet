import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import Header from '@/components/dashboard/Header';
import ProfileTab from '@/components/dashboard/ProfileTab';
import DealsTab from '@/components/dashboard/DealsTab';
import LoginPage from '@/components/auth/LoginPage';
import { Loan, Payment, Notification, Deal } from '@/components/dashboard/types';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userPhone, setUserPhone] = useState('');
  const [activeTab, setActiveTab] = useState('deals');
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [clientName, setClientName] = useState('');
  const [clientFirstName, setClientFirstName] = useState('');
  const [clientLastName, setClientLastName] = useState('');
  const [clientMiddleName, setClientMiddleName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchAmoCRMData = async (phone: string) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(
        `https://functions.poehali.dev/6e80b3d4-1759-415b-bd93-5e37f93088a5?phone=${phone}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 500 && errorData.message?.includes('credentials')) {
          setError('Настройте AmoCRM: добавьте AMOCRM_DOMAIN и ACCESS_TOKEN в секреты проекта');
        } else if (response.status === 404) {
          setError('Клиент не найден в AmoCRM');
        } else {
          setError(errorData.error || 'Ошибка загрузки данных');
        }
        return;
      }
      
      const data = await response.json();
      
      setClientName(data.name || 'Клиент');
      setClientFirstName(data.first_name || '');
      setClientLastName(data.last_name || '');
      setClientMiddleName(data.middle_name || '');
      setClientPhone(data.phone || '');
      setClientEmail(data.email || '');
      setLoans(data.loans || []);
      setPayments(data.payments || []);
      setNotifications(data.notifications || []);
      setDeals(data.deals || []);
      setLastUpdate(new Date());
      
    } catch (err) {
      console.error('AmoCRM sync error:', err);
      setError('Не удалось подключиться к AmoCRM');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedPhone = localStorage.getItem('userPhone');
    if (savedPhone) {
      setUserPhone(savedPhone);
      setIsAuthenticated(true);
      fetchAmoCRMData(savedPhone);
      
      const intervalId = setInterval(() => {
        fetchAmoCRMData(savedPhone);
      }, 5 * 60 * 1000);
      
      return () => clearInterval(intervalId);
    }
  }, []);

  const handleLogin = (phone: string) => {
    setUserPhone(phone);
    setIsAuthenticated(true);
    localStorage.setItem('userPhone', phone);
    fetchAmoCRMData(phone);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserPhone('');
    localStorage.removeItem('userPhone');
    setLoans([]);
    setPayments([]);
    setNotifications([]);
    setDeals([]);
    setClientName('');
    setClientFirstName('');
    setClientLastName('');
    setClientMiddleName('');
    setClientPhone('');
    setClientEmail('');
  };

  const refreshData = async () => {
    if (!userPhone) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(
        `https://functions.poehali.dev/6e80b3d4-1759-415b-bd93-5e37f93088a5?phone=${userPhone}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 500 && errorData.message?.includes('credentials')) {
          setError('Настройте AmoCRM: добавьте AMOCRM_DOMAIN и ACCESS_TOKEN в секреты проекта');
        } else {
          setError(errorData.error || 'Ошибка загрузки данных');
        }
        return;
      }
      
      const data = await response.json();
      
      setClientName(data.name || 'Клиент');
      setClientPhone(data.phone || '');
      setClientEmail(data.email || '');
      setLoans(data.loans || []);
      setPayments(data.payments || []);
      setDeals(data.deals || []);
      setNotifications(data.notifications || []);
      setLastUpdate(new Date());
      
      setNotifications(prev => [{
        id: Date.now().toString(),
        title: 'Данные обновлены',
        message: 'Информация успешно синхронизирована из AmoCRM',
        date: new Date().toLocaleDateString('ru-RU'),
        read: false,
        type: 'success'
      }, ...prev]);
      
    } catch (err) {
      console.error('Refresh error:', err);
      setError('Не удалось обновить данные');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f1419]">
      <Header 
        lastUpdate={lastUpdate}
        loading={loading}
        notifications={notifications}
        onRefresh={refreshData}
        onLogout={handleLogout}
      />

      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-3">
            <Icon name="AlertCircle" size={20} className="text-yellow-500" />
            <p className="text-sm text-yellow-200">{error}</p>
          </div>
        )}
        
        {loading && (
          <div className="mb-6 p-4 bg-secondary/10 border border-secondary/30 rounded-lg flex items-center gap-3">
            <div className="animate-spin">
              <Icon name="Loader2" size={20} className="text-secondary" />
            </div>
            <p className="text-sm text-muted-foreground">Загрузка данных из AmoCRM...</p>
          </div>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-card/50 backdrop-blur-sm p-1 h-auto">
            <TabsTrigger value="deals" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary py-3">
              <Icon name="Briefcase" size={18} />
              <span className="hidden sm:inline">Сделки</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary py-3">
              <Icon name="User" size={18} />
              <span className="hidden sm:inline">Профиль</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deals">
            <DealsTab deals={deals} />
          </TabsContent>

          <TabsContent value="profile">
            <ProfileTab 
              clientName={clientName}
              clientFirstName={clientFirstName}
              clientLastName={clientLastName}
              clientMiddleName={clientMiddleName}
              clientPhone={clientPhone}
              clientEmail={clientEmail}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;