import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';
import { User } from './interfaces';
import { useAuth } from './AuthProvider';

interface HomeProps {
  socket: Socket | null;
}

const Home: React.FC<HomeProps> = ({ socket }) => {
  const navigate = useNavigate();
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [queueCount, setQueueCount] = useState<number>(0);
  const { user, setUser } =useAuth();

  if (socket)
    console.log(socket.id);
  if (user)
    console.log(user.id);

  const handlePlayerSelect = async (player: string) => {
    setSelectedPlayer(player);

    try {
      // const response = await fetch(`http://localhost:3000/users/${player}`);
      // const user = await response.json();
      if (user)
      socket?.emit('joinQueue', user.id);
      setUser(user);

      socket?.on('queueUpdate', (count: number) => {
        setQueueCount(count);
        if (count === 2) {
         // socket?.emit('updateUserIG', user?.id);
          navigate('/game');
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de l\'utilisateur :', error);
    }
  };


  const navigateToProfPage = () => {
    navigate('/auth');
  };


  return (
    <div>
      <h2>Les WebSocket c'est dla merde</h2>
      <button onClick={() => handlePlayerSelect('1')}>RECHERCHE DE PARTIE</button>
      <button onClick={navigateToProfPage}>Aller à la page Prof</button>

      {queueCount > 0 && (
        <p>En attente d'autres joueurs...</p>
      )}
      {queueCount === 2 && (
        <p>La partie commence entre Ldinaut et Mcouppe !</p>
      )}
    </div>
  );
};

export default Home;
