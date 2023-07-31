import React from 'react';
// import logo from './logo.svg';
import './App.css';

//cest ici quon fera les routes qui redirige vers les composants
// a savoir nos "pages" qui elles meme ont des composants

import { useState, useEffect } from 'react';
import { PongGame } from './PongGame';
import { Route, Routes } from 'react-router-dom';
import { io, Manager, Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

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



interface User {
  id: number;
  username: string;
}

const App: React.FC = () => {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [message, setMessage] = useState<string>('');
  const [socket, setSocket] = useState<Socket<DefaultEventsMap, DefaultEventsMap> | null>(null);

  const handlePlayerSelect = async (player: string) => {
    setSelectedPlayer(player);
    try {
      const response = await fetch(`http://localhost:3000/users/${player}`);
      const userDetails = await response.json();
      setUserDetails(userDetails);
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de l\'utilisateur :', error);
    }
  };

  const connectToWebSocket = () => {
    const newSocket = io('http://localhost:3000', {
      withCredentials: true,
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Connecté au serveur WebSocket.');
      setSocket(newSocket);
    });

    newSocket.on('receiveMessage', (data: { username: string; message: string }) => {
      console.log(`${data.username}: ${data.message}`);
    });
  };

  const handleSendMessage = () => {
    if (socket && userDetails) {
      socket.emit('sendMessage', { username: userDetails.username, message });
      setMessage('');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        {selectedPlayer ? (
          <PongGame userDetails={userDetails} socket={socket} setSocket={setSocket} />
        ) : (
          <>
            <h2>Choisissez votre personnage :</h2>
            <button onClick={() => handlePlayerSelect('1')}>Ldinaut (Joueur 1)</button>
            <button onClick={() => handlePlayerSelect('2')}>Mcouppe (Joueur 2)</button>
          </>
        )}
        {/* {socket && userDetails && (
          <div>
            <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
            <button onClick={handleSendMessage}>Envoyer</button>
          </div>
        )} */}
      </header>
    </div>
  );
};

export default App;

