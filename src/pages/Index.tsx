import { useState, useEffect } from 'react';
import Header from '@/components/dashboard/Header';
import LoginPage from '@/components/auth/LoginPage';
import WelcomeBanner from '@/components/dashboard/WelcomeBanner';
import ErrorBanner from '@/components/dashboard/ErrorBanner';
import LoadingBanner from '@/components/dashboard/LoadingBanner';
import DashboardTabs from '@/components/dashboard/DashboardTabs';
import { useAuth } from '@/hooks/useAuth';
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setLoading(true);
    setError(null);
    
    // Очистка данных
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
    
    setLoading(false);
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
          key={userPhone}
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