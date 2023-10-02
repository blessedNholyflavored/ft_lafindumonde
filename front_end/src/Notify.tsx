import React, { useEffect } from "react";
import "./Notify.css";
import { Link, useNavigate } from "react-router-dom"; // Importez Link depuis react-router-dom

// Définissez une interface pour les props du composant
interface NotificationProps {
  message: string; // Indiquez le type de la prop message (string ici)
  onClose: () => void; // Fonction pour fermer la notification
  type: number;
  senderId: number;
}

const Notify: React.FC<NotificationProps> = ({
  message,
  type,
  senderId,
  onClose,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    const timeout = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timeout);
  }, [onClose]);

  const handleViewClick = () => {
    navigate(`/acceptMatch/${senderId}`);
  };

  const handle2FAEnable = async () => {
    const res = await fetch("http://localhost:3000/auth/2FAenable", {
      method: "GET",
      credentials: "include",
    });
    const data = await res.json();
    return navigate(`/totpSave?qrCodeImg=${encodeURIComponent(data.code)}`);
  };
  return (
    <>
      {type === 0 && (
        <div className="notification">
          {message}
          <Link to="/friends" className="notification-link">
            Voir
          </Link>
        </div>
      )}
      {type === 1 && (
        <div className="notification">
          {message}
          <button className="notification-link" onClick={handleViewClick}>
            Accepter
          </button>
        </div>
      )}
      {type === 2 && <div className="notification">{message}</div>}
      {type === 3 && <div className="notificationError">{message}</div>}
      {type === 4 && (
        <div className="notification2FA">
          {message}
          <button className="notification-link2FA" onClick={handle2FAEnable}>
            confirm
          </button>
        </div>
      )}
    </>
  );
};

export default Notify;
