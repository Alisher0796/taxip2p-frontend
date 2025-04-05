import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/Button/Button';
import { Role } from '@/shared/types/common';
import { useUserStore } from '@/entities/user/model/store';
import { api } from '@/shared/api/http';

export default function HomePage() {
  const navigate = useNavigate();
  const setRole = useUserStore((state) => state.setRole);

  const handleRoleSelect = async (role: Role) => {
    try {
      await api.updateProfile({ role });
      setRole(role);
      navigate(role === 'passenger' ? '/passenger/create' : '/driver/requests');
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-4 p-4">
      <h1 className="text-2xl font-bold">Выберите роль</h1>
      <div className="flex w-full max-w-sm flex-col space-y-4">
        <Button
          variant="primary"
          className="w-full"
          onClick={() => handleRoleSelect('passenger')}
        >
          Я пассажир
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => handleRoleSelect('driver')}
        >
          Я водитель
        </Button>
      </div>
    </div>
  );
}
