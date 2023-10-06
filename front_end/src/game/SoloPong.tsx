import React, { useState, useRef, useEffect, useContext } from "react";
import { useAuth } from "../components/auth/AuthProvider";
import { WebsocketContext } from "../WebsocketContext";
import { useNavigate } from "react-router-dom";
import nav from "./../img/buttoncomp.png";
import folder from "./../img/folder0.png";
import folder1 from "./../img/folder2.png";
import folder2 from "./../img/folder3.png";
import folder0 from "./../img/folder1.png";
import folder6 from "./../img/folder4.png";
import { Logout } from "../components/auth/Logout";
import logo from "./../img/logo42.png";

interface MiniScore {
  id: number;
  username: string;
  scoreMiniGame: number;
  place: number;
}

export const MiniGame = () => {
  const [player1, setPlayer1] = useState(0);
  const [player2, setPlayer2] = useState(300);
  const [keyCode, setKeyCode] = useState("");
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const mapy = 400;
  const mapx = 700;
  const ballSpeed = 6;
  const [player1Point, setPoint1] = useState(0);
  const [player2Point, setPoint2] = useState(0);
  const [player1tsc, setPoint1tsc] = useState(0);
  const [player2tsc, setPoint2tsc] = useState(0);
  const [ball, setBall] = useState<{ x: number; y: number }>({
    x: 350,
    y: 200,
  });
  const [ballDir, setBallDir] = useState<{ x: number; y: number }>({
    x: 1,
    y: 0,
  });
  const [end, setEnd] = useState<boolean>(false);
  const { user, setUser } = useAuth();
  const socket = useContext(WebsocketContext);
  const [countdown, setCountdown] = useState(3);
  const [playerScores, setPlayerScores] = useState<MiniScore[]>([]);
  const [counter, setCounter] = useState(0);

  const userId = user?.id;
  const navigate = useNavigate();

  const startCountdown = () => {
    const countdownInterval = setInterval(() => {
      setCountdown((prevCountdown) => prevCountdown - 1);
    }, 1000);

    setTimeout(() => {
      clearInterval(countdownInterval);
      setCounter(1);
    }, 4000);
  };
  useEffect(() => {
    if (countdown !== 0 && counter === 0) {
      startCountdown();
    }
    console.log("ooooooooo:   ", counter);
  }, [counter]);

  async function fetchPlayerScores() {
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/users/mini/${userId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des scores.");
      }
      const data = await response.json();
      // console.log("DANS LEADERBOARD.TSX", data);
      setPlayerScores(data);
    } catch (error) {
      console.error("Erreur:", error);
      return [];
    }
  }
  function navToProfil(id: string) {
    navigate(`/users/profile/${id}`);
  }

  useEffect(() => {
    fetchPlayerScores();
  }, []);

  // Compteur de rebond pour le joueur 1
  const [rebounds, setRebounds] = useState(0);

  const playerMove = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (end) return;
    setKeyCode(e.key);
    const key = e.keyCode;
    const speed = 30;

    if (key === 38 && player2 > 10) {
      setPlayer2(player2 - speed);
    } else if (key === 40 && player2 < mapy - 80) {
      setPlayer2(player2 + speed);
    }
  };

  useEffect(() => {
    if (counter === 1) {
      const interval = setInterval(() => {
        setBall((prevBallPos: { x: number; y: number }) => ({
          x: prevBallPos.x + ballDir.x * ballSpeed,
          y: prevBallPos.y + ballDir.y * ballSpeed,
        }));
      }, 1000 / 60);
      return () => clearInterval(interval);
    }
  }, [ballDir, counter]);

  useEffect(() => {
    if (counter === 1) {
      if (end) return;
      if (ball.y >= mapy - 8 || ball.y <= 0) {
        setBallDir((prevBallDir: { x: number; y: number }) => ({
          ...prevBallDir,
          y: -prevBallDir.y,
        }));
      }
      if (ball.x >= mapx - 8 - 10 || ball.x <= 10) {
        if (
          (ball.x > mapx / 2 &&
            ball.y + 8 >= player2 &&
            ball.y <= player2 + 80) ||
          (ball.x < mapx / 2 &&
            ball.y + 8 >= player1 &&
            ball.y <= player1 + 400)
        ) {
          if (ball.y <= player2 - 20 || ball.y <= player1 - 20)
            setBallDir((prevBallDir: { x: number; y: number }) => ({
              ...prevBallDir,
              y: -prevBallDir.y - 0.25,
            }));
          if (ball.y <= player2 + 20 || ball.y <= player1 + 20)
            setBallDir((prevBallDir: { x: number; y: number }) => ({
              ...prevBallDir,
              y: -prevBallDir.y + 0.3,
            }));
          setBallDir((prevBallDir: { x: number; y: number }) => ({
            ...prevBallDir,
            x: -prevBallDir.x,
          }));

          if (ball.x < mapx / 2) {
            setRebounds((prevRebounds) => prevRebounds + 1);
          }
        } else if (ball.x >= mapx - 8 - 10) {
          setEnd(true);
          socket?.emit("updateScoreMiniGame", rebounds);
          setTimeout(() => {
            fetchPlayerScores();
          }, 500);
        }
      }
    }
  }, [ball, counter]);

  useEffect(() => {
    if (gameAreaRef.current) {
      gameAreaRef.current.focus();
    }
  }, [counter]);

  const restartGame = () => {
    setBall((prevBallPos: { x: number; y: number }) => ({
      x: 350,
      y: 200,
    }));
    setPlayer2(300);
    setCountdown(3);
    setCounter(0);
    setEnd(false);
    setRebounds(0);
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

  return (
    <div>
      <header>
    <div>
      <img src={nav} alt="Menu 1" />
    </div>
    <h1>TRANSCENDENCE</h1>
  </header>
  <div className="flex-bg">
    <main style={{color:"black"}}>
    <div className="parent">

<div className="div1">
<div className="navbarbox">
        <img src={nav}  alt="icon" />
           <h1> hi! </h1>
           </div>
      <p>Hello {user?.username}</p>
      {countdown > 1 && <div className="countdown">{countdown}</div>}
      {countdown === 1 && <div className="countdown ready">Ready ?</div>}
      {countdown === 0 && <div className="countdown start">Start</div>}
      <div
        style={{ textAlign: "center", fontSize: "24px", marginBottom: "10px" }}
      >
        {end && (
          <div>
            <p className="text-game">
              game's over. total rebound from player: {rebounds}
            </p>
            <button className="buttongame" onClick={restartGame}>restart</button>
          </div>
        )}
      </div>
      </div>
      
      <div style={{ float: "right" }} className="div3">
      <div className="navbarbox">
           <h1> score </h1>
           </div>
        <div className="tablo">
          <table >
            <thead>
              <tr>
                <th>#</th>
                <th>Username</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {playerScores. map((tab: MiniScore, index: number) => (
                <tr key={index}>
                  <td>{tab.place}</td>
                  <td>{tab.username}</td>
                  <td>{tab.scoreMiniGame}</td>
                  <td>
                    <button className="buttonprfl" onClick={() => navToProfil(tab.id.toString())}>
                      see profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* { countdown <= 0 && ( */}
      <div
      className="div2"
        ref={gameAreaRef}
        tabIndex={0}
        onKeyDown={playerMove}
        style={{
          width: mapx,
          height: mapy,
          // border: "7px solid black",
          position: "relative",
        }}
      >
        {!end && (
          <>
            <div id="moncercle" style={{ top: ball.y, left: ball.x }}></div>
            <div
              style={{
                position: "absolute",
                width: 10,
                height: 400,
                // backgroundColor: "blue",
                top: player1,
                left: 0,
              }}
            >
              
            </div>
            <div
              style={{
                position: "absolute",
                width: 10,
                height: 80,
                backgroundColor: "red",
                top: player2,
                right: 0,
              }}
            ></div>
            <p>Compteur de rebonds: {rebounds}</p>
          </>
        )}
      </div>
       {/* )} */}
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

export default MiniGame;
