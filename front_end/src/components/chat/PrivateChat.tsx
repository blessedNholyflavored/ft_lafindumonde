import React, { useContext, useEffect, useState } from "react";
import "./../../App.css";
import "./../../style/Chat.css";
import "./../../style/Logout.css";
import { useAuth } from "./../auth/AuthProvider";
import { Navigate, useParams } from "react-router-dom";
import icon from "../../img/buttoncomp.png";
import logo from "../../img/logo42.png";
import { Logout } from "./../auth/Logout";
import { WebsocketContext } from "../../services/WebsocketContext";
import { useNavigate } from "react-router-dom";

type MessagePayload = {
  content: string;
  msg: string;
};

interface messages {
  start_at: string;
  content: string;
  recipientId: number;
  senderUsername: string;
  recipientUsername: string;
  isBlocked: string;
}

interface channels {
  name: string;
  visibility: string;
  id: number;
}

export const PrivateChat = () => {
  const { user, setUser } = useAuth();
  const { recipient } = useParams();
  const [value, setValue] = useState("");
  const [valueRoom, setValueRoom] = useState("");
  const [messages, setMessages] = useState<MessagePayload[]>([]);
  const [messageListSend, setMessageList] = useState<messages[]>([]);
  const [selectedOption, setSelectedOption] = useState("public");
  const [password, setPassword] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [channelsJoin, setChannelsJoin] = useState<channels[]>([]);
  const navigate = useNavigate();
  const socket = useContext(WebsocketContext);
  const [isBlocked, setIsBlocked] = useState<string>("");

  async function fetchPrivMessageList() {
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/chat/recupMess/${recipient}/${user?.id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des messages privés.");
      }
      const data = await response.json();
      const usernamePromises = data.map(
        async (message: {
          isBlocked: string;
          senderId: any;
          recipientId: any;
          senderUsername: string;
          recipientUsername: string;
        }) => {
          try {
            const senderResponse = await fetch(
              `http://${window.location.hostname}:3000/users/${message.senderId}/username`,
              {
                method: "GET",
                credentials: "include",
              }
            );
            const recipientResponse = await fetch(
              `http://${window.location.hostname}:3000/users/${message.recipientId}/username`,
              {
                method: "GET",
                credentials: "include",
              }
            );
            const isBlockedResponse = await fetch(
              `http://${window.location.hostname}:3000/friends/blocked/${recipient}/${user?.id}`,
              {
                method: "GET",
                credentials: "include",
              }
            );
            if (
              senderResponse.ok &&
              recipientResponse.ok &&
              isBlockedResponse.ok
            ) {
              const senderUsername = await senderResponse.text();
              const recipientUsername = await recipientResponse.text();
              const isBlocked = await isBlockedResponse.text();

              message.senderUsername = senderUsername;
              message.recipientUsername = recipientUsername;
              message.isBlocked = isBlocked;
            }
          } catch (error) {
            console.log(error);
          }
        }
      );
      await Promise.all(usernamePromises);
      setMessageList(data);
      return data[0];
    } catch (error) {
      console.error("Erreur :", error);
      return [];
    }
  }

  useEffect(() => {
    async function fetchPrivMessage() {
      if (recipient) {
        const scores = await fetchPrivMessageList();
      }

      if (socket) {
        socket.on("refreshMessages", () => {
          fetchPrivMessage();
        });
      }
    }
    checkBlocked(recipient as any, user?.id as any);
    fetchPrivMessage();
    if (isBlocked === "true") navigate("/chat");
  }, [isBlocked]);

  const onSubmit = () => {
    if (value.length > 0) {
      socket.emit("newMessage", value, recipient);
      setTimeout(() => {
        socket.emit("reloadMessages", value, recipient);
      }, 100);
      setValue("");
    }
  };

  async function checkBlocked(senderId: string, recipientId: number) {
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/friends/blocked/${senderId}/${recipientId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des données.");
      }

      const data = await response.text();
      setIsBlocked(data);
      return data;
    } catch (error) {
      console.error("Erreur:", error);
      return false;
    }
  }

  async function deleteFriend(sender: string, recipient: string) {
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/friends/delete/${recipient}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des scores.");
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  }

  async function BlockFriend(recipient: string) {
    const sender = user?.id as unknown as string;
    deleteFriend(sender, recipient);
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/friends/block/${recipient}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des scores.");
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
    socket.emit("refreshMessages", recipient);
    navigate("/chat");
    // window.location.reload();
  }

  async function removeBlocked(sender: string, recipient: string) {
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/friends/unblock/${recipient}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des scores.");
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
    setTimeout(() => {
      socket.emit("reloadMessRoom", recipient);
    }, 100);
    // window.location.reload();
  }

  const handleEnter = (e: { key: string }) => {
    if (e.key === "Enter") {
      onSubmit();
    }
  };

  return (
    <div>
      {recipient && isBlocked === "false" && (
        <button onClick={() => BlockFriend(recipient.toString())}>
          Bloquer
        </button>
      )}
      {isBlocked === "true" && recipient && (
        <button
          onClick={() =>
            removeBlocked(user?.id.toString() as any, recipient.toString())
          }
        >
          Debloquer
        </button>
      )}
      {recipient && (
        <ul>
          <h1>Liste des msgs envoyes :</h1>
          {messageListSend.length > 0 && user ? (
            messageListSend.map((friend, index) => (
              <div>
                {friend.recipientId === user?.id && (
                  <div style={{ backgroundColor: "red", float: "left" }}>
                    <div key={index}>
                      <div>{friend.start_at}</div>
                      <div>{friend.senderUsername}</div>
                      <div>{friend.content}</div>
                    </div>
                  </div>
                )}
                {friend.recipientId !== user?.id && (
                  <div style={{ backgroundColor: "green", float: "right" }}>
                    <div key={index}>
                      <div>{friend.start_at}</div>
                      <div>{friend.senderUsername}</div>
                      <div>{friend.content}</div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div>pas de message</div>
          )}
        </ul>
      )}
      <div>
        {recipient && (
          <div>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyPress={handleEnter}
            />
            <button onClick={onSubmit}>Submit</button>
          </div>
        )}
      </div>
    </div>
  );
};
export default PrivateChat;
