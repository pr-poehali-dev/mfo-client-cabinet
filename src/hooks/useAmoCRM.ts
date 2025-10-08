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
      
      const dealsResponse = await fetch(
        `https://functions.poehali.dev/2fbf226c-26a9-4dd5-966d-b851b1be5d94?phone=${cleanPhone}`
      );
      
      if (!dealsResponse.ok) {
        setError('Ошибка загрузки сделок');
        return null;
      }
      
      const dealsData = await dealsResponse.json();
      const deals = (dealsData.deals || []).map((deal: any) => ({
        id: String(deal.id),
        name: deal.name || 'Заявка',
        status: deal.status,
        status_id: deal.status_id,
        status_name: deal.status_name || 'На рассмотрении',
        status_color: deal.status_color || '#cccccc',
        pipeline_id: deal.pipeline_id,
        pipeline_name: deal.pipeline_name || 'Основная воронка',
        price: deal.price || 0,
        amount: deal.price || 0,
        term: deal.custom_fields?.loan_term || 30,
        created_at: deal.created_at ? new Date(deal.created_at).toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }) : new Date().toLocaleDateString('ru-RU'),
        updated_at: deal.updated_at ? new Date(deal.updated_at).toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }) : new Date().toLocaleDateString('ru-RU'),
        date: deal.created_at ? new Date(deal.created_at).toLocaleDateString('ru-RU') : new Date().toLocaleDateString('ru-RU'),
        description: deal.name || 'Заявка на займ',
        responsible_user_id: deal.responsible_user_id,
        custom_fields: deal.custom_fields || {},
        custom_fields_values: []
      }));
      
      // Данные клиента получаем из localStorage (установлены при авторизации)
      const clientData = {
        id: '',
        name: localStorage.getItem('clientName') || 'Клиент',
        first_name: '',
        last_name: '',
        middle_name: '',
        gender: 'male' as const,
        phone: cleanPhone,
        email: ''
      };
      
      console.log(`Loaded ${deals.length} deals for ${clientData.name}`);
      console.log('Статусы всех заявок:', deals.map(d => ({ id: d.id, status: d.status_name })));
      console.log('Полные данные заявок:', deals);
      
      const paymentNotifications = checkPaymentDeadlines(deals);
      
      return {
        clientData,
        deals,
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