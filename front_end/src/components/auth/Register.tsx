import React, { useState, useEffect } from "react";
import "./../../App.css";
import "./../../style/Profile.css";
import "./../../style/Login.css";
import logo from "../../img/logo42.png";
import icon from "../../img/buttoncomp.png";
import champi from "../../img/champi.png";
import { useAuth } from "./AuthProvider";
import Notify from "../../Notify";
import { useNavigate } from "react-router-dom";

export function Register() {
  const { user, setUser } = useAuth();
  const [inputUsername, setInputUsername] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notifyMSG, setNotifyMSG] = useState<string>("");
  const [notifyType, setNotifyType] = useState<number>(0);
  const [sender, setSender] = useState<number>(0);
  const navigate = useNavigate();

  // check if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, []);
  const handleCloseNotification = () => {
    setShowNotification(false);
  };
  // sending input to back_end to verify and register
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let dogimg;

    await fetch(`https://dog.ceo/api/breeds/image/random`, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((responseData) => (dogimg = responseData.message.toString()))
      .catch(() => (dogimg = champi.toString()));
    const res = await fetch(`http://localhost:3000/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: inputEmail,
        password: inputPassword,
        username: inputUsername,
        pictureURL: dogimg,
      }),
      credentials: "include",
    });
    if (res.status === 409) {
      setShowNotification(true);
      setNotifyMSG("Email is already taken !");
      setNotifyType(3);
      // setSender(0);
      // window.alert("email already taken !");
      setInputPassword("");
      setInputUsername("");
      setInputEmail("");
    } else if (res.status === 406) {
      setShowNotification(true);
      setNotifyMSG("You must use 42 LogIn system !");
      setNotifyType(3);
      // setSender(0);
      // window.alert("email already taken !");
      setInputPassword("");
      setInputUsername("");
      setInputEmail("");
    } else if (!res.ok) {
      setShowNotification(true);
      setNotifyMSG("Something is wrong with your inputs !");
      setNotifyType(3);
      // setSender(0);
      // window.alert("Verify your input");
      // console.log("res = ", res);
      setInputPassword("");
      setInputUsername("");
      setInputEmail("");
    } else {
      const data = await res.json();
      setUser(data.user);
      window.location.reload();
    }
  };

  const returnHome = () => {
    navigate("/");
  };

  const fortyTwoLogin = () => {
    window.location.href = "http://localhost:3000/auth/login42";
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
          </div>
        </div>
      </div>
    </div>
  );
}
