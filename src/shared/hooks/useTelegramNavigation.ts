import { useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTelegram } from '@/app/providers/TelegramProvider';

type NavigationHistoryEntry = {
  pathname: string;
  timestamp: number;
};

export function useTelegramNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { webApp, isReady } = useTelegram();
  const historyRef = useRef<NavigationHistoryEntry[]>([]);

  const canGoBack = useCallback(() => {
    return historyRef.current.length > 1;
  }, []);

  const handleBackClick = useCallback(() => {
    if (canGoBack()) {
      navigate(-1);
      historyRef.current.pop();
    } else {
      webApp?.close();
    }
  }, [navigate, webApp, canGoBack]);

  useEffect(() => {
    if (!isReady || !webApp?.BackButton) {
      console.warn('Telegram WebApp BackButton is not available');
      return;
    }

    // Update navigation history
    historyRef.current = [
      ...historyRef.current,
      { pathname: location.pathname, timestamp: Date.now() }
    ];

    // Show/hide back button based on history
    if (canGoBack()) {
      webApp.BackButton.show();
    } else {
      webApp.BackButton.hide();
    }

    webApp.BackButton.onClick(handleBackClick);

    return () => {
      webApp.BackButton.onClick(handleBackClick);
    };
  }, [location.pathname, webApp, isReady, handleBackClick, canGoBack]);

  return {
    canGoBack,
    goBack: handleBackClick,
    currentPath: location.pathname,
  };
}
