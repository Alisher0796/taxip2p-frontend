import { useContext } from 'react';
import { TelegramContext } from '../TelegramProvider/context';

interface ErrorFallbackProps {
  error: Error;
}

export function ErrorFallback({ error }: ErrorFallbackProps) {
  const context = useContext(TelegramContext);

  const buttonStyle = {
    backgroundColor: context?.webApp?.themeParams?.button_color || '#2481cc',
    color: context?.webApp?.themeParams?.button_text_color || '#ffffff'
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-4">
        <h2 className="text-xl font-bold text-red-500">
          Что-то пошло не так
        </h2>
        <p className="text-sm text-muted-foreground">
          {error.message}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-lg text-sm font-medium"
          style={buttonStyle}
        >
          Перезагрузить страницу
        </button>
      </div>
    </div>
  );
}
