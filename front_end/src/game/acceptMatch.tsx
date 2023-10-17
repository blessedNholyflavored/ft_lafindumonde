import React, { useContext, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../App.css";
import "../style/Home.css";
import "../style/Logout.css";
import { useAuth } from "../components/auth/AuthProvider";
import { WebsocketContext } from "../services/WebsocketContext";

const AcceptMatch: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const socket = useContext(WebsocketContext);

  const [accepted, setAccepted] = useState(false);

  if (socket && accepted === false) {
    setAccepted(true);
    socket.emit("matchAccepted", id);
    socket?.emit("updateUserIGFriend", user?.id);
    socket?.emit("updateUserIGFriend", parseInt(id as string));
  }
  if (socket) {
    socket?.on("matchStart", (roomdId: number) => {
      navigate(`/gamefriend/${roomdId}`);
    });
  }

  return <div></div>;
};

export default AcceptMatch;
