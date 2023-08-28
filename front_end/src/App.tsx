import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import PongGame from './PongGame';
import { UserSetting } from './components/user/UserSetting';
//import { DefaultEventsMap } from 'socket.io/dist/typed-events';
//import { io, Socket } from 'socket.io-client';
import { User } from './interfaces';
import './App.css';
import { Login } from './components/auth/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider, useAuth } from './components/auth/AuthProvider';
import { socket, WebsocketProvider } from './WebsocketContext';
import { Websocket } from './Websocket';
import api from './AxiosInstance';

export const App: React.FC = () => {
  //const [socket, setSocket] = useState<Socket<DefaultEventsMap, DefaultEventsMap> | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // useEffect(() => {
  //   const newSocket = io('http://localhost:3000', {
  //     withCredentials: true,
  //   });

  //   newSocket.on('connect', () => {
  //     console.log('Connecté au serveur WebSocket.');
  //     setSocket(newSocket);
  //   });

  //   return () => {
  //     if (socket) {
  //       socket.disconnect();
  //     }
  //   };
  // }, []);

  return (
        <WebsocketProvider value={socket}>
    <AuthProvider>
        <Routes>
          <Route path="/" element={<ProtectedRoute><Home socket={socket} /></ProtectedRoute>} />
          <Route path="/game" element={<ProtectedRoute><PongGame socket={socket} /></ProtectedRoute>} />
		  <Route path="/settings" element={<ProtectedRoute><UserSetting /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/sock" element={<ProtectedRoute><Websocket /></ProtectedRoute>} />
        </Routes>
    </AuthProvider>
      </WebsocketProvider>
  );
};

function  Profile() {
  const { user, setUser } =useAuth();

  async function logout() {
    try {
      // on appelle la route qui clear cookie ds le back
      const res = await api.get('/auth/logout');
      // du coup l'user qu'on avait set bah il faut le unset
      setUser(null);
    } catch (error) {
      console.log('Error: ', error);
    }
  }
  return (
    <div className="Salut">
      <h1>{user!.username}</h1>
      <img src={user!.pictureURL} alt="profile picture" />
      <p>{ JSON.stringify(user) }</p>
      <button onClick={logout}>LOG OUT </button>
    </div>
  );
};

export default App;
