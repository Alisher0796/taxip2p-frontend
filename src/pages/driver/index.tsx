import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/entities/user/model/store';
import { RequestsListPage } from '@/pages/DriverPages/RequestsListPage';

export default function DriverPage() {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    if (!user || user.role !== 'driver') {
      navigate('/');
    }
  }, [user, navigate]);

  return <RequestsListPage />;
}
