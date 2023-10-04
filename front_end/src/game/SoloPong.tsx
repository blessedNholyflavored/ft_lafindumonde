import React, { useState, useRef, useEffect, useContext } from "react";
import { useAuth } from "../components/auth/AuthProvider";
import { WebsocketContext } from "../WebsocketContext";
import { useNavigate } from "react-router-dom";

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
  const [playerScores, setPlayerScores] = useState<MiniScore[]>([]);

  const userId = user?.id;
  const navigate = useNavigate();

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
    const interval = setInterval(() => {
      setBall((prevBallPos: { x: number; y: number }) => ({
        x: prevBallPos.x + ballDir.x * ballSpeed,
        y: prevBallPos.y + ballDir.y * ballSpeed,
      }));
    }, 1000 / 60);
    return () => clearInterval(interval);
  }, [ballDir]);

  useEffect(() => {
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
        (ball.x < mapx / 2 && ball.y + 8 >= player1 && ball.y <= player1 + 400)
      ) {
        if (ball.y <= player2 - 20 || ball.y <= player1 - 20)
          setBallDir((prevBallDir: { x: number; y: number }) => ({
            ...prevBallDir,
            y: -prevBallDir.y - 0.15,
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
    if (ball.x < 0) {
      ball.x = 350;
      ball.y = 200;
      setBall((prevBallPos: { x: number; y: number }) => ({
        x: 350,
        y: 200,
      }));
      setPoint2((prevScore: number) => prevScore + 1);
      setPoint2tsc((prevScore: number) => prevScore + 1);
    }
    if (ball.x >= mapx) {
      ball.x = 350;
      ball.y = 200;
      setBall((prevBallPos: { x: number; y: number }) => ({
        x: 350,
        y: 200,
      }));
      setPoint1((prevScore: number) => prevScore + 1);
      setPoint1tsc((prevScore: number) => prevScore + 1);
    }
  }, [ball]);

  useEffect(() => {
    if (gameAreaRef.current) {
      gameAreaRef.current.focus();
    }
  }, []);

  const restartGame = () => {
    window.location.reload();
  };

  return (
    <div>
      <p>Hello {user?.username}</p>
      <h1>KeyCode: {keyCode}</h1>
      <h1>
        {user?.username}: {player2}
      </h1>
      <div
        style={{ textAlign: "center", fontSize: "24px", marginBottom: "10px" }}
      >
        {end && (
          <div>
            <p>
              La partie est terminée. Nombre de rebonds Joueur 1 : {rebounds}
            </p>
            <button onClick={restartGame}>Recommencer</button>
          </div>
        )}
      </div>
      <div style={{ float: "right" }}>
        <h2>Scores des joueurs :</h2>
        <div>
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Username</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {playerScores.map((tab: MiniScore, index: number) => (
                <tr key={index}>
                  <td>{tab.place}</td>
                  <td>{tab.username}</td>
                  <td>{tab.scoreMiniGame}</td>
                  <td>
                    <button onClick={() => navToProfil(tab.id.toString())}>
                      Voir Profil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div
        ref={gameAreaRef}
        tabIndex={0}
        onKeyDown={playerMove}
        style={{
          width: mapx,
          height: mapy,
          border: "7px solid black",
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
                backgroundColor: "blue",
                top: player1,
                left: 0,
              }}
            ></div>
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
    </div>
  );
};

export default MiniGame;
