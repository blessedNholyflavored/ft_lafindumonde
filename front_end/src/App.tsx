import React from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Home from './Home';
import PongGame from './PongGame';
import { UserSetting } from './components/user/UserSetting';
//import { DefaultEventsMap } from 'socket.io/dist/typed-events';
//import { io, Socket } from 'socket.io-client';
//import { User } from './interfaces';
import './App.css';
import { Login } from './components/auth/Login';
import { Chat } from './components/chat/Chat';
import { Logout } from './components/auth/Logout';
import { SaveTotp } from './components/auth/SaveTotp';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider, useAuth } from './components/auth/AuthProvider';
import { socket, WebsocketProvider } from './WebsocketContext';
import { Websocket } from './Websocket';

export const App: React.FC = () => {
  //const [socket, setSocket] = useState<Socket<DefaultEventsMap, DefaultEventsMap> | null>(null);
 // const [user, setUser] = useState<User | null>(null);

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
          <Route path="/totpSave" element={<ProtectedRoute><SaveTotp /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/sock" element={<ProtectedRoute><Websocket /></ProtectedRoute>} />
		  <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        </Routes>
    </AuthProvider>
      </WebsocketProvider>
  );
};

//TODO: remove this before prod
function  Profile() {
  const { user, setUser } =useAuth();
  const navigate = useNavigate();

	const navigateToHome = () => {
		navigate('/');
	};

  return (
    <div className="Salut">
      <h1>{user!.username}</h1>
      <img src={user!.pictureURL} alt="profile pic" />
      <p>{ JSON.stringify(user) }</p>
      <button onClick={() => Logout({user, setUser})}>LOG OUT </button>
	  <button onClick={navigateToHome}>HOME</button>
    </div>
  );
};

export default App;
