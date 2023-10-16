import React, { useState, useEffect } from "react";
import "./../../App.css";
import "./../../style/Profile.css";
import "./../../style/Login.css";
import logo from "../../img/logo42.png";
import icon from "../../img/buttoncomp.png";
import champi from "../../img/champi.png";
import { useAuth } from "./AuthProvider";
import Notify from "../../services/Notify";
import { useNavigate } from "react-router-dom";

export function Register() {
  const { user, setUser } = useAuth();
  const [inputUsername, setInputUsername] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notifyMSG, setNotifyMSG] = useState<string>("");
  const [notifyType, setNotifyType] = useState<number>(0);
  const [sender] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [navigate, user]);
  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  const localSignIn = () => {
    navigate("/local_login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = Math.floor(Math.random() * 151);
    let pokeimg;

    await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`, {
      method: "GET",
    })
      .then((res) => res.json())
      .then((resData) => {
        pokeimg = resData.sprites.other.home.front_default;
      })
      .catch(() => (pokeimg = champi.toString()));
    const res = await fetch(
      `http://${window.location.hostname}:3000/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: inputEmail,
          password: inputPassword,
          username: inputUsername,
          pictureURL: pokeimg,
        }),
        credentials: "include",
      }
    );
    if (res.status === 409) {
      setShowNotification(true);
      setNotifyMSG("Email is already taken !");
      setNotifyType(3);
      setInputPassword("");
      setInputUsername("");
      setInputEmail("");
      //TODO: add a return to general login or SignIn only in this case
    } else if (res.status === 406) {
      setShowNotification(true);
      setNotifyMSG("You must use 42 LogIn system !");
      setNotifyType(3);
      setInputPassword("");
      setInputUsername("");
      setInputEmail("");
    } else if (!res.ok) {
      setShowNotification(true);
      setNotifyMSG("Something is wrong with your inputs !");
      setNotifyType(3);
      setInputPassword("");
      setInputUsername("");
      setInputEmail("");
    } else {
      const data = await res.json();
      setUser(data.user);
      window.location.reload();
    }
  };

  const fortyTwoLogin = () => {
    window.location.href = `http://${window.location.hostname}:3000/auth/login42`;
  };

  return (
    <div className="Login">
      {showNotification && (
        <Notify
          message={notifyMSG}
          type={notifyType}
          senderId={sender}
          onClose={handleCloseNotification}
        />
      )}
      <div className="logoAuth">
        <img src={logo} className="logo" alt="icon" />
      </div>
      <div className="boxAuth">
        <div className="navbarbox navAuth">
          <img src={icon} className="buttonnav" alt="icon" />
          <p className="navTitle"> /REGISTER </p>
          <p className="navTitle"> ▷</p>
        </div>
        <div className="boxAuthContent">
          <form className="loginForm" onSubmit={handleSubmit}>
            <div className="loginFormBox">
              <label>Username:</label>
              <input
                className="registerInput"
                type="text"
                value={inputUsername}
                placeholder="toto"
                minLength={3}
                maxLength={10}
                required={true}
                onChange={(e) => setInputUsername(e.target.value)}
              />
            </div>
            <div className="loginFormBox">
              <label>Password</label>
              <input
                className="registerInput"
                type="password"
                value={inputPassword}
                placeholder="********"
                minLength={8}
                required={true}
                onChange={(e) => setInputPassword(e.target.value)}
              />
            </div>
            <div className="loginFormBox">
              <label>E-mail:</label>
              <input
                className="registerInput"
                type="email"
                value={inputEmail}
                placeholder="toto@cie.io"
                required={true}
                onChange={(e) => setInputEmail(e.target.value)}
              />
            </div>
            <div className="loginFormBox">
              <button className="submitLogIn" type="submit">
                LET ME IN !
              </button>
            </div>
          </form>
          <div className="otherLogin">
            <div className="otherLoginBox">
              <p> I changed my mind I want to be logged through 42 !</p>
              <img
                src="./login.png"
                onClick={fortyTwoLogin}
                alt="login with 42 button"
              />
            </div>
            <div className="otherLoginBox">
              <p>I already have a local account !</p>
              <img
                src="./blue_login.png"
                className="signinbtn"
                onClick={localSignIn}
                alt="local log in button"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
