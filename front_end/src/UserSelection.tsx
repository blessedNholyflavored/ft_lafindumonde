import React, { useState } from 'react';
import { Socket } from 'socket.io-client';
import { Link, useNavigate } from 'react-router-dom';

interface UserSelectionProps {
  socket: Socket | null;
}

const UserSelection: React.FC<UserSelectionProps> = ({ socket }) => {
  const navigate = useNavigate();
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  const handlePlayerSelection = (player: string) => {
    setSelectedPlayer(player);
  };

  const handleJoinQueue = () => {
    if (socket && selectedPlayer) {
      socket.emit('joinQueue', selectedPlayer);
    }
  };

  return (
    <div>
      <h2>Choisissez votre personnage :</h2>
      <button onClick={() => handlePlayerSelection('player1')}>Ldinaut (Joueur 1)</button>
      <button onClick={() => handlePlayerSelection('player2')}>Mcouppe (Joueur 2)</button>

      {selectedPlayer && (
        <div>
          <p>En attente d'un autre joueur...</p>
          <button onClick={handleJoinQueue}>Rejoindre la file d'attente</button>
        </div>
      )}

      {/* Supprimez le lien de redirection ici */}
    </div>
  );
};

export default UserSelection;
