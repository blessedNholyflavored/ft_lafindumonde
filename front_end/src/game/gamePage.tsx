import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import io, { Socket } from "socket.io-client";
import { User } from "../interfaces";
import icon from "./../img/buttoncomp.png";
import chat_pic from "./img/fill.pic.png";
import "../App.css";
import "../style/Home.css";
import "../style/Game.css";
import "../style/Logout.css";
import { Logout } from "../components/auth/Logout";
import { useAuth } from "../components/auth/AuthProvider";
import { WebsocketContext } from "../WebsocketContext";

import nav from "./../img/buttoncomp.png";
import gaming from "./img/gamingpreview.png";
import chatpic from "./img/chatpic.png";
import gradient from "./img/gradient.png";
import Notify from "../Notify";
import folder from "./../img/folder0.png";
import folder1 from "./../img/folder2.png";
import folder2 from "./../img/folder3.png";
import folder0 from "./../img/folder1.png";
import folder6 from "./../img/folder4.png";
import logo from "./../img/logo42.png";
import pink from "./../img/drivepink.png";
import yellow from "./../img/driveyellow.png";
import blue from "./../img/driveblue.png";
import green from "./../img/drivegreen.png";
import sadpepe from "./../img/sadpepe.png";
import sponge from "./../img/sponge.jpg";

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
        console.log(recup);
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

      socket?.on("queueUpdateBonus", (count: number, id: number) => {
        setQueueCountBonus(count);
        if (count === 2) {
          socket?.emit("updateUserIG", user?.id);
          socket?.emit("createGame");
          navigate(`/SuperGame/${id}`);
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

  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  const navigateToHome = () => {
    navigate("/");
  };

  const navigateToProfPage = () => {
    navigate(`/users/profile/${user?.id}`);
  };

  const navigateToChat = () => {
    navigate("/chat");
  };

  const navigateToFriends = () => {
    navigate("/friends");
  };

  const navigateToSettings = () => {
    navigate("/settings");
  };
  const navToGamePage = () => {
    navigate("/gamePage");
  };

  const navToLeaderboard = () => {
    navigate("/leaderboard");
  };

  return (
    <div>
      <header>
        <div>
          <img src={nav} alt="Menu 1" />
        </div>
        <h1>TRANSCENDENCE</h1>
      </header>
      <div className="flex-bg">
        <main>
          <div className="fullpage">
            <div className="navbarbox">
              <img src={icon} alt="icon" />
              <h1> Game </h1>
            </div>

            <div className="gamecss">
              <div className="trollgame">
                <p> 42 LOVES U </p>
                <img src={sadpepe} />
              </div>

              <div className="trollgame2">
                <p> it was so hard </p>
                <img src={sponge} />
              </div>

              <div className="game1">
                <p> PLAY THE GAME </p>
                <div className="gamecss">
                  <div
                    className="column"
                    onClick={() => handlePlayerSelect("1")}
                  >
                    <img src={pink} alt="Menu 3" />
                    <button className="game_img_btn">Quick play</button>
                  </div>
                  <div
                    className="column"
                    onClick={() => handlePlayerSelect222("1")}
                  >
                    <img src={blue} alt="Menu 3" />
                    <button className="game_img_btn">Ranked play</button>
                  </div>

                  <div className="column" onClick={() => NavToSoloPong()}>
                    <img src={green} alt="Menu 3" />
                    <button className="game_img_btn">Solo game</button>
                  </div>
                  <div className="column" onClick={() => navToLeaderboard()}>
                    <img src={yellow} alt="Menu 3" />

                    <button className="game_img_btn"> leaderboard</button>
                    {(queueCount > 0 || queueCountBonus > 0) && (
                      <p>loading...</p>
                    )}
                    {queueCount === 2 && (
                      <p>La partie commence entre Ldinaut et Mcouppe !</p>
                    )}
                    {inGame === 1 && <p>Deja en game mon reuf !</p>}
                  </div>
                </div>
              </div>

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
            </div>
          </div>
        </main>
        <nav>
          <ul>
            <li className="menu-item">
              <a onClick={navigateToHome}>
                <img src={folder6} alt="Menu 3" />
                <p>Home</p>
              </a>
            </li>
            <li className="menu-item">
              <a onClick={() => navToGamePage()}>
                <img src={folder2} alt="Menu 3" />
                <p>Game</p>
              </a>
            </li>
            <li className="menu-item">
              <a onClick={navigateToProfPage}>
                <img src={folder1} alt="Menu 3" />
                <p>Profile</p>
              </a>
            </li>
            <li className="menu-item">
              <a onClick={navigateToSettings}>
                <img src={folder} alt="Menu 3" />
                <p>Settings</p>
              </a>
            </li>
            <li className="menu-item">
              <a onClick={navigateToFriends}>
                <img src={folder0} alt="Menu 3" />
                <p>Friends</p>
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <footer>
        <button className="logoutBtn" onClick={() => Logout({ user, setUser })}>
          LOG OUT{" "}
        </button>
        <img src={logo} className="logo" alt="icon" />
      </footer>
    </div>
  );
};

export default GamePage;
