import React from 'react';
// import logo from './logo.svg';
import './App.css';

//cest ici quon fera les routes qui redirige vers les composants
// a savoir nos "pages" qui elles meme ont des composants

// import { useState, useEffect } from 'react';
import { PongGame } from './PongGame';
import { Route, Routes } from 'react-router-dom';
import { Profile } from './components/Profile'

function App() {
  
  return (
    <div>
<div className="App">
      <header className="App-header">
        <Routes>
        <Route path="/game" element={<PongGame />} />
        <Route path="/profile/:id" element={<Profile />} />

        </Routes>

        <a href="/game">
          <button>GAME</button>
          </a>
        <a href="/profile">
          <button>Profile</button>
          </a>
          </header> 
    </div>
    </div>
  );
}

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.tsx</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

export default App;
