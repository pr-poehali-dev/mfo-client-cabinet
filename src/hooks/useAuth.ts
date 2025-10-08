import { useState, useEffect } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  userPhone: string;
  clientName: string;
}

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

  const login = (phone: string, name?: string) => {
    setUserPhone(phone);
    setIsAuthenticated(true);
    localStorage.setItem('userPhone', phone);
    if (name) {
      setClientName(name);
      localStorage.setItem('clientName', name);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserPhone('');
    setClientName('');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('clientName');
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
