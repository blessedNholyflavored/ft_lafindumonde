import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';
import { User } from './interfaces';

interface HomeProps {
  socket: Socket | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const Home: React.FC<HomeProps> = ({ socket, setUser }) => {
  const navigate = useNavigate();
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [queueCount, setQueueCount] = useState<number>(0);

  const handlePlayerSelect = async (player: string) => {
    setSelectedPlayer(player);

    try {
      const response = await fetch(`http://localhost:3000/users/${player}`);
      const user = await response.json();
      socket?.emit('joinQueue', user.id.toString());
      setUser(user);

      socket?.on('queueUpdate', (count: number) => {
        setQueueCount(count);
        if (count === 2) {
          navigate('/game');
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de l\'utilisateur :', error);
    }
  };

  const navigateToProfPage = () => {
    navigate('/prof');
  };

  return (
    <div>
      <h2>Choisissez votre personnage :</h2>
      <button onClick={() => handlePlayerSelect('1')}>Ldinaut</button>
      <button onClick={() => handlePlayerSelect('2')}>Mcouppe</button>
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
