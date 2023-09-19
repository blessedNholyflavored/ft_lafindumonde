import React from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Home from './Home';
import PongGame from './PongGame';
import { UserSetting } from './components/user/UserSetting';
//import { DefaultEventsMap } from 'socket.io/dist/typed-events';
//import { io, Socket } from 'socket.io-client';
//import { User } from './interfaces';
import './App.css';
import './style/Profile.css';
import './style/twoFA.css';
import { Login } from './components/auth/Login';
import { LocalLogin } from './components/auth/LocalLogin';
import { Register } from './components/auth/Register';
import { Chat } from './components/chat/Chat';
import { Logout } from './components/auth/Logout';
import { SaveTotp } from './components/auth/SaveTotp';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider, useAuth } from './components/auth/AuthProvider';
import { socket, WebsocketProvider } from './WebsocketContext';
import { Websocket } from './Websocket';
import SuperPong from './SuperPong';
import { Profile } from './components/user/Profile';
import { FriendsPage } from './components/friends/friendsPage';
import SoloPong from './SoloPong';
import MiniGame from './SoloPong';
import Classement from './leaderboard';
import AcceptMatch from './acceptMatch';
import GameFriend from './GameFriend';
import { twoFAEnable, twoFADisable } from './components/auth/2faComp';

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
          <Route path="/game" element={<ProtectedRoute><PongGame /></ProtectedRoute>} />
		  <Route path="/settings" element={<ProtectedRoute><UserSetting /></ProtectedRoute>} />
          <Route path="/totpSave" element={<ProtectedRoute><SaveTotp /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
		  <Route path="/local_login" element={<LocalLogin />} />
		  <Route path="/register" element={<Register />} />
          <Route path="/auth" element={<ProtectedRoute><Auth_test /></ProtectedRoute>} />
          <Route path="/users/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/sock" element={<ProtectedRoute><Websocket /></ProtectedRoute>} />
		  <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
		  <Route path="/chat/priv/:recipient" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
		  <Route path="/friends" element={<ProtectedRoute><FriendsPage /></ProtectedRoute>} />
        <Route path="/SuperGame" element={<ProtectedRoute><SuperPong socket={socket} /></ProtectedRoute>} />
		  <Route path="/solopong" element={<ProtectedRoute><MiniGame /></ProtectedRoute>} />
		   <Route path="/leaderboard" element={<ProtectedRoute><Classement /></ProtectedRoute>} />
		   <Route path="/acceptMatch/:id" element={<ProtectedRoute><AcceptMatch /></ProtectedRoute>} />
		   <Route path="/gameFriend" element={<ProtectedRoute><GameFriend /></ProtectedRoute>} />
        </Routes>
    </AuthProvider>
      </WebsocketProvider>
  );
};

//TODO: remove this before prod
function  Auth_test() {
	const navigate = useNavigate();
	const { user, setUser } =useAuth();

	const navigateToHome = () => {
 		navigate('/');
 	};

  return (
    <div className="Salut">
      <h1>{user!.username}</h1>
      <img src={user!.pictureURL} alt="profile pic" />
      <p>{ JSON.stringify(user) }</p>
	 <div className="boxrowsettings">
		<div className="navbarsmallbox">
			<p className="boxtitle"> 2FAC AUTH </p>
		</div>
		<div className="twoFA">
			<button className="twoFAenabled" onClick={() => twoFAEnable(navigate, user)}>enable</button>
			<button className="twoFAdisabled" onClick={() => twoFADisable({user, setUser})}>disable</button>
		</div>
		<div className="footersmallbox">
			<br></br>
		</div>
	</div> 
      <button onClick={() => Logout({user, setUser})}>LOG OUT </button>
	  <button onClick={navigateToHome}>HOME</button>
    </div>
  );
};

export default App;
