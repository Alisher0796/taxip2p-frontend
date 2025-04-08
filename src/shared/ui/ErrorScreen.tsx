

interface ErrorScreenProps {
  message: string;
  retryFn?: () => void;
}

export function ErrorScreen({ message, retryFn }: ErrorScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md rounded-lg bg-white p-6 text-center shadow-lg">
        <svg
          className="mx-auto h-16 w-16 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        
        <h1 className="mb-4 text-xl font-bold text-gray-800">
          Произошла ошибка
        </h1>
        
        <p className="mb-4 text-gray-600">
          {message}
        </p>
        
        <div className="flex flex-col gap-3">
          {retryFn && (
            <button
              onClick={retryFn}
              className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Попробовать снова
            </button>
          )}
          
          <button
            onClick={() => window.location.href = 'https://t.me/taxip2p_bot'}
            className="w-full rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            Открыть в Telegram
          </button>
        </div>
      </div>
    </div>
  );
}
