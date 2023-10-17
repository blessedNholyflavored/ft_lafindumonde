import logo from "./img/logo42.png";
import { Link, useNavigate } from "react-router-dom";
import "./style/Profile.css";
import "./style/Home.css";

import { Logout } from "./components/auth/Logout";
import { useAuth } from "./components/auth/AuthProvider";

import icon from "./img/buttoncomp.png";
import folderviolet from "./img/folderred.png";
//import lost from "lost.gif";

export const PageNotFound = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const navigateToHome = () => {
    navigate("/");
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
              <h1> 404 NOT FOUND </h1>
            </div>
            <p>are you lost?</p>
            <img
              style={{ width: "500px" }}
              src={require("./lost.gif")}
              alt="lost in a field gif"
            ></img>
          </div>
        </main>
        <nav>
          <ul>
            <li className="menu-item">
              <a onClick={navigateToHome}>
                <img src={folderviolet} alt="Menu 3" />
                <p>BACK HOME</p>
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

export default PageNotFound;
