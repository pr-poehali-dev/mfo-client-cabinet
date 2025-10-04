import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import Header from '@/components/dashboard/Header';
import ProfileTab from '@/components/dashboard/ProfileTab';
import DealsTab from '@/components/dashboard/DealsTab';
import LoginPage from '@/components/auth/LoginPage';
import { Loan, Payment, Notification, Deal, Document } from '@/components/dashboard/types';
import DocumentsTab from '@/components/dashboard/DocumentsTab';
import funcUrls from '@/../backend/func2url.json';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userPhone, setUserPhone] = useState('');
  const [activeTab, setActiveTab] = useState('applications');
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [clientName, setClientName] = useState('');
  const [clientFirstName, setClientFirstName] = useState('');
  const [clientLastName, setClientLastName] = useState('');
  const [clientMiddleName, setClientMiddleName] = useState('');
  const [clientGender, setClientGender] = useState<'male' | 'female'>('male');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [clientLimit, setClientLimit] = useState<{
    max_loan_amount: number;
    current_debt: number;
    available_limit: number;
    credit_rating: string;
    is_blocked: boolean;
  } | null>(null);

  const fetchAmoCRMData = async (phone: string) => {
    try {
      setLoading(true);
      setError('');
      
      const cleanPhone = phone.replace(/\D/g, '');
      
      const response = await fetch(
        `${funcUrls['amocrm-sync']}?phone=${cleanPhone}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: 'Сервис временно недоступен' };
        }
        
        if (response.status === 401) {
          setError('⚠️ Токен AmoCRM устарел. Обновите секрет ACCESS_TOKEN в настройках проекта');
        } else if (response.status === 402) {
          setError('⚠️ AmoCRM интеграция требует оплаты. Свяжитесь с поддержкой для активации.');
        } else if (response.status === 500 && errorData.message?.includes('credentials')) {
          setError('Настройте AmoCRM: добавьте AMOCRM_DOMAIN и ACCESS_TOKEN в секреты проекта');
        } else if (response.status === 404) {
          setError('Клиент не найден в AmoCRM. Проверьте номер телефона в системе');
        } else {
          setError(errorData.error || 'Ошибка загрузки данных из AmoCRM');
        }
        setLoans([]);
        setPayments([]);
        setDeals([]);
        setNotifications([]);
        return;
      }
      
      const data = await response.json();
      
      setClientName(data.name || 'Клиент');
      setClientFirstName(data.first_name || '');
      setClientLastName(data.last_name || '');
      setClientMiddleName(data.middle_name || '');
      setClientGender(data.gender || 'male');
      setClientPhone(data.phone || cleanPhone);
      setClientEmail(data.email || '');
      
      const uniqueDeals = Array.from(
        new Map((data.deals || []).map((deal: Deal) => [deal.id, deal])).values()
      );
      const uniqueLoans = Array.from(
        new Map((data.loans || []).map((loan: Loan) => [loan.id, loan])).values()
      );
      const uniquePayments = Array.from(
        new Map((data.payments || []).map((payment: Payment) => [payment.id, payment])).values()
      );
      
      setLoans(uniqueLoans);
      setPayments(uniquePayments);
      setDeals(uniqueDeals);
      setDocuments(data.documents || []);
      setNotifications(data.notifications || []);
      setLastUpdate(new Date());
      
      const currentDebt = uniqueLoans.reduce((sum: number, loan: Loan) => 
        sum + (loan.status === 'active' ? (loan.amount - loan.paid) : 0), 0
      );
      
      setClientLimit({
        max_loan_amount: 100000,
        current_debt: currentDebt,
        available_limit: 100000 - currentDebt,
        credit_rating: currentDebt < 50000 ? 'Хороший' : 'Средний',
        is_blocked: false
      });
      
    } catch (err) {
      console.error('AmoCRM sync error:', err);
      setError(`Не удалось подключиться к AmoCRM. Проверьте подключение к интернету или попробуйте позже. Ошибка: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
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
    setDocuments([]);
    setClientName('');
    setClientFirstName('');
    setClientLastName('');
    setClientMiddleName('');
    setClientGender('male');
    setClientPhone('');
    setClientEmail('');
    setClientLimit(null);
    setError('');
    setLastUpdate(null);
  };

  const refreshData = async () => {
    if (!userPhone) return;
    
    setLoading(true);
    setError('');
    
    try {
      const cleanPhone = userPhone.replace(/\D/g, '');
      
      const response = await fetch(
        `${funcUrls['amocrm-sync']}?phone=${cleanPhone}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: 'Сервис временно недоступен' };
        }
        
        if (response.status === 401) {
          setError('⚠️ Токен AmoCRM устарел. Обновите секрет ACCESS_TOKEN в настройках проекта');
        } else if (response.status === 402) {
          setError('⚠️ AmoCRM интеграция требует оплаты. Свяжитесь с поддержкой для активации.');
        } else if (response.status === 500 && errorData.message?.includes('credentials')) {
          setError('Настройте AmoCRM: добавьте AMOCRM_DOMAIN и ACCESS_TOKEN в секреты проекта');
        } else if (response.status === 404) {
          setError('Клиент не найден в AmoCRM. Проверьте номер телефона в системе');
        } else {
          setError(errorData.error || 'Ошибка загрузки данных из AmoCRM');
        }
        return;
      }
      
      const data = await response.json();
      
      setClientName(data.name || 'Клиент');
      setClientFirstName(data.first_name || '');
      setClientLastName(data.last_name || '');
      setClientMiddleName(data.middle_name || '');
      setClientGender(data.gender || 'male');
      setClientPhone(data.phone || cleanPhone);
      setClientEmail(data.email || '');
      
      const uniqueDeals = Array.from(
        new Map((data.deals || []).map((deal: Deal) => [deal.id, deal])).values()
      );
      const uniqueLoans = Array.from(
        new Map((data.loans || []).map((loan: Loan) => [loan.id, loan])).values()
      );
      const uniquePayments = Array.from(
        new Map((data.payments || []).map((payment: Payment) => [payment.id, payment])).values()
      );
      
      setLoans(uniqueLoans);
      setPayments(uniquePayments);
      setDeals(uniqueDeals);
      setDocuments(data.documents || []);
      setNotifications([{
        id: Date.now().toString(),
        title: 'Данные обновлены',
        message: `Загружено заявок: ${uniqueDeals.length}`,
        date: new Date().toLocaleDateString('ru-RU'),
        read: false,
        type: 'success'
      }, ...data.notifications || []]);
      setLastUpdate(new Date());
      
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
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-card/50 backdrop-blur-sm p-1 h-auto rounded-xl">
            <TabsTrigger value="applications" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary py-3 rounded-lg">
              <Icon name="FileText" size={18} />
              <span className="hidden sm:inline">Заявки</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary py-3 rounded-lg">
              <Icon name="FolderOpen" size={18} />
              <span className="hidden sm:inline">Документы</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary py-3 rounded-lg">
              <Icon name="User" size={18} />
              <span className="hidden sm:inline">Профиль</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="applications">
            <DealsTab 
              deals={deals} 
              clientPhone={clientPhone}
              onApplicationSubmit={() => fetchAmoCRMData(userPhone)}
            />
          </TabsContent>

          <TabsContent value="documents">
            <DocumentsTab 
              documents={documents} 
              clientName={clientName}
              clientPhone={clientPhone}
            />
          </TabsContent>

          <TabsContent value="profile">
            <ProfileTab 
              clientName={clientName}
              clientFirstName={clientFirstName}
              clientLastName={clientLastName}
              clientMiddleName={clientMiddleName}
              clientGender={clientGender}
              clientPhone={clientPhone}
              clientEmail={clientEmail}
              clientLimit={clientLimit || undefined}
            />
          </TabsContent>
        </Tabs>
      </div>

      <footer className="mt-16 border-t border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h3 className="text-lg font-semibold mb-2">Поддержка клиентов</h3>
              <p className="text-sm text-muted-foreground">Мы всегда на связи, если у вас возникли вопросы</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <a 
                href="mailto:support@manifesto.ru" 
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                <Icon name="Mail" size={18} className="text-primary" />
                <span className="text-sm font-medium">support@manifesto.ru</span>
              </a>
              <a 
                href="tel:+74951340801" 
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/10 hover:bg-secondary/20 transition-colors"
              >
                <Icon name="Phone" size={18} className="text-secondary" />
                <span className="text-sm font-medium">+7 (495) 134-08-01</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;