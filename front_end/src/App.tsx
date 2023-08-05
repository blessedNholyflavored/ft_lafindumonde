import React, { useState, useEffect } from 'react';
import { PongGame } from './PongGame';
import { io, Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

interface User {
  id: number;
  username: string;
}

const App: React.FC = () => {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<User | null>(null);
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

  useEffect(() => {
    const newSocket = io('http://localhost:3000', {
      withCredentials: true,
      transports: ['websocket'],
    });

    if (!socket)
    {
    newSocket.on('connect', () => {
      console.log('Connecté au serveur WebSocket.');
      setSocket(newSocket);
    });
  }

    newSocket.on('receiveMessage', (data: { username: string; message: string }) => {
      console.log(`${data.username}: ${data.message}`);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  return (
    <div className="App">
      <header className="App-header">
        {selectedPlayer ? (
          <PongGame userDetails={userDetails} socket={socket} />
        ) : (
          <>
            <h2>Choisissez votre personnage :</h2>
            <button onClick={() => handlePlayerSelect('1')}>Ldinaut (Joueur 1)</button>
            <button onClick={() => handlePlayerSelect('2')}>Mcouppe (Joueur 2)</button>
          </>
        )}
      </header>
    </div>
  );
};

export default App;
