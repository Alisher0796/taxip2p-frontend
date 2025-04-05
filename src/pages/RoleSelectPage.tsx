import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/Button/Button';
import { useUserStore } from '@/entities/user/model/store';
import { Role } from '@/shared/types/common';
import { createHttp } from '@/shared/api/http';

const RoleSelectPage = () => {
  const navigate = useNavigate();
  const setRole = useUserStore((state) => state.setRole);

  const handleRoleSelect = async (role: Role) => {
    console.log('Selecting role:', role);
    try {
      console.log('Sending request to update profile...');
      const updatedProfile = await createHttp()('/profile', { method: 'PUT', body: { role } });
      console.log('Profile updated:', updatedProfile);
      
      console.log('Setting role in store...');
      setRole(role);
      
      const nextRoute = role === 'passenger' ? '/passenger/create' : '/driver/requests';
      console.log('Navigating to:', nextRoute);
      navigate(nextRoute);
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="mb-8 text-2xl font-bold">Выберите роль</h1>
      
      <div className="flex w-full max-w-xs flex-col gap-4">
        <Button
          size="lg"
          onClick={() => handleRoleSelect('passenger')}
          className="w-full"
        >
          Я пассажир
        </Button>
        
        <Button
          variant="secondary"
          size="lg"
          onClick={() => handleRoleSelect('driver')}
          className="w-full"
        >
          Я водитель
        </Button>
      </div>
    </div>
  );
};

export default RoleSelectPage;
