import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { LoadingState } from '@/components/loading-state';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      login(token).then(() => navigate('/app/dashboard', { replace: true }));
    } else {
      navigate('/login', { replace: true });
    }
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingState rows={1} />
    </div>
  );
}
