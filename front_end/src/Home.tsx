import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';
import { User } from './interfaces';
import { useAuth } from './AuthProvider';
import { WebsocketContext } from './WebsocketContext';

interface HomeProps {
  socket: Socket | null;
}

const Home: React.FC<HomeProps> = () => {
  const navigate = useNavigate();
  const socket = useContext(WebsocketContext);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [queueCount, setQueueCount] = useState<number>(0);
  const { user, setUser } =useAuth();
  // const [recupStatus, setStatus] = useState<string>('');
  let recupStatus = '';
  const [inGame, setInGame] = useState<number>(0);


  // if (socket)
  //   console.log(socket.id);
  // if (user)
  //   console.log(user.id);

  const handlePlayerSelect = async (player: string) => {
    setSelectedPlayer(player);

    try {
      console.log("before fetch");
      const response = await fetch(`http://localhost:3000/users/status/${user?.id}`, {
        method: 'GET',
      });
      if (response.ok) {
        const recup = await response.text();
        // setStatus(recup);
        recupStatus = recup;
      }
      console.log(recupStatus);
      if (recupStatus !== "INGAME")
      {
      if (user)
      socket?.emit('joinQueue', user.id);
      setUser(user);

      socket?.on('queueUpdate', (count: number) => {
        setQueueCount(count);
        if (count === 2) {
         socket?.emit('updateUserIG', user?.id);
          navigate('/game');
        }
      
      });
    }
    else if (recupStatus === "INGAME")
    {
      setInGame(1);
    }
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de l\'utilisateur :', error);
    }

    return () => {
      if (socket) {
        socket.off('queueUpdate');
      }
    };
}


const handlePlayerSelect222 = async (player: string) => {
  setSelectedPlayer(player);


  try {
      if (user)
    socket?.emit('joinQueue', user.id);
    setUser(user);

    socket?.on('queueUpdate', (count: number) => {
      setQueueCount(count);
      if (count === 2) {
       socket?.emit('updateUserIG', user?.id);
        navigate('/SuperGame');
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des détails de l\'utilisateur :', error);
  }

  return () => {
    if (socket) {
      socket.off('queueUpdate');
    }
  };
}


  const navigateToProfPage = () => {
    navigate('/auth');
  };




  return (
    <div>
      <h2>Les WebSocket c'est dla merde</h2>
      <button onClick={() => handlePlayerSelect('1')}>RECHERCHE DE PARTIE</button>
      <button onClick={navigateToProfPage}>Aller à la page Prof</button>
      <button onClick={() => handlePlayerSelect222('1')}>Rdfsfvdsvfdsvfdfd</button>


      {queueCount > 0 && (
        <p>En attente d'autres joueurs...</p>
      )}
      {queueCount === 2 && (
        <p>La partie commence entre Ldinaut et Mcouppe !</p>
      )}
      { inGame === 1 && (
        <p>Deja en game mon reuf !</p>
      )}
    </div>
  );
};

export default Home;
