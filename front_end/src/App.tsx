import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import PongGame from './PongGame';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { Socket, io } from 'socket.io-client';
import { User } from './interfaces';
import "./App.css";
import { Login } from "./Login";
import ProtectedRoute from "./ProtectedRoute";
import { AuthProvider } from "./AuthProvider";
import axios from './AxiosInstance';
import { useAuth } from './AuthProvider';
import Profile from './prof';



export const App: React.FC = () => {
  const [socket, setSocket] = useState<Socket<DefaultEventsMap, DefaultEventsMap> | null>(null);
  const [user2, setUser2] = useState<User | null>(null);

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
      <AuthProvider>

      <Routes>
        <Route path='/prof' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        {/* <Route path="/" element={<Home socket={socket} setUser2={setUser2} />} /> */}
        <Route path="/game" element={<PongGame socket={socket} user2  ={user2} />} />
      </Routes>
      </ AuthProvider>
      </div>
  )
  }

export default App;
