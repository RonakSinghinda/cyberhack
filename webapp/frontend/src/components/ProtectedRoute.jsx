// frontend/src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', color:'#64748b' }}>Loading…</div>;
  return user ? children : <Navigate to="/login" replace />;
}
