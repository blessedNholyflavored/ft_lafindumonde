import React, { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { User, Room } from './interfaces'; // Assurez-vous d'importer les interfaces correctes
import './App.css'

interface PongGameProps {
  user: User | null;
  socket: Socket | null;
}

const PongGame: React.FC<PongGameProps> = ({ user, socket }) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [roomData, setRoomData] = useState<Room>({ player1: { id: 0, username: '', point: { x: 0, y: 0 } }, player2: { id: 0, username: '', point: { x: 0, y: 0 } }, ball: { x: 0, y: 0 }});

  useEffect(() => {
    if (socket)
    {
    socket?.emit('startGame', (roomData: Room) => {
      if (roomData.player1 && roomData.player2) {
        setRoom(roomData);
      }
    });
    return () => {
      if (socket)
      socket.off('startGame');
      // Nettoyage des autres effets...
    };
  }}, [socket]);

    useEffect(() => {
      if (socket)
      {
      socket?.on('startGame2', (roomData: Room) => {
        if (roomData.player1 && roomData.player2 && roomData.player1.username != undefined) {
          setRoom(roomData);
        }
      });

    // D'autres effets et nettoyages...

    return () => {
      if (socket)
      socket.off('startGame2');
      // Nettoyage des autres effets...
    };
  }}, [socket]);


  return (
    <div>
      {user && (
        <h2>Vous êtes connecté en tant que {user.username}</h2>
      )}
      {room && room.player1 && room.player2 && room.ball != undefined &&  (
        <div>
          <p>La partie commence entre {room.player1.username} et {room.player2?.username} !</p>
          <div className="player-point" style={{ left: room.player1.point.x, top: room.player1.point.y }}></div>
          <div className="player-point" style={{ left: room.player2.point.x, top: room.player2.point.y }}></div>
          <div className="ball" style={{ left: room.ball.x, top: room.ball.y }}></div>
        </div>
      )}
    </div>
  );
};

export default PongGame;
