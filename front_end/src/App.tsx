import React from 'react';
// import logo from './logo.svg';
import './App.css';

//cest ici quon fera les routes qui redirige vers les composants
// a savoir nos "pages" qui elles meme ont des composants

import { useState, useEffect } from 'react';
import { PongGame } from './PongGame';
import { Route, Routes } from 'react-router-dom';

// type Username = { id: string; name: string }[];


// export default function App()
// {
//   const [state, setState] = useState<Username>([]);
//   useEffect(() => {
//     const dataFetch = async () => {
//       const data = await (
//         await fetch(
//           'http://localhost:3000/users'
//           //ici cest lurl ou ca fetch le name "https://run.mocky.io/v3/b3bcb9d2-d8e9-43c5-bfb7-0062c85be6f9"
//         )
//       ).json();

//       setState(data);
//     };

//     dataFetch();
//   }, []);

//   return (
//     <ul>
//       {state.map((val) => (
//         <li>{val.name}</li>
//       ))}
//     </ul>
//   );
// }


// export default function App()
// {
//   const [username, setUsername] = useState([]);
//   console.log("nonono");
//   useEffect(() => {
//     const fetchUsername = async () => {
//       try {
//         const response = await (await fetch("http://localhost:3000/users")).json();
//         setUsername(response[1].username);
//       } 
//       catch (error) {
//       console.error('Error fetching username:', error);
//       }
//     };
//     fetchUsername();
//   }, []);


//   return (
//     <div>
//       {
//         <p>Hello @{username} les pds</p>
//       }
//     </div>
//   );
// }



// App.tsx


const App: React.FC = () => {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  const handlePlayerSelect = (player: string) => {
    setSelectedPlayer(player);
  };

  return (
    <div className="App">
      <header className="App-header">
        {selectedPlayer ? (
          <Routes>
            <Route
              path="/game"
              element={<PongGame selectedPlayer={selectedPlayer} />}
            />
          </Routes>
        ) : (
          <>
            <h2>Choisissez votre personnage :</h2>
            <button onClick={() => handlePlayerSelect('ldinaut')}>Ldinaut (Joueur 1)</button>
            <button onClick={() => handlePlayerSelect('mcouppe')}>Mcouppe (Joueur 2)</button>
          </>
        )}
      </header>
    </div>
  );
};

export default App;


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

// export default App;
