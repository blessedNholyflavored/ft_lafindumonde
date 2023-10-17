import React, { useContext, useEffect, useState } from "react";
import "../../style/Profile.css";
import "../../style/Home.css";
import ProfileBox from "./ProfileBox";
import icon from "../../img/buttoncomp.png";
import logo from "../../img/logo42.png";
import domo from "../../img/domo.png";
import ScoreList from "./ScoreList";
import Friends from "./FriendsList";
import { useAuth } from "../auth/AuthProvider";
import Notify from "../../services/Notify";
import { WebsocketContext } from "../../services/WebsocketContext";
import { GameHistory } from "./GameHistory";
import { useParams } from "react-router-dom";
import nav from "./../../img/buttoncomp.png";
import foldergreen from "../../img/foldergreen.png";
import folderblue from "../../img/folderblue.png";
import folderpink from "../../img/folderpink.png";
import folderyellow from "../../img/folderyellow.png";
import folderwhite from "../../img/folderwhite.png";
import folderviolet from "../../img/folderviolet.png";
import folderred from "../../img/folderred.png";
import { Logout } from "../auth/Logout";
import { useNavigate } from "react-router-dom";
import "@fontsource/ibm-plex-mono";

const Box = (props: any) => {
  const [info, setInfo] = useState<any>(null);
  let [ImgUrl, setImgUrl] = useState<string>("");
  const { user, setUser } = useAuth();
  const [notifyMSG, setNotifyMSG] = useState<string>("");
  const [notifyType, setNotifyType] = useState<number>(0);
  const [sender, setSender] = useState<number>(0);
  const socket = useContext(WebsocketContext);
  const [username, setUsername] = useState<string>("");
  const [showNotification, setShowNotification] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    displayPic();
    fetchUsernameById();

    if (props.type === "info") {
      setInfo(<ProfileBox type={props.type} />);
    } else if (props.type === "friends") {
      setInfo(<Friends type={props.type} />);
    } else if (props.type === "score") setInfo(<ScoreList type={props.type} />);
  }, [props.type, id]);

  async function fetchUsernameById() {
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
        `http://${window.location.hostname}:3000/users/${id}/avatar`,
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

  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  if (socket) {
    socket.on("receiveInvite", (sender: number) => {
      setShowNotification(true);
      setNotifyMSG("you've received a game invitation !");
      setNotifyType(1);
      setSender(sender);
    });
  }

  if (socket) {
    socket.on("friendShipNotif", () => {
      setShowNotification(true);
      setNotifyMSG("you've received a friends request!");
      setNotifyType(0);
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
        <main className="commonmain">
          {showNotification && (
            <Notify
              message={notifyMSG}
              type={notifyType}
              senderId={sender}
              onClose={handleCloseNotification}
            />
          )}

          <div className="fullpage">
            <div className="navbarbox">
              <img src={icon} alt="icon" />
              <h1> PROFIL </h1>
            </div>

            <div className="testingrow">
              <div className="home-profile">
                <p> hi! </p>
                <div className="inside">
                  <img src={ImgUrl} className="homepic" />
                  <button className="homebut"> {username}</button>
                </div>
              </div>
              <div className="boxrowtest">
                <div className="navbarsmallbox">
                  <p className="boxtitle"> INFO </p>
                </div>
                <ProfileBox type="info" />
              </div>
              <div className="boxrowtest">
                <div className="navbarsmallbox">
                  <p className="boxtitle"> Game History </p>
                </div>
                <GameHistory type="info" />
              </div>
              <div className="boxrowtest">
                <div className="navbarsmallbox">
                  <p className="boxtitle"> SCORE </p>
                </div>
                <ScoreList type="score" />
              </div>
            </div>
          </div>
        </main>
        <nav className="commonnav">
          <ul>
            <li className="menu-item">
              <a onClick={navigateToHome}>
                <img
                  src={folderviolet}
                  alt="Menu 3"
                  className="profileNavIcon"
                />
                <p>Home</p>
              </a>
            </li>
            <li className="menu-item">
              <a onClick={() => navToGamePage()}>
                <img src={folderblue} alt="Menu 3" className="profileNavIcon" />
                <p>Game</p>
              </a>
            </li>
            <li className="menu-item">
              <a onClick={navigateToProfPage}>
                <img
                  src={foldergreen}
                  alt="Menu 3"
                  className="profileNavIcon"
                />
                <p>Profile</p>
              </a>
            </li>
            <li className="menu-item">
              <a onClick={navigateToSettings}>
                <img
                  src={folderyellow}
                  alt="Menu 3"
                  className="profileNavIcon"
                />
                <p>Settings</p>
              </a>
            </li>
            <li className="menu-item">
              <a onClick={navigateToFriends}>
                <img
                  src={folderwhite}
                  alt="Menu 3"
                  className="profileNavIcon"
                />
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
    </div>
  );
};

export default Box;
