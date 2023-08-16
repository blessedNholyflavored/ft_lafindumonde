import React from 'react';
// import logo from './logo.svg';
import './App.css';
import { Form, Route, Routes } from 'react-router-dom';
import { PongGame } from './PongGame';
import { UserSetting } from './components/user/UserSetting';
//import { Profile } from './components/user/Profile';
//import { FriendshipComponent } from './components/friends/friendship'
import { Login } from "./Login";
import ProtectedRoute from "./ProtectedRoute";
import { AuthProvider } from "./AuthProvider";
import axios from './AxiosInstance';
import { useAuth } from './AuthProvider';


function App() {
return (
	<div>
		<div className="App">
			<header className="App-header">
			<AuthProvider>
				<Routes>
				<Route path="/game" element={<PongGame />} />
					<Route path="/settings" element={<UserSetting />} />
					<Route path="/login" element={<Login />} />
					<Route path='/' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
				{/* <Route path={`/users/profile/:id`} element={<Profile />} /> */}
				{/* <Route path="/addfriend" element={<FriendshipComponent />} /> */}
				</Routes>
			</AuthProvider>

				<a href="/game">
					<button>GAME</button>
				</a>
				<a href="/settings">
					<button>SETTINGs</button>
				</a>
			</header>
			<a href="/profile">
				<button>Profile</button>
			</a>
		</div>
	</div>
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
  }


export default App;
