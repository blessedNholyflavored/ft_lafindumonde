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

  // if user is set
  // we are redirected to home
  if (user) {
    navigate("/");
  }

  // call the login with 42 strategy from back end
  const fortyTwoLogin = () => {
    window.location.href = `http://${window.location.hostname}:3000/auth/login42`;
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
          <h1> LOG W/ 42</h1>
          <img src="./login.png" onClick={fortyTwoLogin} alt="login button" />

          <h3>I don't have a 42 account :</h3>
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
