import React from "react";
import "./../../App.css";
import "./../../style/Profile.css";
import "./../../style/Login.css";
import logo from "../../img/logo42.png";
import icon from "../../img/buttoncomp.png";
import { useAuth } from "./AuthProvider";
import { useNavigate } from "react-router-dom";

export function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // si user a ete set (donc est log)
  // on peut acceder a Home
  if (user) {
    navigate("/");
  }

  //on fait appel au service d'auth dans le back
  const fortyTwoLogin = () => {
    window.location.href = "http://localhost:3000/auth/login42";
  };

  const register = () => {
    navigate("/register");
  };

  const localSignIn = () => {
    navigate("/local_login");
  };

  return (
    <div className="Login">
      <div className="logoAuth">
        <img src={logo} className="logo" alt="icon" />
      </div>
      <div className="boxAuth">
        <div className="navbarbox navAuth">
          <img src={icon} className="buttonnav" alt="icon" />
          <p className="navTitle"> WELCOME, PLAYER </p>
          <p className="navTitle"> ▷</p>
        </div>
        <div className="boxAuthContent">
          <img src="./login.png" onClick={fortyTwoLogin} alt="login button" />
          <h1> LOG W/ 42</h1>
          <h2>I don't have a 42 account !</h2>
          <div className="otherLogin">
            <div className="otherLoginBox">
              <img
                src="./grey_login.png"
                className="registerbtn"
                onClick={register}
                alt="register button"
              />
              <p>/REGISTER</p>
            </div>
            <div className="otherLoginBox">
              <img
                src="./blue_login.png"
                className="signinbtn"
                onClick={localSignIn}
                alt="local log in button"
              />
              <p>/SIGN IN</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
