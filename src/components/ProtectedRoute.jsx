import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import { PageState } from './ui';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useApp();
  const location = useLocation();

  if (loading) {
    return <PageState text="Loading..." />;
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  return children;
}
