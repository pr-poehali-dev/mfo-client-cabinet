import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const useAmoCRMUpdates = (clientPhone: string) => {
  const queryClient = useQueryClient();
  
  const checkForUpdates = useCallback(async () => {
    try {
      const lastCheck = localStorage.getItem(`amocrm_last_check_${clientPhone}`);
      const now = Date.now();
      
      if (lastCheck && now - parseInt(lastCheck) < 10000) {
        return;
      }
      
      localStorage.setItem(`amocrm_last_check_${clientPhone}`, now.toString());
      
      const hasUpdate = localStorage.getItem(`amocrm_update_${clientPhone}`);
      
      if (hasUpdate) {
        console.log('[UPDATE] Обнаружено изменение в AmoCRM, обновляю данные...');
        
        await queryClient.invalidateQueries({ queryKey: ['amocrm-client'] });
        
        localStorage.removeItem(`amocrm_update_${clientPhone}`);
        
        const notification = new Notification('Обновление данных', {
          body: 'Статус вашей заявки изменился',
          icon: '/favicon.ico'
        });
        
        setTimeout(() => notification.close(), 5000);
      }
    } catch (error) {
      console.error('[UPDATE] Ошибка проверки обновлений:', error);
    }
  }, [clientPhone, queryClient]);
  
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    const interval = setInterval(checkForUpdates, 10000);
    
    checkForUpdates();
    
    return () => clearInterval(interval);
  }, [checkForUpdates]);
};
