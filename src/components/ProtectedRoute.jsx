import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../hooks/useApp';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useApp();
  const location = useLocation();

  if (loading) {
    return <p style={{ padding: 'var(--page-padding)', color: 'var(--color-text-secondary)' }}>Loading...</p>;
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  return children;
}
