import React from 'react';
// import logo from './logo.svg';
import './App.css';
import { PongGame } from './PongGame';
import { UserSetting } from './components/user/UserSetting';
import { Form, Route, Routes } from 'react-router-dom';
import { Profile } from './components/user/Profile';
import { FriendshipComponent } from './components/friends/friendship'

function App() {
  
  return (
    <div>
<div className="App">
      <header className="App-header">
        <Routes>
        <Route path="/game" element={<PongGame />} />
		    <Route path="/settings" element={<UserSetting />} />
        <Route path={`/users/profile/:id`} element={<Profile />} />
        <Route path="/addfriend" element={<FriendshipComponent />} />
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
