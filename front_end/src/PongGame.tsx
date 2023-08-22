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




  useEffect(() => {
    if (socket && room && room.end)
    {
      setEnd(1);
    }
  }, [end,room,socket]);


  useEffect(() => {
    if (socket && counter === 0) {
      let t = user?.id;
      socket?.emit('startGame');
      setCounter(1);

      return () => {
        if (socket) socket.off('startGame');
        // Nettoyage des autres effets...
      };
    }
  }, [socket]);

  useEffect(() => {
    if (socket && !end) {
      socket.on('recupMoov', (updatedRoom: Room) => {
    console.log("wwwwwwwwww");

        setRoom(updatedRoom);
      });
      return () => {
        if (socket) socket.off('recupMoov');
      };

    }
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.on('startGame2', async (room: Room) => {
          setRoom(room);
          // if (room && room.player1 && user?.username === room.player1)
          // {  
          //   room.player1.id = user.id;
          // }
          // if (room && room.player2 && user?.id === room.player2.id)
          // {
          //   room.player2.socketid = socket.id;
          //   room.player2.id = user.id;
          // }


          setCounter(1);
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

useEffect(() => {

if (socket && !end) {
  socket.on('ballMoovON', (room: Room) => {
    if (room.player1 && room.player2 && room.player1 !== undefined) {
      setRoom(room);
    }
  });
}
return () => {
  if (socket) {
    socket.off('recupMoov');
    socket.off('ballMoovON');
  }
};
}, [socket, room]);

useEffect(() => {

if (socket && !startFlag && room && counter === 1) {
  setStartflag(1);
  socket.emit('CreateGame', (room: Room) => {
  });
}
});

const NavHome = () => {
  socket.emit('changeStatus', (socket: Socket) => {
  });
  navigate('/');
  window.location.reload();

}

useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {

      console.log(end);
    // Émettez un événement pour quitter la partie lorsque la fenêtre se ferme ou que l'URL change
    socket?.emit('leaveGame');
    socket?.emit('changeStatus');
  };

  // Ajoutez le gestionnaire d'événements beforeunload
  window.addEventListener('beforeunload', handleBeforeUnload);

  // Nettoyez le gestionnaire d'événements lorsque le composant est démonté
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
}, [socket]);



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
