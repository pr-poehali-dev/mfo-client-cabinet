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
      
      // Используем get-client-deals с правильной фильтрацией по contact_id
      const clientName = localStorage.getItem('clientName') || '';
      
      const dealsResponse = await fetch(
        `https://functions.poehali.dev/73314828-ff07-4cb4-ba82-3a329bb79b4a?phone=${cleanPhone}&full_name=${encodeURIComponent(clientName)}&t=${Date.now()}`,
        {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        }
      );
      
      if (!dealsResponse.ok) {
        setError('Ошибка загрузки сделок');
        return null;
      }
      
      const dealsData = await dealsResponse.json();
      
      // Проверяем успешность ответа от новой функции get-client-deals
      if (!dealsData.success) {
        console.error('⚠️ Ошибка от сервера:', dealsData.error);
        setError(dealsData.error || 'Ошибка загрузки данных');
        return null;
      }
      
      // Логируем отладочную информацию для диагностики
      if (dealsData.debug) {
        console.log('🔍 DEBUG INFO:', dealsData.debug);
        console.log(`📞 Contact ID: ${dealsData.debug.contact_id}`);
        console.log(`📊 Total leads from AmoCRM: ${dealsData.debug.total_leads_from_amocrm}`);
        console.log(`🔐 Filter used: ${dealsData.debug.filter_used}`);
      }
      
      // КРИТИЧЕСКАЯ ЗАЩИТА: Проверяем что сервер вернул массив заявок
      if (!Array.isArray(dealsData.deals)) {
        console.error('⚠️ Некорректный формат данных от сервера');
        setError('Ошибка загрузки данных');
        return null;
      }
      
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
      
      // Данные клиента получаем из ответа сервера
      const clientData = {
        id: dealsData.client?.id || '',
        name: dealsData.client?.name || localStorage.getItem('clientName') || 'Клиент',
        first_name: '',
        last_name: '',
        middle_name: '',
        gender: 'male' as const,
        phone: dealsData.client?.phone || cleanPhone,
        email: ''
      };
      
      console.log(`✅ Загружено ${deals.length} заявок для ${clientData.name} (ID: ${clientData.id})`);
      console.log('📋 Статусы всех заявок:', deals.map(d => ({ id: d.id, status: d.status_name })));
      console.log('🔒 Все заявки принадлежат клиенту с ID:', dealsData.client?.id);
      
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