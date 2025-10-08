import { useState, useEffect } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  userPhone: string;
  clientName: string;
}

const CLIENT_AUTH_URL = 'https://functions.poehali.dev/331ab23f-a941-49aa-947a-eabaed896d8e';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userPhone, setUserPhone] = useState('');
  const [clientName, setClientName] = useState('');

  useEffect(() => {
    const savedPhone = localStorage.getItem('userPhone');
    const savedName = localStorage.getItem('clientName');
    
    if (savedPhone) {
      setUserPhone(savedPhone);
      setIsAuthenticated(true);
      if (savedName) {
        setClientName(savedName);
      }
    }
  }, []);

  const login = async (phone: string, name?: string) => {
    try {
      // Очищаем все старые данные перед входом
      localStorage.clear();
      
      const response = await fetch(CLIENT_AUTH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone, name: name || '' })
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      if (data.success) {
        const clientData = data.client;
        setUserPhone(clientData.phone);
        setIsAuthenticated(true);
        setClientName(clientData.name);
        
        localStorage.setItem('userPhone', clientData.phone);
        localStorage.setItem('clientName', clientData.name);
        
        if (data.isNewRegistration) {
          localStorage.setItem('newRegistration', 'true');
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserPhone('');
    setClientName('');
    // Полная очистка всех данных
    localStorage.clear();
  };

  const checkNewRegistration = () => {
    return localStorage.getItem('newRegistration') === 'true';
  };

  const clearNewRegistration = () => {
    localStorage.removeItem('newRegistration');
  };

  return {
    isAuthenticated,
    userPhone,
    clientName,
    login,
    logout,
    checkNewRegistration,
    clearNewRegistration
  };
};