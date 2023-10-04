import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import io, { Socket } from "socket.io-client";
import { User } from "./interfaces";
import icon from "./img/buttoncomp.png";
import logo from "./img/logo42.png";
import chat_pic from "./img/fill.pic.png";
import "./App.css";
import "./style/Home.css";
import "./style/Logout.css";
import { Logout } from "./components/auth/Logout";
import { useAuth } from "./components/auth/AuthProvider";
import { WebsocketContext } from "./WebsocketContext";
import folder from "./img/folder0.png";
import folder1 from "./img/folder2.png";
import folder2 from "./img/folder3.png";
import folder3 from "./img/folder4.png";
import folder4 from "./img/folder5.png";
import folder0 from "./img/folder1.png";
import nav from "./img/buttoncomp.png";
import gaming from "./img/gamingpreview.png";
import love from "./img/42lov.png";
import chatpic from "./img/chatpic.png";
import gradient from "./img/gradient.png";
import Notify from "./Notify";

export const GamePage = () => {
  const socket = useContext(WebsocketContext);
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [queueCount, setQueueCount] = useState<number>(0);
  const [queueCountBonus, setQueueCountBonus] = useState<number>(0);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  let recupStatus = "";
  const [inGame, setInGame] = useState<number>(0);
  const [showNotification, setShowNotification] = useState(false);
  const [notifyMSG, setNotifyMSG] = useState<string>("");
  const [notifyType, setNotifyType] = useState<number>(0);
  const [sender, setSender] = useState<number>(0);

  const handlePlayerSelect = async (player: string) => {
    setSelectedPlayer(player);

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
        recupStatus = recup;
      }
      if (recupStatus !== "INGAME") {
        if (user) socket?.emit("joinQueue", user.id, 0);
        setUser(user);

        socket?.on("queueUpdate", (count: number, id: number) => {
          setQueueCount(count);
          if (count === 2) {
            socket?.emit("updateUserIG", user?.id);
            socket?.emit("createGame");
            setQueueCount(0);
            navigate(`/game/${id}`);
          }
        });
      } else if (recupStatus === "INGAME") {
        setInGame(1);
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des détails de l'utilisateur :",
        error
      );
    }

    return () => {
      if (socket) {
        socket.off("queueUpdate");
      }
    };
  };

  const handlePlayerSelect222 = async (player: string) => {
    setSelectedPlayer(player);

    try {
      if (user) socket?.emit("joinQueue", user.id, 1);
      setUser(user);

      socket?.on("queueUpdateBonus", (count: number) => {
        setQueueCountBonus(count);
        if (count === 2) {
          socket?.emit("updateUserIG", user?.id);
          navigate("/SuperGame");
        }
      });
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des détails de l'utilisateur :",
        error
      );
    }

    return () => {
      if (socket) {
        socket.off("queueUpdate");
      }
    };
  };

  useEffect(() => {
    setTimeout(() => {
      const leftGame = localStorage.getItem("leftGame");
      if (leftGame) {
        setShowNotification(true);
        setNotifyMSG(leftGame);
        setNotifyType(2);
        setSender(0);
      }
      localStorage.removeItem("leftGame");
    }, 2000);

    socket.on("heLeftTheGame", () => {
      localStorage.setItem("leftGame", "Your oppenent has left the game");
    });
  });

  const NavToSoloPong = () => {
    navigate("/solopong");
  };

  const navigateToProfPage = () => {
    navigate(`/users/profile/${user?.id}`);
  };

  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  return (
    <div className="game_img">
      <div>
        {showNotification && (
          <Notify
            message={notifyMSG}
            type={notifyType}
            senderId={sender}
            onClose={handleCloseNotification}
          />
        )}
      </div>
      <button onClick={() => handlePlayerSelect("1")} className="game_img_btn">
        RECHERCHE DE PARTIE
      </button>
      <button
        onClick={() => handlePlayerSelect222("1")}
        className="game_img_btn"
      >
        RECHERCHE DE SUPER PARTIE
      </button>
      <button onClick={() => NavToSoloPong()} className="game_img_btn">
        Mini Jeu
      </button>
      <button onClick={navigateToProfPage} className="game_img_btn">
        My Profile
      </button>
      {(queueCount > 0 || queueCountBonus > 0) && (
        <p>En attente d'autres joueurs...</p>
      )}
      {queueCount === 2 && <p>La partie commence entre Ldinaut et Mcouppe !</p>}
      {inGame === 1 && <p>Deja en game mon reuf !</p>}
    </div>
  );
};

export default GamePage;
