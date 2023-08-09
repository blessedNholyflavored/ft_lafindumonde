import React, { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { User, Room } from './interfaces'; // Assurez-vous d'importer les interfaces correctes

interface PongGameProps {
  user: User | null;
  socket: Socket | null;
}

const PongGame: React.FC<PongGameProps> = ({ user, socket }) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [roomData, setRoomData] = useState<Room>({ player1: { id: 0, username: '' }, player2: { id: 0, username: '' } });

  useEffect(() => {
    if (socket)
    {
      console.log("aaaaa");
    socket?.emit('startGame', (roomData: Room) => {
      console.log("wwww");
      if (roomData.player1 && roomData.player2) {
        setRoom(roomData);
      }
    });

    // D'autres effets et nettoyages...

    return () => {
      if (socket)
      socket.off('startGame');
      // Nettoyage des autres effets...
    };
  }}, [socket]);

  return (
    <div>
      {user && (
        <h2>Vous êtes connecté en tant que {user.username}</h2>
      )}
      {room && room.player1 && (
        <div>
          <p>La partie commence entre {room.player1.username} et {room.player2?.username} !</p>
        </div>
      )}
    </div>
  );
};

export default PongGame;
