import React, { useState } from "react";
import "./../../App.css";
import "./../../style/Profile.css";
import "./../../style/Login.css";
import logo from "../../img/logo42.png";
import icon from "../../img/buttoncomp.png";
import { useAuth } from "./AuthProvider";
//import { Login } from "./Login";
import { useNavigate } from "react-router-dom";

export function LocalLogin() {
  const { user, setUser } = useAuth();
  const [inputUsername, setInputUsername] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const navigate = useNavigate();

  // if user is already set
  if (user) {
    navigate("/");
  }

  // send inputs to back_end for validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`http://localhost:3000/auth/local_login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: inputUsername,
        password: inputPassword,
      }),
      credentials: "include",
    });
    if (!res.ok) {
      window.alert("Wrong password or username !");
      setInputPassword("");
      setInputUsername("");
    } else {
      const data = await res.json();
      setUser(data.user);
    }
  };

  const returnHome = () => {
    navigate("/");
  };
  return (
    <div className="Login">
      <div className="logoAuth">
        <img src={logo} className="logo" alt="icon" />
      </div>
      <div className="boxAuth">
        <div className="navbarbox navAuth">
          <img src={icon} className="buttonnav" alt="icon" />
          <p className="navTitle"> LOG IN </p>
          <p className="navTitle"> ▷</p>
        </div>
        <div className="boxAuthContent">
          <form className="loginForm" onSubmit={handleSubmit}>
            <label>Username:</label>
            <input
              className="loginInput"
              type="text"
              value={inputUsername}
              placeholder="toto"
              required
              onChange={(e) => setInputUsername(e.target.value)}
            />
            <label>Password</label>
            <input
              className="passwordInput"
              type="password"
              value={inputPassword}
              placeholder="********"
              required
              onChange={(e) => setInputPassword(e.target.value)}
            />
            <button className="submitLogIn" type="submit">
              LET ME IN !
            </button>
          </form>
          <p> I changed my mind I want to be logged through 42 !</p>
          <button onClick={returnHome}>LOG W/ 42</button>
          <p> I don't have any account ....</p>
          <button onClick={returnHome}>/REGISTER</button>
        </div>
      </div>
    </div>
  );
}
