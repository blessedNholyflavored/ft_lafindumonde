import React, { useState } from "react";
import "./../../App.css";
import "./../../style/Login.css";
import icon from "../../img/buttoncomp.png";
import { useAuth } from "./AuthProvider";
import { Navigate } from "react-router-dom";
import Notify from "../../services/Notify";

export const InputTotp: React.FC = () => {
  const { user, setUser } = useAuth();
  const [receivedCode, setReceivedCode] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notifyMSG, setNotifyMSG] = useState<string>("");
  const [notifyType, setNotifyType] = useState<number>(0);
  const [sender, setSender] = useState<number>(0);

  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  const totpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      try {
        const response = await fetch(
          `http://${window.location.hostname}:3000/auth/submitInput?code=${receivedCode}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        if (response.status === 200) {
          // if user passed successfully totpGuards
          const data = await response.json();
          setUser(data.user);
          window.location.reload();
        } else if (response.status === 401) {
          // if he gets an Unauthorized error
          setShowNotification(true);
          setNotifyMSG("Something is wrong with your inputs !");
          setNotifyType(3);
          setReceivedCode("");
        }
      } catch (error) {
        console.error("Error: ", error);
      }
    }
  };

  if (user && user.enabled2FA) {
    return (
      <div className="Totp">
        {showNotification && (
          <Notify
            message={notifyMSG}
            type={notifyType}
            senderId={sender}
            onClose={handleCloseNotification}
          />
        )}
        <div className="boxTotp">
          <div className="navbarbox navAuth">
            <img src={icon} className="buttonnav" alt="icon" />
            <p className="navTitle"> 2FA AUTH </p>
            <p className="navTitle"> ▷</p>
          </div>
          <div className="boxTotpContent">
            <p className="textTotpLogin">
              Use the input box below to confirm your identity with the code you
              generated with your favorite TOTP authenticator app :
            </p>
            <form className="totpSubmit" onSubmit={totpSubmit}>
              <label className="totpLabel">
                <input
                  className="totpInputLogin"
                  type="text"
                  value={receivedCode}
                  placeholder="000000"
                  minLength={6}
                  maxLength={6}
                  required
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
