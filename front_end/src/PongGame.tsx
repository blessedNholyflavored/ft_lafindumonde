import React, { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

interface User {
  id: number;
  username: string;
}

interface PongGameProps {
  userDetails: User | null;
  socket: Socket<DefaultEventsMap, DefaultEventsMap> | null;
}

export const PongGame: React.FC<PongGameProps> = ({ userDetails, socket }) => {
  const [pointPosition, setPointPosition] = useState<{ x: number; y: number }>({ x: 400, y: 300 });

  const handleKeyDown = (event: KeyboardEvent) => {
    const key = event.code;
    if (key === 'ArrowUp' && socket) {
      socket.emit('moveUp');
    }
    if (key === 'ArrowDown' && socket) {
      socket.emit('moveDown');
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.on('updatePointPosition', (data: { x: number; y: number }) => {
        setPointPosition({ x: data.x, y: data.y });
      });
    }
  }, [socket]);

  return (
    <div>
      {userDetails && (
        <h2>Vous êtes connecté en tant que {userDetails.username}</h2>
      )}
      {socket && userDetails && (
        <div>
          <div style={{ position: 'absolute', width: 10, height: 10, backgroundColor: 'red', top: pointPosition.y, left: pointPosition.x }}></div>
        </div>
      )}
    </div>
  );
};

export default PongGame;
