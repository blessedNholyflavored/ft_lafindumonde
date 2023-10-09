import React, { useState, useEffect } from "react";
import "./../../App.css";
import "./../../style/Login.css";
import icon from "../../img/buttoncomp.png";
import { useAuth } from "./AuthProvider";
import { useNavigate, Navigate, useLocation } from "react-router-dom";
import api from "../../services/AxiosInstance";

import Notify from "../../services/Notify";

export const SaveTotp: React.FC = () => {
  const { user } = useAuth();
  const [receivedCode, setReceivedCode] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotification, setShowNotification] = useState(false);
  const [notifyMSG, setNotifyMSG] = useState<string>("");
  const [notifyType, setNotifyType] = useState<number>(0);
  const [sender, setSender] = useState<number>(0);
  const [qrCode, setQRCode] = useState("");

  useEffect(() => {
    getQRCodeImg();
  }, []);

  const searchParams = new URLSearchParams(location.search);
  // const qrCodeImg = searchParams.get("qrCodeImg");

  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  const totpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      // try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/auth/submitCode?code=${receivedCode}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      if (response.status === 200) {
        return navigate("/");
      } else if (response.status === 401) {
        setShowNotification(true);
        setNotifyMSG("Something is wrong with your inputs !");
        setNotifyType(3);
        setReceivedCode("");
      } else throw response;
    }
  };

  const getQRCodeImg = async () => {
    if (user) {
      const res = await fetch(
        `http://${window.location.hostname}:3000/auth/getQRCode`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (res.ok) {
        try {
          //display QRcode
          // console.log(res.json());
          const data = await res.json();
          const qrCodeExtract = data.qrCode;
          // console.log(atob(qrCodeExtract));
          // console.log("oui");
          setQRCode(`${qrCodeExtract}`);
          return;
        } catch {
          setShowNotification(true);
          setNotifyMSG("Have you done something nasty ? Not cool ....");
          setNotifyType(3);
          setQRCode(`http://${window.location.hostname}:8080/pepe.png`);
        }
      } else {
        setShowNotification(true);
        setNotifyMSG("Have you done something nasty ? Not cool ....");
        setNotifyType(3);
        setQRCode(`http://${window.location.hostname}:8080/pepe.png`);
      }
    }
  };

  if (user) {
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
            <p className="textTotp">
              Use this QR in your favorite TOTP authenticator. It will register
              the app inside your authenticator in order to log in easily by
              reloading the code input that follows upon authentication.
            </p>
            {qrCode && <img src={qrCode} alt="qr code" className="imgQRcode" />}
            <p className="textTotp">
              Now you can use the input box below to confirm your identity with
              the code you received :
            </p>
            <form className="totpSubmit" onSubmit={totpSubmit}>
              <label className="totpLabel">
                <input
                  className="totpInput"
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
