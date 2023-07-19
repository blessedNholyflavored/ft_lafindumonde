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



export default function App() {
  const [usernames, setUsernames] = useState([]);
  console.log("nonono");

  useEffect(() => {
    const fetchUsernames = async () => {
      try {
        const response = await (await fetch("http://localhost:3000/users")).json();
        const usernamesArray = response.map((user: { username: any; }) => user.username);
        setUsernames(usernamesArray);
      } catch (error) {
        console.error('Error fetching usernames:', error);
      }
    };
    fetchUsernames();
  }, []);

  return (
    <div>
<div className="App">
      <header className="App-header">
      <PongGame />

      </header>
        {/* <Routes>
        <Route path="/game" element={<PongGame />} />
          <PongGame />
        </Routes> */}
    </div>
          {/* {usernames.map((username, index) => (
        <p key={index}>hello {username}</p>
      ))} */}
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

// export default App;
