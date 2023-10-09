import React, { useState, useEffect } from "react";
import { useAuth } from "../components/auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { Logout } from "../components/auth/Logout";
import nav from "../img/buttoncomp.png";
import logo from "../img/logo42.png";
import icon from "../img/buttoncomp.png";
import foldergreen from "../img/foldergreen.png";
import folderblue from "../img/folderblue.png";
import folderpink  from "../img/folderpink.png";
import folderyellow from "../img/folderyellow.png";
import folderwhite from "../img/folderwhite.png";
import folderviolet from "../img/folderviolet.png";

import "../style/Profile.css";
import "../style/Home.css";
import "../style/Leaderboard.css";

interface PlayerScore {
  place: number;
  username: string;
  ELO: number;
  id: number;
  rank: string;
  pictureURL: string;
}

export const Classement = () => {
  const [playerScores, setPlayerScores] = useState<PlayerScore[]>([]);
  const [first, setFirst] = useState<PlayerScore>();
  const [second, setSecond] = useState<PlayerScore>();
  const [third, setThird] = useState<PlayerScore>();
  const { user, setUser } = useAuth();
  const userId = user?.id;
  const navigate = useNavigate();
  const [imgUrl, setImgUrl] = useState<string>("");

  useEffect(() => {
    fetchPlayerScores();
  }, []);

  const displayPic = async (userId: number) => {
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
          return pictureURL;
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
              return pictureURL;
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

  async function fetchPlayerScores() {
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/users/leaderboard/${userId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des scores.");
      }
      const data = await response.json();
      const updatedGameData = [...data];
      for (let i: number = 0; i <= updatedGameData.length; ++i) {
        try {
          const response = await fetch(
            `http://${window.location.hostname}:3000/users/${updatedGameData[i].id}/rank`,
            {
              method: "GET",
              credentials: "include",
            }
          );
          const respondePicture = await displayPic(updatedGameData[i].id);
          if (response.ok) {
            updatedGameData[i].rank = await response.text();
            updatedGameData[i].pictureURL = respondePicture;
          }
        } catch (error) {}
        if (i === 0) setFirst(updatedGameData[i]);
        if (i === 1) setSecond(updatedGameData[i]);
        if (i === 2) setThird(updatedGameData[i]);
      }
      setPlayerScores(updatedGameData);
    } catch (error) {
      console.error("Erreur:", error);
    }
  }

  function navToProfil(id: string) {
    navigate(`/users/profile/${id}`);
  }
  const navigateToHome = () => {
    navigate("/");
  };

  const navigateToProfPage = () => {
    navigate(`/users/profile/${user?.id}`);
  };

  const navigateToChat = () => {
    navigate("/chat");
  };

  // const NavToSoloPong = () => {
  //   navigate("/solopong");
  // };

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
    <>
      <header>
        <div>
          <img src={nav} alt="Menu 1" />
        </div>
        <h1>TRANSCENDENCE</h1>
      </header>

      <div className="flex-bg">
        <main>
          <div className="fullpage2">
            <div className="navbarbox">
              <img src={icon} alt="icon" />
              <h1> LEADERBOARD </h1>
            </div>
            {/* <div>
              {playerScores.map((tab: PlayerScore, index: number) => (
                  <div key={index}>
                    {tab.place === 1 && <div>{setFirst(tab) as any}</div>}
                    {tab.place === 2 && <div>{setSecond(tab) as any}</div>}
                    {tab.place === 3 && <div>{setThird(tab) as any}</div>}
                  </div>
              ))}
            </div> */}

            <div className="container podium">
              <div className="podium__item">
                <p className="podium__city"  >{second?.username}</p>
                <img src={second?.pictureURL} className="avatar"></img>

                <div className="podium__rank second">2</div>
              </div>
              <div className="podium__item">
                <p className="podium__city"  >{first?.username}</p>
                <img src={first?.pictureURL} className="avatar"></img>

                <div className="podium__rank first">
                  <svg
                    className="podium__number"
                    viewBox="0 0 27.476 75.03"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g transform="matrix(1, 0, 0, 1, 214.957736, -43.117417)">
                      <path
                        className="st8"
                        d="M -198.928 43.419 C -200.528 47.919 -203.528 51.819 -207.828 55.219 C -210.528 57.319 -213.028 58.819 -215.428 60.019 L -215.428 72.819 C -210.328 70.619 -205.628 67.819 -201.628 64.119 L -201.628 117.219 L -187.528 117.219 L -187.528 43.419 L -198.928 43.419 L -198.928 43.419 Z"
                        style={{ fill: "black" }}
                      />
                    </g>
                  </svg>
                </div>
              </div>
              <div className="podium__item">
                <p className="podium__city"  style={{backgroundColor: "black",}}>{third?.username}</p>
                <img src={third?.pictureURL} className="avatar"></img>

                <div className="podium__rank third">3</div>
              </div>
            </div>

            <div className="leaderboard">
              <table className="leadertab">
                <thead>
                <br></br>
                  <tr>
                    <th>Rank</th>
                    <th>Username</th>
                    <th>Elo</th>
                    <th>Division</th>
                  </tr>
                </thead>
                {/* // <tbody >
                {playerScores.map((tab: PlayerScore, index: number) => (
                  <tr key={index}>
                    <td>{tab.place}</td>
                    <td>{tab.username}</td>
                    <td>{tab.ELO}</td>
                    <td>{tab.rank}</td>
                    <td>
                      <button className="buttonleader" onClick={() => navToProfil(tab.id.toString())}>
                        see profile
                      </button>
                    </td>
                  </tr> */}
                {/* </thead> */}
                <tbody>
                  {playerScores.map((tab: PlayerScore, index: number) => (
                    <tr key={index}>
                      <td>{tab.place}</td>
                      <td>{tab.username}</td>
                      <td>{tab.ELO}</td>
                      <td>{tab.rank}</td>
                      <td>
                        <button
                          className="buttonleader"
                          onClick={() => navToProfil(tab.id.toString())}
                        >
                          see profile
                        </button>
                      </td>
                    </tr>
                  ))}
                  <br></br>
                </tbody>
              </table>
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
    </>
  );
};

export default Classement;
