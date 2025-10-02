import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import Header from '@/components/dashboard/Header';
import DashboardTab from '@/components/dashboard/DashboardTab';
import LoansTab from '@/components/dashboard/LoansTab';
import PaymentsTab from '@/components/dashboard/PaymentsTab';
import ProfileTab from '@/components/dashboard/ProfileTab';
import LoginPage from '@/components/auth/LoginPage';
import { Loan, Payment, Notification } from '@/components/dashboard/types';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userPhone, setUserPhone] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [clientName, setClientName] = useState('');
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
          setError('Настройте AmoCRM: добавьте AMOCRM_DOMAIN и AMOCRM_ACCESS_TOKEN в секреты проекта');
          loadDemoData();
        } else if (response.status === 404) {
          setError('Клиент не найден в AmoCRM');
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
      setNotifications(data.notifications || []);
      setLastUpdate(new Date());
      
    } catch (err) {
      console.error('AmoCRM sync error:', err);
      setError('Не удалось подключиться к AmoCRM');
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  const loadDemoData = () => {
    setLoans([
      {
        id: '4500000',
        amount: 4500000,
        paid: 890000,
        status: 'active',
        date: '15.08.2024',
        nextPayment: '15.10.2024',
        rate: 24.5
      },
      {
        id: '3250000',
        amount: 3250000,
        paid: 3250000,
        status: 'completed',
        date: '10.05.2022',
        nextPayment: '-',
        rate: 24.0
      }
    ]);
    
    setPayments([
      { id: '1', amount: 150000, date: '15.09.2024', type: 'payment', status: 'success' },
      { id: '2', amount: 150000, date: '15.08.2024', type: 'payment', status: 'success' },
      { id: '3', amount: 5000, date: '20.07.2024', type: 'fee', status: 'success' },
      { id: '4', amount: 150000, date: '15.07.2024', type: 'payment', status: 'success' }
    ]);
    
    setNotifications([
      {
        id: '1',
        title: 'Демо режим',
        message: 'Показаны тестовые данные. Настройте AmoCRM для синхронизации.',
        date: new Date().toLocaleDateString('ru-RU'),
        read: false,
        type: 'warning'
      }
    ]);
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
    setClientName('');
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
          setError('Настройте AmoCRM: добавьте AMOCRM_DOMAIN и AMOCRM_ACCESS_TOKEN в секреты проекта');
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
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-card/50 backdrop-blur-sm p-1 h-auto">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary py-3">
              <Icon name="LayoutDashboard" size={18} />
              <span className="hidden sm:inline">Дашборд</span>
            </TabsTrigger>
            <TabsTrigger value="loans" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary py-3">
              <Icon name="FileText" size={18} />
              <span className="hidden sm:inline">Займы</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary py-3">
              <Icon name="CreditCard" size={18} />
              <span className="hidden sm:inline">Платежи</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary py-3">
              <Icon name="User" size={18} />
              <span className="hidden sm:inline">Профиль</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardTab loans={loans} notifications={notifications} />
          </TabsContent>

          <TabsContent value="loans">
            <LoansTab loans={loans} />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentsTab payments={payments} />
          </TabsContent>

          <TabsContent value="profile">
            <ProfileTab 
              clientName={clientName}
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
