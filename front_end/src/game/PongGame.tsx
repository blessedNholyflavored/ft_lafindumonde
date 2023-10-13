import React, { useCallback, useContext, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { Room } from "../interfaces/interfaces"; // Assurez-vous d'importer les interfaces correctes
import "../App.css";
import "../style/Home.css";
import "../style/Profile.css";
import "../style/Game.css";
import "../App.css";
import { useAuth } from "../components/auth/AuthProvider";
import { useNavigate, useParams } from "react-router-dom";
import { WebsocketContext } from "../services/WebsocketContext";
import nav from "./../img/buttoncomp.png";
import foldergreen from "./../img/foldergreen.png";
import folderpink from "./../img/folderpink.png";
import folderyellow from "./../img/folderyellow.png";
import folderwhite from "./../img/folderwhite.png";
import folderviolet from "./../img/folderviolet.png";
import icon from "./../img/buttoncomp.png";
import logo from "./../img/logo42.png";
import { Logout } from "../components/auth/Logout";

const PongGame: React.FC = () => {
  const { id } = useParams();
  const [room, setRoom] = useState<Room | null>(null);
  const [counter, setCounter] = useState(0);
  const [end, setEnd] = useState<number>(0);
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
  const [playerId2, setPlayerId2] = useState<number>(0);
  const [mapx, setMapx] = useState<number>(window.innerWidth);
  const [mapy, setMapy] = useState<number>(window.innerHeight);
  const [countdown, setCountdown] = useState(3);
  const [checkstatus, setCheckStatus] = useState(false);
  let [ImgUrlP1, setImgUrlP1] = useState<string>("");
  let [ImgUrlP2, setImgUrlP2] = useState<string>("");
  let [usernameP1, setUsernameP1] = useState<string>("");
  let [usernameP2, setUsernameP2] = useState<string>("");

  const handleBeforeUnload = useCallback(
    async (e: BeforeUnloadEvent) => {
      if (countdown > 0 && countdown < 2) {
        socket?.emit("reloadCountdown", id);
        setCountdown(-999);
      }
      socket?.emit("leaveGame", id);
      socket?.emit("changeStatus");
      setEnd(1);
    },
    [countdown, id, socket]
  );

  const startGameFCT = useCallback(async () => {
    if (socket && counter === 0) {
      socket?.emit("startGame", id);
      setCounter(1);
    }
  }, [counter, id, socket]);

  const startCountdown = useCallback(async () => {
    const countdownInterval = setInterval(() => {
      if (room?.end !== 1) setCountdown((prevCountdown) => prevCountdown - 1);
    }, 1000);

    setTimeout(() => {
      clearInterval(countdownInterval);
      startGameFCT();
      setCountdown(-1);
    }, 4000);
  }, [room?.end, startGameFCT]);

  useEffect(() => {
    if (countdown <= 0)
      return ;
    if (countdown === 3) {
      setTimeout(() => {
        socket.emit("recupRoomAtStart", id);
      }, 300);
    }
    if (countdown > 0 && end === 0) {
      startCountdown();
    }
    return () => {
      if (socket)
        socket.off("recupRoomAtStart");
    }
  }, [startCountdown, end, id, socket]);

  const handleKeyDown = useCallback(
    async (event: KeyboardEvent) => {
      if ((event.key === "ArrowUp" || event.key === "ArrowDown") && !end) {
        socket?.emit("movePoint", user?.username, event.key, room?.roomID);
      }
    },
    [end, room?.roomID, socket, user?.username]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [socket, room, user, handleKeyDown]);

  const NavHome = () => {
    socket.emit("changeStatus", (socket: Socket) => {});
    navigate("/gamePage");
    window.location.reload();
  };

  const catchPic = useCallback(async () => {
    if (socket) {
      if (usernameP1 === user?.username) {
        socket.emit("AskForIdOpponent", id, 1);
      } else if (usernameP2 === user?.username) {
        socket.emit("AskForIdOpponent", id, 2);
      }
      socket.on("recupIdOpponent", (opponentId: number) => {
        if (usernameP1 === user?.username) {
          setPlayerId2(opponentId);
          displayPic(user?.id as number, 1);
          displayPic(opponentId, 2);
        }
        if (usernameP2 === user?.username) {
          displayPic(user?.id as number, 2);
          displayPic(opponentId, 1);
        }
      });
    }
  }, [id, socket, user?.id, usernameP1, usernameP2, user?.username]);

  const getstatus = useCallback(async () => {
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
  }, [navigate, user?.id]);

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

    if (socket && id && room && countdown <= 0) {
      socket.emit("gameFinished", id);
    }

    if (usernameP1 && usernameP2 && countdown > 0) catchPic();

    if (socket && countdown > 0) {
      socket.on("sendRoomAtStart", (recuproom: Room) => {
        setUsernameP1(recuproom.player1 as string);
        setUsernameP2(recuproom.player2 as string);
      });
    }

    //      CREATION DU MODEL DE LA GAME DANS LA DB

    //      LANCEMENT DE LA PARTIE (AFFICHAGE DU DEBUT)

    //      RECUP DES DATAS DU BACK VERS LE FRONT POUR AFFICHAGE AU DEBUT DE LA GAME

    if (socket) {
      socket.on("startGame2", async (updateroom: Room) => {
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
        socket.off("sendRoomAtStart");
        socket.off("heLeftTheGame");
        socket.off("gameFinished");
        socket.off("gameIsDone");
        socket.off("reloadCountdown");
      }
    };
  }, [
    socket,
    room,
    end,
    BallXpos,
    BallYpos,
    SpeedBallX,
    SpeedBallY,
    usernameP1,
    usernameP2,
    countdown,
    catchPic,
    checkstatus,
    getstatus,
    handleBeforeUnload,
    id,
  ]);

  useEffect(() => {
    if (socket && !end) {
      return () => {
        socket.emit("leaveGame", id);
      };
    }
  }, [socket, end, id]);

  useEffect(() => {
    if (socket && !end) {
      socket.on("playerLeave", (room: Room) => {
        setRoom(room);
      });
    }
  });

  useEffect(() => {
    if (socket && end) {
      if (user?.username === room?.winner && updatelvl === 0) {
        socket?.emit("updateLevelExpELO", user?.id, playerId2, id);
        setUpdatelvl(1);
      }
    }
  },[end, id, playerId2, room?.winner, socket, updatelvl, user?.id, user?.username]);

  const navigateToHome = () => {
    navigate("/");
  };

  const navigateToProfPage = () => {
    navigate(`/users/profile/${user?.id}`);
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

  const displayPic = async (userId: number, pos: number) => {
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/users/${userId}/avatar`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (response.ok) {
        const pictureURL = await response.text();
        if (pictureURL.includes("https")) {
          if (pos === 1) setImgUrlP1(pictureURL);
          if (pos === 2) setImgUrlP2(pictureURL);
        } else {
          try {
            const response = await fetch(
              `http://${window.location.hostname}:3000/users/uploads/${pictureURL}`,
              {
                method: "GET",
                credentials: "include",
              }
            );
            if (response.ok) {
              const blob = await response.blob();
              const absoluteURL = URL.createObjectURL(blob);
              if (pos === 1) setImgUrlP1(absoluteURL);
              if (pos === 2) setImgUrlP2(absoluteURL);
            }
          } catch (error) {
            console.error(error);
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleResize = () => {
    setMapx(window.innerWidth);
    setMapy(window.innerHeight);
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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
          <div className="fullpage ponggame">
            <div className="navbarbox">
              <img src={icon} alt="icon" />
              <h1> game </h1>
            </div>

            <div id="boxes">
              <div id="leftbox">
                {ImgUrlP1 && (
                  <div>
                    <h2>{usernameP1}</h2>
                    <img src={ImgUrlP1} className="avatar" alt="" />
                  </div>
                )}
              </div>
              <div
                id="middlebox"
                style={{ width: mapx / 2, height: mapy / 3.5 }}
              >
                <div className="countdownstyle ">
                  {countdown > 1 && (
                    <div className="countdown">{countdown}</div>
                  )}
                  {countdown === 1 && (
                    <div className="countdown ready">Ready ?</div>
                  )}
                  {countdown === 0 && (
                    <div className="countdown start">Start</div>
                  )}
                </div>
                <div
                  className="pong-game"
                  style={{
                    color: "black",
                    width: mapx / 2,
                    height: mapy / 3.5,
                  }}
                >
                  {/* <div className="countdown-container"> */}
                  {/* </div> */}
                  {/* {user && (
                    <button className="buttonseemore">
                      you are currently logged as {user.username}
                    </button>
                  )} */}
                  {/* {!end && (
                    <button className="buttonseemore" onClick={NavHome}>
                      leave the game
                    </button>
                  )} */}
                  {room && room.player1 && room.player2 && (
                    <div>
                      <div
                        style={{
                          textAlign: "center",
                          fontSize: "24px",
                          marginBottom: "10px",
                        }}
                      >
                        {end === 1 && (
                          <div>
                            {room.winner === user?.username && (
                              <h1>Victory !</h1>
                            )}
                            {room.winner !== user?.username && (
                              <h1>Game over !</h1>
                            )}
                            final score
                            <br></br>
                            <b>{room.player1}</b> {room.scoreP1} |{" "}
                            {room.scoreP2} <b>{room.player2}</b>
                            <p>{room.winner} wins!</p>
                          </div>
                        )}
                        {end === 0 && (
                          <div>
                            score - {room.player1} {room.scoreP1} |{" "}
                            {room.scoreP2} {room.player2}
                          </div>
                        )}
                      </div>
                      <div
                        className={`player-rect player1`}
                        style={{
                          top: (player1Pos * mapy) / 3.5 / 400,
                          height: (100 * mapy) / 3.5 / 400,
                        }}
                      ></div>
                      <div
                        className={`player-rect player2`}
                        style={{
                          top: (player2Pos * mapy) / 3.5 / 400,
                          height: (100 * mapy) / 3.5 / 400,
                        }}
                      ></div>
                      <div
                        className="ball"
                        style={{
                          left: (BallXpos * mapx) / 2 / 700,
                          top: (BallYpos * mapy) / 3.5 / 400,
                        }}
                      ></div>
                    </div>
                  )}
                </div>
                <button
                  className="buttonseemore backto"
                  style={{ marginBottom: "5px" }}
                  onClick={NavHome}
                >
                  back to gamepage
                </button>
              </div>

              <div id="rightbox">
                {ImgUrlP2 && (
                  <div>
                    <h2>{usernameP2}</h2>
                    <img src={ImgUrlP2} className="avatar" alt="Menu 3" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        <nav>
          <ul>
            <li className="menu-item">
              <a onClick={navigateToHome}>
                <img src={folderviolet} alt="Menu 3" />
                <p>Home</p>
              </a>
            </li>
            <li className="menu-item">
              <a onClick={() => navToGamePage()}>
                <img src={foldergreen} alt="Menu 3" />
                <p>Game</p>
              </a>
            </li>
            <li className="menu-item">
              <a onClick={navigateToProfPage}>
                <img src={folderpink} alt="Menu 3" />
                <p>Profile</p>
              </a>
            </li>
            <li className="menu-item">
              <a onClick={navigateToSettings}>
                <img src={folderyellow} alt="Menu 3" />
                <p>Settings</p>
              </a>
            </li>
            <li className="menu-item">
              <a onClick={navigateToFriends}>
                <img src={folderwhite} alt="Menu 3" />
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

export default PongGame;
