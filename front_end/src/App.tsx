import React from 'react';
// import logo from './logo.svg';
import './App.css';
import { PongGame } from './PongGame';
import { UserSetting } from './UserSetting';
import { Form, Route, Routes } from 'react-router-dom';
import { Profile } from './components/user/Profile'
import FriendsList from './components/user/FriendsList';

function App() {
  
  return (
    <div>
<div className="App">
      <header className="App-header">
        <Routes>
        <Route path="/game" element={<PongGame />} />
		    <Route path="/settings" element={<UserSetting />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/users/:id/friends" element={<FriendsList />} />

        </Routes>

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
}


export default App;
