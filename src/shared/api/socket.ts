import io from 'socket.io-client';

export const createSocket = (): ReturnType<typeof io> => {
  const SOCKET_URL = import.meta.env.VITE_API_URL;
  
  if (!SOCKET_URL) {
    throw new Error('VITE_API_URL is not defined');
  }

  return io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
  });
};
