import { useState } from 'react';
import { Deal, AppNotification } from '@/components/dashboard/types';

export const useAmoCRM = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkPaymentDeadlines = (dealsData: Deal[]): AppNotification[] => {
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
    
    newNotifications.sort((a, b) => {
      const priorityOrder = { 'warning': 0, 'info': 1, 'success': 2 };
      return priorityOrder[a.type] - priorityOrder[b.type];
    });
    
    return newNotifications;
  };

  const mapLeadData = (lead: any): Deal => {
    const customFields = lead.custom_fields_values || [];
    const loanTermField = customFields.find((f: any) => 
      f.field_name === 'Срок займа' || f.field_code === 'LOAN_TERM'
    );
    const loanTerm = loanTermField?.values?.[0]?.value || '30';
    const termDays = parseInt(String(loanTerm).replace(/\D/g, '')) || 30;
    
    const dealData: any = {
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
    
    if (lead.overdue_days !== undefined) {
      dealData.overdue_days = lead.overdue_days;
    }
    if (lead.penalty !== undefined) {
      dealData.penalty = lead.penalty;
    }
    
    return dealData;
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
          return null;
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
        return null;
      }
      
      const responseText = await response.text();
      if (!responseText) {
        setError('Пустой ответ от сервера');
        return null;
      }
      
      const data = JSON.parse(responseText);
      
      if (!data || !data.id) {
        setError('Получены некорректные данные от сервера');
        console.error('Invalid data structure:', data);
        return null;
      }
      
      const mappedLeads = (data.leads || []).map(mapLeadData);
      
      console.log(`Loaded ${mappedLeads.length} deals for ${data.name}`);
      console.log('Статусы всех заявок:', mappedLeads.map(d => ({ id: d.id, status: d.status_name })));
      console.log('Полные данные заявок:', mappedLeads);
      
      const paymentNotifications = checkPaymentDeadlines(mappedLeads);
      
      return {
        clientData: {
          id: String(data.id || ''),
          name: data.name || 'Клиент',
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          middle_name: data.middle_name || '',
          gender: data.gender || 'male',
          phone: data.phone || cleanPhone,
          email: data.email || ''
        },
        deals: mappedLeads,
        notifications: paymentNotifications
      };
      
    } catch (err) {
      console.error('AmoCRM sync error:', err);
      setError('Не удалось подключиться к AmoCRM');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    fetchAmoCRMData,
    checkPaymentDeadlines
  };
};