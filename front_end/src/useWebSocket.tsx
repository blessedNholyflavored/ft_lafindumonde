import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useWebSocket = (player: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3000', {
      withCredentials: true,
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log(`Connecté au serveur WebSocket en tant que ${player}.`);
      setSocket(newSocket);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [player]);

  return socket;
};
