import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import Header from '@/components/dashboard/Header';
import ProfileTab from '@/components/dashboard/ProfileTab';
import DealsTab from '@/components/dashboard/DealsTab';
import LoginPage from '@/components/auth/LoginPage';
import { Loan, Payment, Notification, Deal, Document } from '@/components/dashboard/types';
import DocumentsTab from '@/components/dashboard/DocumentsTab';

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

  const fetchAmoCRMData = async (phone: string) => {
    try {
      setLoading(true);
      setError('');
      
      const cleanPhone = phone.replace(/\D/g, '');
      
      const response = await fetch(
        `https://functions.poehali.dev/0c680166-1e97-4c5e-8c8f-5f2cd1c88850?phone=${cleanPhone}`
      );
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          setError('Ошибка сервера. Попробуйте позже');
          setLoans([]);
          setPayments([]);
          setDeals([]);
          setNotifications([]);
          return;
        }
        
        if (response.status === 401) {
          setError('⚠️ Токен AmoCRM устарел. Обновите секрет ACCESS_TOKEN в настройках проекта');
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
      
      const responseText = await response.text();
      if (!responseText) {
        setError('Пустой ответ от сервера');
        setLoans([]);
        setPayments([]);
        setDeals([]);
        setNotifications([]);
        return;
      }
      
      console.log('Response from server:', responseText);
      const data = JSON.parse(responseText);
      console.log('Parsed data:', data);
      
      setClientName(data.name || 'Клиент');
      setClientFirstName(data.first_name || '');
      setClientLastName(data.last_name || '');
      setClientMiddleName(data.middle_name || '');
      setClientGender(data.gender || 'male');
      setClientPhone(data.phone || cleanPhone);
      setClientEmail(data.email || '');
      
      const mappedLeads = (data.leads || []).map((lead: any) => ({
        id: lead.id,
        name: lead.name || 'Заявка',
        status: lead.status_id === 142 ? 'approved' : 
               lead.status_id === 143 ? 'rejected' : 'pending',
        statusLabel: lead.status_id === 142 ? 'Одобрена' : 
                    lead.status_id === 143 ? 'Отклонена' : 'На рассмотрении',
        amount: lead.price || 0,
        term: 30,
        date: lead.created_at ? new Date(lead.created_at * 1000).toLocaleDateString('ru-RU') : new Date().toLocaleDateString('ru-RU'),
        description: lead.name || 'Заявка на займ'
      }));
      
      setDeals(mappedLeads);
      setLoans(mappedLeads);
      setPayments([]);
      setDocuments([]);
      setNotifications([]);
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
    const isNewRegistration = localStorage.getItem('newRegistration');
    
    if (savedPhone) {
      setUserPhone(savedPhone);
      setIsAuthenticated(true);
      fetchAmoCRMData(savedPhone);
      
      if (isNewRegistration === 'true') {
        setNotifications([{
          id: 'welcome-' + Date.now(),
          title: '🎉 Добро пожаловать!',
          message: 'Ваша заявка успешно принята в обработку. Мы свяжемся с вами в ближайшее время.',
          date: new Date().toLocaleDateString('ru-RU'),
          read: false,
          type: 'success'
        }]);
        localStorage.removeItem('newRegistration');
      }
      
      const intervalId = setInterval(() => {
        fetchAmoCRMData(savedPhone);
      }, 15 * 1000);
      
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
    setDocuments([]);
    setClientName('');
    setClientFirstName('');
    setClientLastName('');
    setClientMiddleName('');
    setClientGender('male');
    setClientPhone('');
    setClientEmail('');
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
        `https://functions.poehali.dev/0c680166-1e97-4c5e-8c8f-5f2cd1c88850?phone=${cleanPhone}`
      );
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          setError('Ошибка сервера. Попробуйте позже');
          return;
        }
        
        if (response.status === 401) {
          setError('⚠️ Токен AmoCRM устарел. Обновите секрет ACCESS_TOKEN в настройках проекта');
        } else if (response.status === 500 && errorData.message?.includes('credentials')) {
          setError('Настройте AmoCRM: добавьте AMOCRM_DOMAIN и ACCESS_TOKEN в секреты проекта');
        } else if (response.status === 404) {
          setError('Клиент не найден в AmoCRM. Проверьте номер телефона в системе');
        } else {
          setError(errorData.error || 'Ошибка загрузки данных из AmoCRM');
        }
        return;
      }
      
      const responseText = await response.text();
      if (!responseText) {
        setError('Пустой ответ от сервера');
        return;
      }
      
      const data = JSON.parse(responseText);
      
      setClientName(data.name || 'Клиент');
      setClientFirstName(data.first_name || '');
      setClientLastName(data.last_name || '');
      setClientMiddleName(data.middle_name || '');
      setClientGender(data.gender || 'male');
      setClientPhone(data.phone || cleanPhone);
      setClientEmail(data.email || '');
      
      const mappedLeads = (data.leads || []).map((lead: any) => ({
        id: lead.id,
        name: lead.name || 'Заявка',
        status: lead.status_id === 142 ? 'approved' : 
               lead.status_id === 143 ? 'rejected' : 'pending',
        statusLabel: lead.status_id === 142 ? 'Одобрена' : 
                    lead.status_id === 143 ? 'Отклонена' : 'На рассмотрении',
        amount: lead.price || 0,
        term: 30,
        date: lead.created_at ? new Date(lead.created_at * 1000).toLocaleDateString('ru-RU') : new Date().toLocaleDateString('ru-RU'),
        description: lead.name || 'Заявка на займ'
      }));
      
      setDeals(mappedLeads);
      setLoans(mappedLeads);
      setPayments([]);
      setDocuments([]);
      setNotifications([{
        id: Date.now().toString(),
        title: 'Данные обновлены',
        message: `Загружено заявок: ${mappedLeads.length}`,
        date: new Date().toLocaleDateString('ru-RU'),
        read: false,
        type: 'success'
      }]);
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
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;