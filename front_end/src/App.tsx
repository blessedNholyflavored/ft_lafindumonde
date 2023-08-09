import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import PongGame from './PongGame';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { Socket, io } from 'socket.io-client';
import { User } from './interfaces';



export const App: React.FC = () => {
  const [socket, setSocket] = useState<Socket<DefaultEventsMap, DefaultEventsMap> | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3000', {
      withCredentials: true,
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Connecté au serveur WebSocket.');
      setSocket(newSocket);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  return (
    <div>
      <Routes>
        <Route path="/" element={<Home socket={socket} setUser={setUser} />} />
        <Route path="/game" element={<PongGame socket={socket} user={user} />} />
      </Routes>
    </div>
  );
};

export default App;
