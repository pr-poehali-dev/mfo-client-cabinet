import { useState, useEffect } from 'react';
import Header from '@/components/dashboard/Header';
import LoginPage from '@/components/auth/LoginPage';
import WelcomeBanner from '@/components/dashboard/WelcomeBanner';
import ErrorBanner from '@/components/dashboard/ErrorBanner';
import LoadingBanner from '@/components/dashboard/LoadingBanner';
import DashboardTabs from '@/components/dashboard/DashboardTabs';
import { useAuth } from '@/hooks/useAuth';
import { useAmoCRM } from '@/hooks/useAmoCRM';
import { Loan, Payment, AppNotification, Deal } from '@/components/dashboard/types';

const Index = () => {
  const { 
    isAuthenticated, 
    userPhone, 
    clientName: authClientName, 
    login, 
    logout: authLogout,
    checkNewRegistration,
    clearNewRegistration
  } = useAuth();

  const { loading, error, fetchAmoCRMData } = useAmoCRM();

  const [activeTab, setActiveTab] = useState('applications');
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [clientName, setClientName] = useState('');
  const [clientFirstName, setClientFirstName] = useState('');
  const [clientLastName, setClientLastName] = useState('');
  const [clientMiddleName, setClientMiddleName] = useState('');
  const [clientGender, setClientGender] = useState<'male' | 'female'>('male');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [contactId, setContactId] = useState('');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  useEffect(() => {
    if (activeTab === 'support') {
      setUnreadMessagesCount(0);
    }
  }, [activeTab]);

  useEffect(() => {
    if (isAuthenticated && userPhone) {
      if (authClientName) {
        setClientName(authClientName);
      }

      if (checkNewRegistration()) {
        setNotifications([{
          id: 'welcome-' + Date.now(),
          title: '🎉 Добро пожаловать!',
          message: 'Ваша заявка успешно принята в обработку. Мы свяжемся с вами в ближайшее время.',
          date: new Date().toLocaleDateString('ru-RU'),
          read: false,
          type: 'success'
        }]);
        clearNewRegistration();
      }

      loadData(userPhone);
    }
  }, [isAuthenticated, userPhone]);

  const loadData = async (phone: string) => {
    // ПОЛНАЯ очистка старых данных перед загрузкой
    setLoans([]);
    setPayments([]);
    setDeals([]);
    setClientName('');
    setClientFirstName('');
    setClientLastName('');
    setClientMiddleName('');
    setClientPhone('');
    setClientEmail('');
    setContactId('');
    
    const result = await fetchAmoCRMData(phone);
    
    if (result) {
      setClientName(result.clientData.name);
      setClientFirstName(result.clientData.first_name);
      setClientLastName(result.clientData.last_name);
      setClientMiddleName(result.clientData.middle_name);
      setClientGender(result.clientData.gender as 'male' | 'female');
      setClientPhone(result.clientData.phone);
      setClientEmail(result.clientData.email);
      setContactId(result.clientData.id);
      
      // Устанавливаем ТОЛЬКО полученные сделки
      console.log(`🔍 Загружено ${result.deals.length} заявок для телефона ${phone}`);
      console.log('📋 Список заявок:', result.deals.map(d => ({ id: d.id, name: d.name, status: d.status_name })));
      
      setDeals(result.deals);
      setLoans(result.deals);
      setPayments([]);
      
      setNotifications(prev => {
        const welcomeNotif = prev.find(n => n.id.startsWith('welcome-'));
        if (welcomeNotif) {
          return [welcomeNotif, ...result.notifications];
        }
        return result.notifications;
      });
      
      setLastUpdate(new Date());
    } else {
      // Если данных нет, оставляем пустые массивы
      setLoans([]);
      setPayments([]);
      setDeals([]);
      setNotifications([]);
    }
  };

  const handleLogin = (phone: string, name?: string) => {
    login(phone, name);
  };

  const handleLogout = () => {
    authLogout();
    setLoans([]);
    setPayments([]);
    setNotifications([]);
    setDeals([]);
    setClientName('');
    setClientFirstName('');
    setClientLastName('');
    setClientMiddleName('');
    setClientGender('male');
    setClientPhone('');
    setClientEmail('');
    setContactId('');
    setLastUpdate(null);
  };

  const refreshData = async () => {
    if (!userPhone) return;
    await loadData(userPhone);
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
        <WelcomeBanner clientName={clientName} />
        <ErrorBanner error={error} />
        <LoadingBanner loading={loading} />
        
        <DashboardTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          unreadMessagesCount={unreadMessagesCount}
          deals={deals}
          clientPhone={clientPhone}
          contactId={contactId}
          clientName={clientName}
          clientFirstName={clientFirstName}
          clientLastName={clientLastName}
          clientMiddleName={clientMiddleName}
          clientGender={clientGender}
          clientEmail={clientEmail}
          onApplicationSubmit={() => loadData(userPhone)}
          onMessagesUpdate={(count) => {
            if (activeTab !== 'support') {
              setUnreadMessagesCount(prev => prev + count);
            }
          }}
        />
      </div>
    </div>
  );
};

export default Index;