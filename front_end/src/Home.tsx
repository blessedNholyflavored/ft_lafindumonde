import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Socket } from "socket.io-client";
import logo from "./img/logo42.png";
import "./App.css";
import "./style/Home.css";
import "./style/Logout.css";
import { Logout } from "./components/auth/Logout";
import { useAuth } from "./components/auth/AuthProvider";
import { WebsocketContext } from "./services/WebsocketContext";
import foldergreen from "./img/foldergreen.png";
import folderblue from "./img/folderblue.png";
import folderpink from "./img/folderpink.png";
import folderyellow from "./img/folderyellow.png";
import folderwhite from "./img/folderwhite.png";
import folderviolet from "./img/folderviolet.png";
import folderred from "./img/folderred.png";
import nav from "./img/buttoncomp.png";
import gaming from "./img/gamingpreview.png";
import love from "./img/42lov.png";
import chatpic from "./img/chatpic.png";
import Notify from "./services/Notify";

interface HomeProps {
  socket: Socket | null;
}

const Home: React.FC<HomeProps> = () => {
  const [notifyMSG, setNotifyMSG] = useState<string>("");
  const [notifyType, setNotifyType] = useState<number>(0);
  const [sender, setSender] = useState<number>(0);
  const [username, setUsername] = useState<string>("");

  const socket = useContext(WebsocketContext);
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  // const [recupStatus, setStatus] = useState<string>('');
  let [ImgUrl, setImgUrl] = useState<string>("");
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    displayPic();
    fetchUsernameById();
  }, []);

  async function fetchUsernameById() {
    const id = user?.id;

    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/users/${id}/username`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error(
          `Erreur lors de la récupération de l'utilisateur avec l'ID ${id}.`
        );
      }
      const userData = await response.text();
      setUsername(userData);
    } catch (error) {
      console.error("Erreur :", error);
      return null;
    }
  }

  const displayPic = async () => {
    const userId = user?.id;
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
          setImgUrl(pictureURL);
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
              setImgUrl(absoluteURL);
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

  if (socket) {
    socket.on("coucou", () => {
      socket.emit("coucou");
    });
  }

  if (socket) {
    socket.on("friendShipNotif", () => {
      setShowNotification(true);
      setNotifyMSG("Tu as recu une demande d'ami");
      setNotifyType(0);
    });
  }

  if (socket) {
    socket.on("receiveInvite", (sender: number) => {
      setShowNotification(true);
      setNotifyMSG("Tu as recu une invitation pour une partie");
      setNotifyType(1);
      setSender(sender);
    });
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

  const NavToSoloPong = () => {
    navigate("/solopong");
  };

  const navigateToFriends = () => {
    navigate("/friends");
  };

  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  const navigateToSettings = () => {
    navigate("/settings");
  };
  const navToGamePage = () => {
    navigate("/gamePage");
  };

  return (
    <>
      {/* <body> */}
      <header>
        <div>
          <img src={nav} alt="Menu 1" />
        </div>
        <h1>TRANSCENDENCE</h1>
      </header>
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
      <div className="flex-bg">
        <main className="commonmain">
          <div className="home">
            <p> HOME </p>
            <div className="inside">
              <img src={ImgUrl} className="homepic" />
              <button className="homebut">WELCOME {username}</button>
            </div>
          </div>

          <div className="chat" onClick={navigateToChat}>
            <p> CHAT WITH FRIENDS </p>
            <img src={chatpic} />
          </div>

          <div className="troll">
            <p> 42 LOVES U </p>
            <img src={love} />
          </div>

          <div className="game" onClick={() => navToGamePage()}>
            <p> PLAY THE GAME </p>
            <img src={gaming} />
          </div>
        </main>
        <nav className="commonnav">
          <ul>
            <li className="menu-item">
              <a onClick={navigateToHome}>
                <img src={foldergreen} alt="Menu 3" />
                <p>Home</p>
              </a>
            </li>
            <li className="menu-item">
              <a onClick={() => navToGamePage()}>
                <img src={folderblue} alt="Menu 3" />
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
            <li className="menu-item">
              <a onClick={navigateToChat}>
                <img src={folderred} alt="Menu 3" />
                <p>Chat</p>
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
      {/* </body> */}

      {/* <div className="main_box">
		<div className="navbarmainpage">
			<img src={icon} className="buttonnav" alt="icon" />
			<p className="titlemainpage"> TRANSCENDENCE </p>
		</div>
		<div className="home_box">
			<div className="group_box hello_box">
				<div className="navbarsmallbox">
					<p className="boxtitle"> HOME </p>
				</div>
				<div className="home_img">
				</div>
			</div>
			<div className="group_box chat_box">
				<div className="navbarsmallbox">
					<p className="boxtitle"> CHAT WITH FRIENDS </p>
				</div>
				<div className="chat_btn">
					<button onClick={ navigateToChat }>Chat Now !</button>
				</div>
			</div>
      <div className="group_box chat_box">
				<div className="navbarsmallbox">
					<p className="boxtitle"> FRIENDS </p>
				</div>
				<div className="chat_btn">
					<button onClick={ navigateToFriends }>Friends !</button>
				</div>
			</div>
			<div className="group_box game_box">
				<div className="navbarsmallbox">
					<p className="boxtitle"> PLAY THE GAME </p>
				</div>
				<div className="game_img">
				    <button onClick={() => handlePlayerSelect('1')} className="game_img_btn">RECHERCHE DE PARTIE</button>
				    <button onClick={() => handlePlayerSelect222('1')} className="game_img_btn">RECHERCHE DE SUPER PARTIE</button>
				    <button onClick={() => NavToSoloPong()} className="game_img_btn">Mini Jeu</button>
					<button onClick={navigateToProfPage} className="game_img_btn">My Profile</button>
				    	{(queueCount > 0 || queueCountBonus > 0) &&  (
    						<p>En attente d'autres joueurs...</p>
  						)}
  						{queueCount === 2 && (
    						<p>La partie commence entre Ldinaut et Mcouppe !</p>
  						)}
              { inGame === 1 && (
                <p>Deja en game mon reuf !</p>
              )}
			    </div>
			</div>
			<div className="group_box achiev_box">
				<div className="navbarsmallbox">
					<p className="boxtitle"> 42 LOVES U </p>
				</div>
				<div className="achiev_img">
				</div>
			</div>
		</div>
		<div className="footer_box">
			<button className="logoutBtn" onClick={() => Logout({user, setUser})}>LOG OUT </button>
			<img src={logo} className="logo" alt="icon" />
		</div>
	</div> */}
    </>
  );
};

export default Home;

/*
  return (
    <div>
      <h2>Les WebSocket c'est dla merde</h2>
      <button onClick={() => handlePlayerSelect('1')}>RECHERCHE DE PARTIE</button>
      <button onClick={navigateToProfPage}>Aller à la page Prof</button>
      <button onClick={() => handlePlayerSelect222('1')}>Rdfsfvdsvfdsvfdfd</button>


      {queueCount > 0 && (
        <p>En attente d'autres joueurs...</p>
      )}
      {queueCount === 2 && (
        <p>La partie commence entre Ldinaut et Mcouppe !</p>
      )}
	  		<div className="logoutBox">
			<button className="logoutBtn" onClick={() => Logout({user, setUser})}>LOG OUT </button>
		</div>
    </div>
  );*/
