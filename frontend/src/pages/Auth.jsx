import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { useAdminAuth } from '../components/AdminAuthContext';
import { getError } from '../lib/api';

export default function Auth({ admin = false, register = false }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const auth = useAuth();
  const { loginAdmin } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);

    try {
      if (admin) {
        await loginAdmin(email, password);
        navigate('/admin');
      } else {
        if (register) await auth.register(name, email, password);
        else await auth.login(email, password);
        navigate('/');
      }
    } catch (ex) {
      setError(getError(ex));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-[#fffaf5] min-h-[calc(100vh-86px)] flex justify-center items-center py-16 px-5">
      <div className="w-full max-w-[460px] bg-white border border-slate-100 rounded-3xl shadow-soft p-8 md:p-10">
        <img
          src="/logo-ferreteria-guillermo.png"
          alt="Ferretería Guillermo"
          className="h-20 w-auto object-contain"
        />

        <p className="text-teal text-[11px] font-extrabold tracking-[.2em] uppercase mt-7">
          {admin ? 'Acceso administrativo' : 'Bienvenido a Ferretería Guillermo'}
        </p>

        <h1 className="font-display text-3xl font-extrabold tracking-tight mt-2">
          {admin ? 'Panel administrativo' : register ? 'Crear una cuenta' : 'Iniciar sesión'}
        </h1>

        <p className="text-sm text-slate-500 mt-3">
          {admin
            ? 'Acceso exclusivo para personal autorizado.'
            : 'Gestiona tus pedidos y encuentra productos para tus proyectos.'}
        </p>

        {admin && location.state?.sessionExpired && (
          <div role="alert" className="mt-6 rounded-lg bg-orange-50 p-3 text-sm text-orange-800">
            La sesión administrativa terminó porque se reinició el servidor o venció tu acceso. Inicia sesión nuevamente.
          </div>
        )}

        {error && <div className="mt-6 text-sm rounded-lg bg-red-50 text-red-600 p-3">{error}</div>}

        <form onSubmit={submit} className="space-y-4 mt-7">
          {register && (
            <label className="block text-xs font-bold">
              Nombre completo
              <input className="input mt-2" required value={name} onChange={e => setName(e.target.value)} />
            </label>
          )}

          <label className="block text-xs font-bold">
            Correo electrónico
            <input
              className="input mt-2"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </label>

          <label className="block text-xs font-bold">
            Contraseña
            <input
              className="input mt-2"
              type="password"
              minLength={8}
              autoComplete={register ? 'new-password' : 'current-password'}
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </label>

          <button disabled={busy} className="btn w-full mt-3 !py-3.5">
            {busy ? 'Procesando...' : register ? 'Crear cuenta' : 'Ingresar'}
          </button>
        </form>

        {!admin && (
          <p className="mt-6 text-sm text-slate-500 text-center">
            {register ? '¿Ya tienes una cuenta?' : '¿Aún no tienes cuenta?'}{' '}
            <Link className="font-bold text-teal" to={register ? '/login' : '/registro'}>
              {register ? 'Iniciar sesión' : 'Regístrate'}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
