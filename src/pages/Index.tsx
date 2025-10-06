import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import Header from '@/components/dashboard/Header';
import ProfileTab from '@/components/dashboard/ProfileTab';
import DealsTab from '@/components/dashboard/DealsTab';
import LoginPage from '@/components/auth/LoginPage';
import { Loan, Payment, AppNotification, Deal, Document } from '@/components/dashboard/types';
import DocumentsTab from '@/components/dashboard/DocumentsTab';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userPhone, setUserPhone] = useState('');
  const [activeTab, setActiveTab] = useState('applications');
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
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

  const checkPaymentDeadlines = (dealsData: Deal[]) => {
    const newNotifications: AppNotification[] = [];
    
    dealsData.forEach(deal => {
      if (deal.status_name === 'Заявка одобрена') {
        const loanTermField = deal.custom_fields?.find(f => 
          f.field_name === 'Срок займа' || f.field_code === 'LOAN_TERM'
        )?.values?.[0]?.value || '30';
        
        const loanTermDays = parseInt(String(loanTermField).replace(/\D/g, '')) || 30;
        
        const createdDate = new Date(deal.created_at.split(' ')[0].split('.').reverse().join('-'));
        const dueDate = new Date(createdDate);
        dueDate.setDate(dueDate.getDate() + loanTermDays);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);
        
        const diffTime = dueDate.getTime() - today.getTime();
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (daysLeft <= 0) {
          newNotifications.push({
            id: `overdue-${deal.id}`,
            title: '🚨 Просроченный платеж!',
            message: `Займ на сумму ${deal.price.toLocaleString('ru-RU')} ₽ просрочен. Пожалуйста, погасите задолженность как можно скорее.`,
            date: new Date().toLocaleDateString('ru-RU'),
            read: false,
            type: 'warning'
          });
        } else if (daysLeft === 1) {
          newNotifications.push({
            id: `urgent-${deal.id}`,
            title: '⚠️ Срочно! Завтра выплата',
            message: `Завтра последний день выплаты займа на сумму ${deal.price.toLocaleString('ru-RU')} ₽. Не забудьте погасить!`,
            date: new Date().toLocaleDateString('ru-RU'),
            read: false,
            type: 'warning'
          });
        } else if (daysLeft <= 3) {
          newNotifications.push({
            id: `soon-${deal.id}`,
            title: '⏰ Выплата через 3 дня',
            message: `Осталось ${daysLeft} дня до выплаты займа на сумму ${deal.price.toLocaleString('ru-RU')} ₽. Подготовьте средства.`,
            date: new Date().toLocaleDateString('ru-RU'),
            read: false,
            type: 'warning'
          });
        } else if (daysLeft <= 7) {
          newNotifications.push({
            id: `reminder-${deal.id}`,
            title: '📅 Напоминание о выплате',
            message: `Осталось ${daysLeft} дней до выплаты займа на сумму ${deal.price.toLocaleString('ru-RU')} ₽.`,
            date: new Date().toLocaleDateString('ru-RU'),
            read: false,
            type: 'info'
          });
        }
      }
    });
    
    return newNotifications;
  };

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
        
        console.error('API Error:', response.status, errorData);
        
        if (response.status === 500) {
          if (errorData.error?.includes('access token')) {
            setError('⚠️ Ошибка подключения к AmoCRM. Токен авторизации устарел. Обновите секрет AMOCRM_REFRESH_TOKEN');
          } else if (errorData.error?.includes('credentials')) {
            setError('⚠️ AmoCRM не настроен. Проверьте секреты: AMOCRM_DOMAIN, AMOCRM_CLIENT_ID, AMOCRM_CLIENT_SECRET, AMOCRM_REFRESH_TOKEN');
          } else {
            setError(`Ошибка сервера: ${errorData.error || 'Неизвестная ошибка'}`);
          }
        } else if (response.status === 404) {
          setError('Клиент не найден в AmoCRM. Проверьте номер телефона');
        } else if (response.status === 401) {
          setError('⚠️ Ошибка авторизации AmoCRM');
        } else {
          setError(errorData.error || 'Ошибка загрузки данных');
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
      
      const data = JSON.parse(responseText);
      
      if (!data || !data.id) {
        setError('Получены некорректные данные от сервера');
        console.error('Invalid data structure:', data);
        setLoans([]);
        setPayments([]);
        setDeals([]);
        setNotifications([]);
        return;
      }
      
      setClientName(data.name || 'Клиент');
      setClientFirstName(data.first_name || '');
      setClientLastName(data.last_name || '');
      setClientMiddleName(data.middle_name || '');
      setClientGender(data.gender || 'male');
      setClientPhone(data.phone || cleanPhone);
      setClientEmail(data.email || '');
      
      const mappedLeads = (data.leads || []).map((lead: any) => {
        const customFields = lead.custom_fields_values || [];
        const loanTermField = customFields.find((f: any) => 
          f.field_name === 'Срок займа' || f.field_code === 'LOAN_TERM'
        );
        const loanTerm = loanTermField?.values?.[0]?.value || '30';
        const termDays = parseInt(String(loanTerm).replace(/\D/g, '')) || 30;
        
        return {
          id: lead.id,
          name: lead.name || 'Заявка',
          status: lead.status_name,
          status_id: lead.status_id,
          status_name: lead.status_name || 'На рассмотрении',
          status_color: lead.status_color || '#cccccc',
          pipeline_id: lead.pipeline_id,
          pipeline_name: lead.pipeline_name || 'Основная воронка',
          price: lead.price || 0,
          amount: lead.price || 0,
          term: termDays,
          created_at: lead.created_at ? new Date(lead.created_at * 1000).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }) : new Date().toLocaleDateString('ru-RU'),
          updated_at: lead.updated_at ? new Date(lead.updated_at * 1000).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }) : new Date().toLocaleDateString('ru-RU'),
          date: lead.created_at ? new Date(lead.created_at * 1000).toLocaleDateString('ru-RU') : new Date().toLocaleDateString('ru-RU'),
          description: lead.name || 'Заявка на займ',
          responsible_user_id: lead.responsible_user_id,
          custom_fields: customFields,
          custom_fields_values: customFields
        };
      });
      
      console.log(`Loaded ${mappedLeads.length} deals for ${data.name}`);
      
      const paymentNotifications = checkPaymentDeadlines(mappedLeads);
      
      setDeals(mappedLeads);
      setLoans(mappedLeads);
      setPayments([]);
      setDocuments([]);
      setNotifications(paymentNotifications);
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
    const savedName = localStorage.getItem('clientName');
    const isNewRegistration = localStorage.getItem('newRegistration');
    
    if (savedPhone) {
      setUserPhone(savedPhone);
      setIsAuthenticated(true);
      if (savedName) {
        setClientName(savedName);
      }
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
      

    }
  }, []);

  const handleLogin = (phone: string, name?: string) => {
    setUserPhone(phone);
    setIsAuthenticated(true);
    localStorage.setItem('userPhone', phone);
    if (name) {
      setClientName(name);
      localStorage.setItem('clientName', name);
    }
    fetchAmoCRMData(phone);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserPhone('');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('clientName');
    
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
        
        console.error('Refresh Error:', response.status, errorData);
        
        if (response.status === 500) {
          if (errorData.error?.includes('access token')) {
            setError('⚠️ Ошибка подключения к AmoCRM. Токен авторизации устарел. Обновите секрет AMOCRM_REFRESH_TOKEN');
          } else if (errorData.error?.includes('credentials')) {
            setError('⚠️ AmoCRM не настроен. Проверьте секреты');
          } else {
            setError(`Ошибка сервера: ${errorData.error || 'Неизвестная ошибка'}`);
          }
        } else if (response.status === 404) {
          setError('Клиент не найден в AmoCRM');
        } else {
          setError(errorData.error || 'Ошибка загрузки данных');
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
      
      const paymentNotificationsRefresh = checkPaymentDeadlines(mappedLeads);
      const refreshNotifications = [
        {
          id: Date.now().toString(),
          title: 'Данные обновлены',
          message: `Загружено заявок: ${mappedLeads.length}`,
          date: new Date().toLocaleDateString('ru-RU'),
          read: false,
          type: 'success' as const
        },
        ...paymentNotificationsRefresh
      ];
      
      setDeals(mappedLeads);
      setLoans(mappedLeads);
      setPayments([]);
      setDocuments([]);
      setNotifications(refreshNotifications);
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
        notifications={notifications}
        onRefresh={refreshData}
        onLogout={handleLogout}
      />

      <div className="container mx-auto px-4 py-8">
        {clientName && (
          <div className="mb-6 p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 rounded-xl">
            <h2 className="text-2xl font-montserrat font-bold text-white">
              Здравствуйте, {clientName.split(' ')[0]}! 👋
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Рады видеть вас в личном кабинете
            </p>
          </div>
        )}
        
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