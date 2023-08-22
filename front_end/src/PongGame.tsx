import React, { useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { User, Room } from './interfaces'; // Assurez-vous d'importer les interfaces correctes
import './App.css'
import { useAuth } from './AuthProvider';
import { useNavigate } from 'react-router-dom';
import { WebsocketContext } from './WebsocketContext';



const PongGame: React.FC = () => {
  const [room, setRoom] = useState<Room | null>(null);
  const [counter, setCounter] = useState(0);
  const { user, setUser } =useAuth();
  const [end, setEnd] = useState<number>(0);
  const [startFlag, setStartflag] = useState<number>(0);
  const navigate = useNavigate();
  const socket = useContext(WebsocketContext);



  const handleKeyDown = (event: KeyboardEvent) => {

    if ((event.key === 'ArrowUp' || event.key === 'ArrowDown') && !end)
    {
      socket?.emit("movePoint", user?.username, event.key, room?.roomID);
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
        socket.emit('ballMoovEMIT', room?.roomID);
    }, 1000 / 60);
  }
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
}, [socket, room]);








const NavHome = () => {
  socket.emit('changeStatus', (socket: Socket) => {
  });
  navigate('/');
  window.location.reload();

}

useEffect(() => {

      //      CREATION DU MODEL DE LA GAME DANS LA DB

  if (socket && !startFlag && room && counter === 1) {
    setStartflag(1);
    socket.emit('CreateGame', (room: Room) => {
    });
  }

      //      LANCEMENT DE LA PARTIE (AFFICHAGE DU DEBUT)

  if (socket && counter === 0) {
    let t = user?.id;
    socket?.emit('startGame');
    setCounter(1);
  }

      //      RECUP DES DATAS DU BACK VERS LE FRONT POUR AFFICHAGE AU DEBUT DE LA GAME

  if (socket) {
    socket.on('startGame2', async (room: Room) => {
        setRoom(room);
        setCounter(1);
    });
  }

        //      RECUP DES DATAS DES PLAYER MOVES ET DES DEPLACEMENTS DE LA BALLE DEPUIS LE BACK VERS LE FRONT

  if (socket && !end) {
    socket.on('ballMoovON', (room: Room) => {
      if (room.player1 && room.player2 && room.player1 !== undefined) {
        setRoom(room);
      }
    });
  }

  if (socket && room && room.end)
  setEnd(1);

  const handleBeforeUnload = (e: BeforeUnloadEvent) => {

    socket?.emit('leaveGame');
    socket?.emit('changeStatus');
  };

  window.addEventListener('beforeunload', handleBeforeUnload);


      //      CLEAR DES DIFFERENTS EVENT

  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
    if (socket) {
      socket.off('recupMoov');
      socket.off('ballMoovON');
      socket.off('recupMoov');
      socket.off('startGame2');
      socket.off('startGame');


    }
  };
}, [socket, room, end]);



useEffect(() => {

  if (socket && !end) {
    socket.on('playerLeave', (room: Room) => {
      setRoom(room)
    });
  }
  });



  return (
<div className="pong-game">
  {user && (
    <h2>Vous êtes connecté en tant que {user.username}</h2>
  )}
  {room && room.player1 && room.player2 &&  (
    <div>
      <p>La partie commence entre {room.player1} et {room.player2} !</p>
      <div style={{ textAlign: 'center', fontSize: '24px', marginBottom: '10px' }}>
          { end && (
            <div>
              <h1>Fin de partie !</h1>
              Score - { room.player1 } { room.scoreP1 } | { room.scoreP2 } { room.player2 }
                <p>{ room.winner } remporte la partie</p>
                <button onClick={NavHome}>Retourner au Home</button>

              </div>)}
              { !end && (
              <div>
              Score - { room.player1 } { room.scoreP1 } | { room.scoreP2 } { room.player2 }
              </div>
              )}
          </div>
      <div className={`player-rect player1`} style={{ top: room.player1Y }}></div>
      <div className={`player-rect player2`} style={{ top: room.player2Y }}></div>
      <div className="ball" style={{ left: room.ballX, top: room.ballY }}></div>
    </div>
  )}
</div>


  );
};

export default PongGame;
