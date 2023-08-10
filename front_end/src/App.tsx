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
    <AuthProvider>
      <Routes>
      {/* <Route path="/" element={<Home socket={socket} setUser={setUser} />} /> */}
        <Route path="/game" element={<PongGame socket={socket} user={user} />} />
        <Route path="/login" element={<Login />} />
        <Route path='/' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Routes>
    </ AuthProvider>
  );
};

function  Profile() {
  const { user, setUser } =useAuth();

  async function logout() {
    try {
      // on appelle la route qui clear cookie ds le back
      const res = await axios.get('/auth/logout');
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
      <button onClick={logout}>Log Out</button>
    </div>
  );
};

export default App;
