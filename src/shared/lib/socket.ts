import io from 'socket.io-client';

/** Создать сокет-клиент */
export function createSocket() {
  const socket = io(import.meta.env.VITE_API_URL, {
    transports: ['websocket'],
    autoConnect: false,
  });

  return socket;
}
