import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

interface User {
  id: number;
  username: string;
}

interface PongGameProps {
  userDetails: User | null;
  socket: Socket<DefaultEventsMap, DefaultEventsMap> | null;
}

interface PongGameProps {
  userDetails: User | null;
  socket: Socket<DefaultEventsMap, DefaultEventsMap> | null;
  setSocket: React.Dispatch<React.SetStateAction<Socket<DefaultEventsMap, DefaultEventsMap> | null>>;
}

export const PongGame: React.FC<PongGameProps> = ({ userDetails, socket, setSocket }) => {
  // ...

  const [message, setMessage] = useState<string>('');

  const connectToWebSocket = () => {
    const newSocket = io('http://localhost:3000', {
      withCredentials: true,
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Connecté au serveur WebSocket.');
    });

    newSocket.on('receiveMessage', (data: { username: string; message: string }) => {
      console.log(`${data.username}: ${data.message}`);
    });

    return newSocket;
  };

  useEffect(() => {
    if (!socket) {
      const newSocket = connectToWebSocket();
      setSocket(newSocket);
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const handleSendMessage = () => {
    if (socket && userDetails) {
      socket.emit('sendMessage', { username: userDetails.username, message });
      setMessage('');
    }
  };

  return (
    <div>
      {userDetails && (
        <h2>Vous êtes connecté en tant que {userDetails.username}</h2>
      )}
      {/* Votre code JSX pour le jeu Pong */}
      {socket && userDetails && (
        <div>
          <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
          <button onClick={handleSendMessage}>Envoyer</button>
        </div>
      )}
    </div>
  );
};

export default PongGame;
