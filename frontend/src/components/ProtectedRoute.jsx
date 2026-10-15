import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth(); const location = useLocation()
  if (loading) return <main className="auth-loading">Verificando sesión…</main>
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  return children
}
