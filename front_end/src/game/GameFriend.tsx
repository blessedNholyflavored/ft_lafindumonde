import React, { useContext, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { User, Room } from "../interfaces/interfaces"; // Assurez-vous d'importer les interfaces correctes
import "../App.css";
import { useAuth } from "../components/auth/AuthProvider";
import { useNavigate, useParams } from "react-router-dom";
import { WebsocketContext } from "../services/WebsocketContext";
import { count } from "console";
import foldergreen from "./../img/foldergreen.png";
import folderblue from "./../img/folderblue.png";
import folderpink from "./../img/folderpink.png";
import folderyellow from "./../img/folderyellow.png";
import folderwhite from "./../img/folderwhite.png";
import folderviolet from "./../img/folderviolet.png";
import icon from "./../img/buttoncomp.png";
import logo from "./../img/logo42.png";

const GameFriend: React.FC = () => {
  const { id } = useParams();
  const [room, setRoom] = useState<Room | null>(null);
  const [counter, setCounter] = useState(0);
  const [end, setEnd] = useState<number>(0);
  const [startFlag, setStartflag] = useState<number>(0);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const socket = useContext(WebsocketContext);
  const [player1Pos, setPlayer1Pos] = useState<number>(200);
  const [player2Pos, setPlayer2Pos] = useState<number>(200);
  const [BallXpos, setBallXPos] = useState<number>(350);
  const [BallYpos, setBallYPos] = useState<number>(200);
  const [SpeedBallX, setSpeedBallX] = useState<number>(-5);
  const [SpeedBallY, setSpeedBallY] = useState<number>(0);
  const [updatelvl, setUpdatelvl] = useState<number>(0);
  const [countdown, setCountdown] = useState(3);
  const [checkstatus, setCheckStatus] = useState(false);

  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (countdown > 0) {
      socket?.emit("reloadCountdown", id);
      setCountdown(-999);
      // window.location.href = "/gamePage";
    }
    socket?.emit("leaveGame", id);
    socket?.emit("changeStatus");
    setEnd(1);
    // NavHome();
  };

  const startCountdown = () => {
    const countdownInterval = setInterval(() => {
      if (room?.end !== 1) setCountdown((prevCountdown) => prevCountdown - 1);
    }, 1000);

    setTimeout(() => {
      clearInterval(countdownInterval);
      startGameFCT();
    }, 4000);
  };
  useEffect(() => {
    if (countdown !== 0 && end === 0) {
      startCountdown();
    }
  }, [counter]);

  const handleKeyDown = (event: KeyboardEvent) => {
    if ((event.key === "ArrowUp" || event.key === "ArrowDown") && !end) {
      socket?.emit("movePoint", user?.username, event.key, room?.roomID);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [socket, room, user]);

  const NavHome = () => {
    socket.emit("changeStatus", (socket: Socket) => {});
    navigate("/gamePage");
    window.location.reload();
  };

  const startGameFCT = () => {
    if (socket && counter === 0) {
      socket?.emit("startfriendGameFriend", id);
      setCounter(1);
    }
  };

  async function getstatus() {
    let status;
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/users/status/${user?.id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (response.ok) {
        const recup = await response.text();
        // setStatus(recup);
        status = recup;
      }
      if (status !== "INGAME") {
        navigate("/gamePage");
      }
    } catch (error) {}
  }

  useEffect(() => {
    if (socket && checkstatus === false) {
      setTimeout(() => {
        getstatus();
      }, 300);
      setCheckStatus(true);
    }

    if (socket && countdown === -999) {
      socket.on("reloadCountdown", async () => {
        window.location.href = "/gamePage";
      });
    }

    if (socket && !end) {
      socket.on("gameIsDone", async () => {
        setEnd(1);
        // window.location.href = "/gamePage";
      });
    }

    socket.on("heLeftTheGame", () => {
      localStorage.setItem("leftGame", "Your oppenent has left the game");
    });

    if (socket && id && room) {
      socket.emit("gameFinished", id);
    }

    //      CREATION DU MODEL DE LA GAME DANS LA DB

    //      LANCEMENT DE LA PARTIE (AFFICHAGE DU DEBUT)

    // if (socket && counter === 0 && countdown === 0) {
    //   socket?.emit('startGame');
    //   setCounter(1);
    // }

    //      RECUP DES DATAS DU BACK VERS LE FRONT POUR AFFICHAGE AU DEBUT DE LA GAME

    if (socket) {
      socket.on("startFriendGame", async (updateroom: Room) => {
        setCounter(1);
        setRoom(updateroom);
      });
    }

    if (socket && !end && countdown <= 0) {
      socket.on("recupMoov", (updatedRoom: Room) => {
        if (room) {
          setPlayer1Pos(updatedRoom.player1Y);
          setPlayer2Pos(updatedRoom.player2Y);
        }
        // setRoom(updatedRoom);
      });
    }

    //      RECUP DES DATAS DES PLAYER MOVES ET DES DEPLACEMENTS DE LA BALLE DEPUIS LE BACK VERS LE FRONT

    if (socket && !end && countdown <= 0) {
      socket.on("ballMoovON", (updateRoom: Room) => {
        if (
          updateRoom.player1 &&
          updateRoom.player2 &&
          updateRoom.player1 !== undefined
        ) {
          setRoom(updateRoom);
          setSpeedBallX(updateRoom.speedX);
          setSpeedBallY(updateRoom.speedY);
          setBallXPos(updateRoom.ballX);
          setBallYPos(updateRoom.ballY);
        }
      });
    }

    if (socket && room && room.end) setEnd(1);

    window.addEventListener("beforeunload", handleBeforeUnload);

    //      CLEAR DES DIFFERENTS EVENT

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (socket) {
        socket.off("recupMoov");
        socket.off("ballMoovON");
        socket.off("recupMoov");
        socket.off("startGame2");
        socket.off("startGame");
      }
    };
  }, [socket, room, end, BallXpos, BallYpos, SpeedBallX, SpeedBallY]);

  useEffect(() => {
    if (socket && !end) {
      socket.on("playerLeave", (room: Room) => {
        setRoom(room);
      });
    }
  });

  useEffect(() => {
    if (socket && end) {
      if (user?.username !== room?.winner && updatelvl === 0) {
        socket?.emit("updateLevelExpELO", user?.id, id);
        setUpdatelvl(1);
      }
    }
  });

  return (
    <div className="pong-game">
      {/* <div className="countdown-container"> */}
      {countdown > 1 && <div className="countdown">{countdown}</div>}
      {countdown === 1 && <div className="countdown ready">Ready ?</div>}
      {countdown === 0 && <div className="countdown start">Start</div>}
      {/* </div> */}
      {user && <h2>Vous êtes connecté en tant que {user.username}</h2>}
      {!end && <button className="buttonseemore" onClick={NavHome}>Quitter la partie</button>}
      {room && room.player1 && room.player2 && (
        <div>
          <p>
            La partie commence entre {room.player1} et {room.player2} !
          </p>
          <div
            style={{
              textAlign: "center",
              fontSize: "24px",
              marginBottom: "10px",
            }}
          >
            {end && (
              <div>
                <h1>Fin de partie !</h1>
                Score - {room.player1} {room.scoreP1} | {room.scoreP2}{" "}
                {room.player2}
                <p>{room.winner} remporte la partie</p>
                <button onClick={NavHome}>Retourner au Home</button>
              </div>
            )}
            {!end && (
              <div>
                Score - {room.player1} {room.scoreP1} | {room.scoreP2}{" "}
                {room.player2}
              </div>
            )}
          </div>
          <div
            className={`player-rect player1`}
            style={{ top: player1Pos }}
          ></div>
          <div
            className={`player-rect player2`}
            style={{ top: player2Pos }}
          ></div>
          <div className="ball" style={{ left: BallXpos, top: BallYpos }}></div>
        </div>
      )}
    </div>
  );
};

export default GameFriend;
