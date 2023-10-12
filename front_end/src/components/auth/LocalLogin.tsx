import React, { useState, useEffect } from "react";
import "./../../App.css";
import "./../../style/Profile.css";
import "./../../style/Login.css";
import logo from "../../img/logo42.png";
import icon from "../../img/buttoncomp.png";
import { useAuth } from "./AuthProvider";
import Notify from "../../services/Notify";
import { useNavigate } from "react-router-dom";

export function LocalLogin() {
  const { user, setUser } = useAuth();
  const [inputUsername, setInputUsername] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notifyMSG, setNotifyMSG] = useState<string>("");
  const [notifyType, setNotifyType] = useState<number>(0);
  const [sender] = useState<number>(0);
  const navigate = useNavigate();

  // if user is already set
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [navigate, user]);

  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  // send inputs to back_end for validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(
      `http://${window.location.hostname}:3000/auth/local_login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: inputUsername,
          password: inputPassword,
        }),
        credentials: "include",
      }
    );
    if (res.status === 404) {
      // user not found
      setShowNotification(true);
      setNotifyMSG("This username doesn't exist");
      setNotifyType(3);
      setInputPassword("");
      setInputUsername("");
    } else if (res.status === 409) {
      // email is a 42 type of email
      setShowNotification(true);
      setNotifyMSG("You must use the 42 Login System.");
      setNotifyType(3);
      setInputUsername("");
      setInputPassword("");
    } else if (!res.ok) {
      // password incorrect
      setShowNotification(true);
      setNotifyMSG("Wrong password");
      setNotifyType(3);
      setInputPassword("");
      setInputUsername("");
    } else {
      // if user connection is ok we set user to the user found in back end
      const data = await res.json();
      setUser(data.user);
      window.location.reload();
    }
  };
  const fortyTwoLogin = () => {
    window.location.href = `http://${window.location.hostname}:3000/auth/login42`;
  };

  const navigateRegister = () => {
    navigate("/register");
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
          <p className="navTitle"> /LOG IN </p>
          <p className="navTitle"> ▷</p>
        </div>
        <div className="boxAuthContent">
          <form className="loginForm" onSubmit={handleSubmit}>
            <div className="loginFormBox">
              <label>Username:</label>
              {/* length is a bit longer for local login to let people having underscore after their username log in */}
              <input
                className="loginInput"
                type="text"
                value={inputUsername}
                placeholder="toto"
                minLength={3}
                maxLength={15}
                required
                onChange={(e) => setInputUsername(e.target.value)}
              />
            </div>
            <div className="loginFormBox">
              <label>Password:</label>
              <input
                className="passwordInput"
                type="password"
                value={inputPassword}
                placeholder="********"
                maxLength={20}
                required
                onChange={(e) => setInputPassword(e.target.value)}
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
                alt="log with 42 button"
              />
            </div>
            <div className="otherLoginBox">
              <p> I don't have any account ....</p>
              <img
                src="./grey_login.png"
                onClick={navigateRegister}
                alt="register button"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
