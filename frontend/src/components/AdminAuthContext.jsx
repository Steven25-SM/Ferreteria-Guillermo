import React, { createContext, useContext, useEffect, useState } from 'react';
import { adminApi } from '../lib/adminApi';

const AdminAuthContext = createContext(null);
function readAdmin() {
  try {
    if (!sessionStorage.getItem('fg_admin_token')) return null;
    return JSON.parse(sessionStorage.getItem('fg_admin_user') || 'null');
  } catch {
    return null;
  }
}

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(readAdmin);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const handleExpired = () => {
      setAdmin(null);
      setExpired(true);
    };
    window.addEventListener('fg:admin-session-expired', handleExpired);
    return () => window.removeEventListener('fg:admin-session-expired', handleExpired);
  }, []);

  const loginAdmin = async (email, password) => {
    const { data } = await adminApi.post('/admin-auth/login', { email, password });
    sessionStorage.setItem('fg_admin_token', data.token);
    const account = { name: data.name, email: data.email, role: data.role };
    sessionStorage.setItem('fg_admin_user', JSON.stringify(account));
    setExpired(false);
    setAdmin(account);
    return account;
  };

  const logoutAdmin = async () => {
    try {
      await adminApi.post('/admin-auth/logout');
    } finally {
      sessionStorage.removeItem('fg_admin_token');
      sessionStorage.removeItem('fg_admin_user');
      setExpired(false);
      setAdmin(null);
    }
  };

  return (
    <AdminAuthContext.Provider value={{ admin, expired, loginAdmin, logoutAdmin }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
