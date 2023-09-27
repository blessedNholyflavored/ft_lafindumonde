import React, { useState } from "react";
import "./../../App.css";
import "./../../style/Login.css";
import icon from "../../img/buttoncomp.png";
import { useAuth } from "./AuthProvider";
import { useNavigate, Navigate } from "react-router-dom";
import api, { AxiosResponse } from "../../AxiosInstance";

export const InputTotp: React.FC = () => {
  const { user, setUser } = useAuth();
  const [receivedCode, setReceivedCode] = useState("");
  const navigate = useNavigate();

  const totpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      try {
        const response = await api.post(
          `/auth/submitInput?code=${receivedCode}`
        );
        if (response.status === 200) {
          // console.log('it went well ! user = ', response.data);
          setUser(response.data);
          window.location.reload();
        } else {
          console.error("Hmm Hmmm :", response.data);
        }
      } catch (error) {
        console.error("Error: ", error);
      }
    }
  };

  if (user && user.enabled2FA) {
    return (
      <div className="Login">
        <div className="boxAuth">
          <div className="navbarbox navAuth">
            <img src={icon} className="buttonnav" alt="icon" />
            <p className="navTitle"> 2FA AUTH </p>
            <p className="navTitle"> ▷</p>
          </div>
          <div className="boxAuthContent">
            <p>
              Use the input box below to confirm your identity with the code you
              generated with your favorite TOTP authenticator app :
            </p>
            <form className="totpSubmit" onSubmit={totpSubmit}>
              <label className="totpLabel">
                <input
                  className="totpInput"
                  type="text"
                  value={receivedCode}
                  placeholder="000000"
                  onChange={(e) => setReceivedCode(e.target.value)}
                />
              </label>
              <button className="totpBtn" type="submit">
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }
  return <Navigate to="/" />;
};
