import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../TelegramProvider/hooks';
import { api } from '@/shared/api/http';
import { LoadingScreen } from '@/shared/ui';
import type { Role } from '@/shared/types/common';
import type { Profile } from '@/shared/types/api';

interface RouteGuardProps {
  children: ReactNode;
  requiredRole?: Role;
}

type AccessCheckResult = {
  isAllowed: boolean;
  profile: Profile | null;
  error?: string;
};

export function RouteGuard({ children, requiredRole }: RouteGuardProps) {
  const { isReady, haptic } = useTelegram();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isReady) return;

    const checkAccess = async (): Promise<AccessCheckResult> => {
      try {
        const profile = await api.getProfile();

        // No role assigned
        if (!profile.role) {
          return {
            isAllowed: false,
            profile,
            error: 'No role assigned',
          };
        }

        // Role mismatch
        if (requiredRole && profile.role !== requiredRole) {
          return {
            isAllowed: false,
            profile,
            error: `Access denied: Required role '${requiredRole}', but current role is '${profile.role}'`,
          };
        }

        // Access granted
        return {
          isAllowed: true,
          profile,
        };
      } catch (error) {
        return {
          isAllowed: false,
          profile: null,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    };

    checkAccess().then((result) => {
      if (!result.isAllowed) {
        console.error('Access check failed:', result.error);
        haptic?.notification('error');
        navigate('/', { replace: true });
      }
      setIsChecking(false);
    });
  }, [isReady, requiredRole, navigate, haptic]);

  if (!isReady || isChecking) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
