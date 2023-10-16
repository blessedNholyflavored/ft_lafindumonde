import React, { useEffect } from "react";
import "../style/Notify.css";
import { Link, useNavigate } from "react-router-dom";

interface NotificationProps {
  message: string;
  onClose: () => void;
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
    const res = await fetch(
      `http://${window.location.hostname}:3000/auth/2FAenable`,
      {
        method: "GET",
        credentials: "include",
      }
    );
    if (res.status !== 200) {
      return navigate(`/settings`);
    } else {
      return navigate(`/totpSave`);
    }
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
            accept
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
      {type === 5 && <div className="notificationErrorChat">{message}</div>}
    </>
  );
};

export default Notify;
