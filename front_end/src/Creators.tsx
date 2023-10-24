import logo from "./img/logo42.png";
import { Link, useNavigate } from "react-router-dom";
import "./style/Profile.css";
import "./style/Home.css";

import { Logout } from "./components/auth/Logout";
import { useAuth } from "./components/auth/AuthProvider";

import icon from "./img/buttoncomp.png";
//import lost from "lost.gif";
import foldergreen from "./img/foldergreen.png";
import folderpink from "./img/folderpink.png";
import folderyellow from "./img/folderyellow.png";
import folderwhite from "./img/folderwhite.png";
import folderviolet from "./img/folderviolet.png";
import folderred from "./img/folderred.png";
import giticon from "./img/giticon.png";
import lk from "./img/lkhamlac.jpg";
import mc from "./img/mcouppe.jpg";
import ld from "./img/ldinaut.jpg";
import jt from "./img/jtaravel.jpg";

export const Creators = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

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
  const navigateToChat = () => {
    navigate("/chat");
  };

  return (
    <>
      <header>
        <h1>TRANSCENDENCE</h1>
      </header>
      <div className="flex-bg" style={{ color: "black" }}>
        <main>
          <div className="fullpage">
            <div className="navbarbox">
              <img src={icon} alt="icon" />
              <h1> Creators </h1>
            </div>
            <br />
            <br />
            <div className="avatarbis-container">
              <img src={lk} alt="" className="avatarbis" style={{
                  right: "0.2%",
                  position: "relative",
                }}/>
              <p>
                <strong>Lucie Khamlach</strong>
              </p>
              <a href ="https://github.com/blessedNholyflavored" >  <img src={giticon} alt="Menu 3" className="avatar" /> </a>
            </div>

            <div className="avatarbis-container">
              <img
                src={ld}
                alt=""
                className="avatarbis"
                style={{
                  right: "1%",
                  position: "relative",
                }}
              />
              <p>
                <strong>Luna Dinaut</strong>
              </p>
              <a href ="https://github.com/shikalou" >  <img src={giticon} alt="Menu 3" className="avatar" /> </a>
            </div>

            <div className="avatarbis-container">
              <img src={mc} alt="" className="avatarbis" style={{
                  right: "0.5%",
                  position: "relative",
                }}/>
              <p>
                <strong>Marine Couppé</strong>
              </p>
              <a href ="https://github.com/karaskp" >  <img src={giticon} alt="Menu 3" className="avatar" /> </a>
            </div>

            <div className="avatarbis-container">
              <img src={jt} alt="" className="avatarbis" />
              <p>
                <strong>Julien Taravella</strong>
              </p>
              <a href ="https://github.com/JoLMG42" >  <img src={giticon} alt="Menu 3" className="avatar" /> </a>
            </div>
          </div>
        </main>
        <nav className="commonnav">
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
    </>
  );
};

export default Creators;
