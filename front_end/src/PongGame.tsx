import React, { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { User, Room } from './interfaces'; // Assurez-vous d'importer les interfaces correctes
import './App.css'
import { useAuth } from './AuthProvider';

interface PongGameProps {
  socket: Socket | null;
}

const PongGame: React.FC<PongGameProps> = ({ socket }) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [roomData, setRoomData] = useState<Room>({ player1: { id: 0, username: '', point: { x: 0, y: 0 }, socketid: '' }, player2: { id: 0, username: '', point: { x: 0, y: 0 }, socketid: '' }, ball: { x: 0, y: 0, speedX: -1, speedY: 0, speed: 5}, scorePlayer1: 0, scorePlayer2: 0, end: 0});
  const [counter, setCounter] = useState(0);
  const { user, setUser } =useAuth();
  const [end, setEnd] = useState<number>(0);

  useEffect(() => {
    if (socket && room && room.end)
    {
      setEnd(1);
    }
  }, [end,room,socket]);


  useEffect(() => {
    if (socket) {
      socket?.emit('startGame', (roomData: Room) => {
        if (roomData.player1 && roomData.player2) {
          setRoom(roomData);
          if (room && room.player1 && user?.username === room.player1.username)
            room.player1.socketid = socket.id;
          if (room && room.player2 && user?.username === room.player2.username)
          room.player2.socketid = socket.id;
        }
      });

      return () => {
        if (socket) socket.off('startGame');
        // Nettoyage des autres effets...
      };
    }
  }, [socket]);

  useEffect(() => {
    if (socket && !end) {
      socket.on('recupMoov', (updatedRoom: Room) => {
        setRoom(updatedRoom);
      });
  
      return () => {
        if (socket) {
          socket.off('recupMoov');
        }
      };
    }
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.on('startGame2', (room: Room) => {
        if (room.player1 && room.player2 && room.player1.username !== undefined) {
          setRoom(room);
          setCounter(1);
        }
      });

      // D'autres effets et nettoyages...

      return () => {
        if (socket) socket.off('startGame2');
        // Nettoyage des autres effets...
      };
    }
  }, [socket]);

  const handleKeyDown = (event: KeyboardEvent) => {
    console.log(event.key);

    if ((event.key === 'ArrowUp' || event.key === 'ArrowDown') && !end)
    {
      socket?.emit("movePoint", user?.username, event.key, room);
    }
  };
  

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [socket, room, user]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (socket && counter === 1 && !end) {
      intervalId = setInterval(() => {
        socket.emit('ballMoovEMIT', room);
    }, 1000 / 60); // Mettez ici l'intervalle de temps souhaité (en millisecondes)
  }
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
}, [socket, room]);

useEffect(() => {

if (socket && !end) {
  socket.on('ballMoovON', (room: Room) => {
    if (room.player1 && room.player2 && room.player1.username !== undefined) {
      setRoom(room);
    }
  });
}

});

  return (
<div className="pong-game">
  {user && (
    <h2>Vous êtes connecté en tant que {user.username}</h2>
  )}
  {room && room.player1 && room.player2 && room.ball !== undefined &&  (
    <div>
      <p>La partie commence entre {room.player1.username} et {room.player2?.username} !</p>
      <div style={{ textAlign: 'center', fontSize: '24px', marginBottom: '10px' }}>
          { end && (
            <div>
              <h1>Fin de partie !</h1>
              Score - { room.player1.username } { room.scorePlayer1 } | { room.scorePlayer2 } { room.player2.username }
              { room.scorePlayer1 >= 5 && (
                <p>{ room.player1.username } remporte la partie</p>
              )}
              { room.scorePlayer2 >= 5 && (
                <p>{ room.player2.username } remporte la partie</p>
              )}
              
              </div>)}
              { !end && (
              <div>
              Score - { room.player1.username } { room.scorePlayer1 } | { room.scorePlayer2 } { room.player2.username }
              </div>
              )}
          </div>
      <div className={`player-rect player1`} style={{ top: room.player1.point.y }}></div>
      <div className={`player-rect player2`} style={{ top: room.player2.point.y }}></div>
      <div className="ball" style={{ left: room.ball.x, top: room.ball.y }}></div>
    </div>
  )}
</div>


  );
};

export default PongGame;
