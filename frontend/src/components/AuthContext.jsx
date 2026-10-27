import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';
const Context = createContext(null);
export function AuthProvider({ children }) { const [user, setUser] = useState(null); const [loading, setLoading] = useState(true); useEffect(() => { api.get('/auth/me').then(r => setUser(r.data)).catch(() => { }).finally(() => setLoading(false)); }, []); const login = async (email, password) => { const r = await api.post('/auth/login', { email, password }); setUser(r.data); return r.data; }; const register = async (name, email, password) => { const r = await api.post('/auth/register', { name, email, password }); setUser(r.data); return r.data; }; const updateProfile = async (data) => { const r = await api.put('/auth/profile', data); setUser(r.data); return r.data; }; const logout = async () => { await api.post('/auth/logout'); setUser(null); }; return <Context.Provider value={{ user, loading, login, register, logout, updateProfile }}>{children}
</Context.Provider>; }
export const useAuth = () => useContext(Context);
