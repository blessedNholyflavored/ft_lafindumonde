import React, { useContext, useEffect, useState } from "react";
import "./../../App.css";
import "./../../style/Chat.css";
import "./../../style/Logout.css";
import { useAuth } from "./../auth/AuthProvider";
import { Navigate, useParams } from "react-router-dom";
import icon from "../../img/buttoncomp.png";
import logo from "../../img/logo42.png";
import { Logout } from "./../auth/Logout";
import { WebsocketContext } from "../../WebsocketContext";
import { useNavigate } from "react-router-dom";
import ChatChannel from "./ChatChannel";
import PrivateChat from "./PrivateChat";

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
}

interface privMSG {
  id: number;
  username: string;
}

interface channels {
  name: string;
  visibility: string;
  id: number;
}

interface invSend {
  id: string;
  status: string;
  senderId: number;
  recipientId: number;
  username: string;
  isBlocked: boolean;
  chatRoomName: string;
}

export const Chat = () => {
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
  const [privMSG, setPrivMSG] = useState<privMSG[]>([]);
  const [notInRoom, setNotInRoom] = useState<privMSG[]>([]);
  const [channels, setChannels] = useState<channels[]>([]);
  const [showChatChannel, setShowChatChannel] = useState(false);
  const [showConv, setShowConv] = useState(false);
  const [activeChannel, setActiveChannel] = useState<number | null>(null);
  const navigate = useNavigate();
  const socket = useContext(WebsocketContext);
  const [selectedPrivateConv, setSelectedPrivateConv] = useState<number | null>(
    null
  );
  const [isPrivatechan, setIsPrivatechan] = useState<number | null>(null);
  const [isPrivateConvButtonDisabled, setIsPrivateConvButtonDisabled] =
    useState(false);
  const [invSend, setInvSend] = useState<invSend[]>([]);
  const [invReceive, setInvReceive] = useState<invSend[]>([]);

  async function fetchYourRoomsList() {
    try {
      const response = await fetch(
        `http://localhost:3000/chat/recupYourRooms/${user?.id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des messages privés.");
      }
      const data = await response.json();
      if (data.length > 0) {
        const friendObjects = data;
        const friendInfo = friendObjects.map(
          (friend: { name: string; visibility: string; id: number }) => ({
            name: friend.name,
            visibility: friend.visibility,
            id: friend.id,
          })
        );
        setChannelsJoin(friendInfo);
      }
    } catch (error) {
      console.error("Erreur :", error);
      return [];
    }
  }

  async function fetchRoomsList() {
    try {
      const response = await fetch(
        `http://localhost:3000/chat/recupRooms/${user?.id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error(
          "Erreur lors de la récupération des messages preeeeivés."
        );
      }
      const data = await response.json();
      console.log(data);
      if (data.length > 0) {
        const friendObjects = data;
        const friendInfo = friendObjects.map(
          (friend: { name: string; visibility: string; id: number }) => ({
            name: friend.name,
            visibility: friend.visibility,
            id: friend.id,
          })
        );
        setChannels(friendInfo);
      }
    } catch (error) {
      console.error("Erreur :", error);
      return [];
    }
  }

  async function fetchUsernameById(userId: string) {
    try {
      const response = await fetch(
        `http://localhost:3000/users/${userId}/username`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error(
          `Erreur lors de la récupération de l'utilisateur avec l'ID ${userId}.`
        );
      }
      const userData = await response.text();
      return userData;
    } catch (error) {
      console.error("Erreur :", error);
      return null; // En cas d'erreur, renvoyez null ou une valeur par défaut
    }
  }

  async function fetchRoomNameById(roomId: string) {
    try {
      const response = await fetch(
        `http://localhost:3000/chat/roomName/${roomId}/`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error(
          `Erreur lors de la récupération de l'utilisateur avec l'ID ${roomId}.`
        );
      }
      const userData = await response.text();
      return userData;
    } catch (error) {
      console.error("Erreur :", error);
      return null; // En cas d'erreur, renvoyez null ou une valeur par défaut
    }
  }

  async function fetchPrivateConvList() {
    try {
      const response = await fetch(
        `http://localhost:3000/chat/recupPrivate/${user?.id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error(
          "Erreur lors de la récupération des messages preeeeivés."
        );
      }
      const data = await response.json();

      if (data.length > 0) {
        const promises = data.map(async (userId: string) => {
          const username = await fetchUsernameById(userId);
          return { id: userId, username };
        });

        const usernames: privMSG[] = await Promise.all(promises);
        setPrivMSG(usernames);
      }
    } catch (error) {
      console.error("Erreur :", error);
      return [];
    }
  }

  // useEffect(() => {
  //   async function fetchYourRooms() {
  //     const scores = await fetchYourRoomsList();
  //   }
  //   async function fetchRooms() {
  //     const scores = await fetchRoomsList();
  //   }
  //   async function fetchPossibleInvite() {
  //     const scores = await fetchPossibleInviteList();
  //   }
  //   async function fetchInviteSend() {
  //     const scores = await fetchInviteSendList();
  //   }
  //   async function fetchInviteReceive() {
  //     const scores = await fetchInviteReceiveList();
  //   }

  // }, []);

  useEffect(() => {
    async function fetchYourRooms() {
      const scores = await fetchYourRoomsList();
    }
    async function fetchRooms() {
      const scores = await fetchRoomsList();
    }
    async function fetchPrivateConv() {
      const scores = await fetchPrivateConvList();
    }
    async function fetchPossibleInvite() {
      const scores = await fetchPossibleInviteList();
    }
    async function fetchInviteSend() {
      const scores = await fetchInviteSendList();
    }
    async function fetchInviteReceive() {
      const scores = await fetchInviteReceiveList();
    }
    if (socket) {
      socket.on("refreshListRoom", () => {
        fetchPossibleInvite();
        fetchInviteSend();
        fetchInviteReceive();
        fetchYourRooms();
        fetchRooms();
      });
    }
    if (socket) {
      socket.on("refreshAfterKick", (roomName: string, reason: string) => {
        alert("You have been kicked from " + roomName + ". Raison: " + reason);
        window.location.reload();
      });
    }
    if (socket) {
      socket.on("refreshMessages", () => {
        fetchPrivateConv();
      });
    }
    if (socket) {
      socket.on("refreshMessagesRoom", () => {
        fetchPossibleInvite();
      });
    }
    if (socket) {
      socket.on("NotifyReceiveChannelInvit", () => {
        fetchInviteReceive();
      });
    }

    fetchYourRooms();
    fetchRooms();
    fetchPrivateConv();
    fetchPossibleInvite();
    fetchInviteSend();
    fetchInviteReceive();
  }, [activeChannel]);

  const checkRoomAlreadyExist = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/chat/checkRoomName/${valueRoom}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des messages privés.");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Erreur :", error);
      return [];
    }
  };

  const createRoom = async () => {
    if ((await checkRoomAlreadyExist()) === false) {
      socket.emit("createChatRoom", valueRoom, selectedOption, password);
      socket.emit("ActuAtRoomCreate", valueRoom, selectedOption);
      setTimeout(() => {
        socket.emit("reloadListRoomAtJoin", valueRoom);
      }, 100);
    } else alert("Name room already taken");
    return "";
  };

  const joinRoom = async () => {
    if ((await checkRoomAlreadyExist()) === true) {
      socket.emit("joinChatRoom", valueRoom, selectedOption, password);
      setTimeout(() => {
        socket.emit("reloadListRoom", activeChannel);
      }, 100);
    } else alert("room existe po");
    return "";
  };

  const navToChan = (id: number) => {
    navigate(`/chat/chan/${id}`);
    setActiveChannel(id);
  };

  const navToPrivateConv = (id: number) => {
    navigate(`/chat/priv/${id}`);
    setSelectedPrivateConv(id);
  };

  const clickToJoinChan = (id: number, name: string, option: string) => {
    if (option === "PUBLIC") {
      socket.emit("joinChatRoom", name, option, "");
    } else if (option === "PWD_PROTECTED") {
      const password = window.prompt("Entrez le mot de passe :");

      if (password !== null) {
        socket.emit("joinChatRoom", name, option, password);
      } else {
        alert(
          "Annulation : Vous devez fournir un mot de passe pour rejoindre le channel protégé."
        );
      }
    }
    setTimeout(() => {
      socket.emit("reloadListRoomAtJoin", name);
    }, 100);
  };

  const handleOptionChange = (e: { target: { value: string } }) => {
    setSelectedOption(e.target.value);
    if (e.target.value !== "protected") {
      setPassword("");
    }
  };

  const handleInputChange = (e: { target: { value: string } }) => {
    setValueRoom(e.target.value);
    setIsButtonDisabled(e.target.value === "");
  };

  const handleButton = () => {
    setShowChatChannel(false);
    setTimeout(() => {
      setShowChatChannel(true);
      setShowConv(false);
      setSelectedPrivateConv(0);
    }, 100);
  };

  const handleButtonConv = () => {
    setShowConv(false);
    setTimeout(() => {
      setShowConv(true);
      setShowChatChannel(false);
      setActiveChannel(0);
    }, 100);
  };

  const fetchPossibleInviteList = async () => {
    if (activeChannel) {
      try {
        const response = await fetch(
          `http://localhost:3000/chat/usersNotInRoom/${activeChannel}/${user?.id}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (!response.ok) {
          throw new Error(
            "Erreur lors de la récupération des messages preeeeivés."
          );
        }
        const data = await response.json();
        console.log(data);
        if (data.length > 0) {
          const friendObjects = data;
          const friendInfo = friendObjects.map(
            (friend: { id: number; username: string }) => ({
              id: friend.id,
              username: friend.username,
            })
          );
          setNotInRoom(friendInfo);
        }
      } catch (error) {
        console.error("Erreur :", error);
        return [];
      }
    }
  };

  async function fetchInviteSendList() {
    if (activeChannel) {
      try {
        const response = await fetch(
          `http://localhost:3000/chat/invSend/${user?.id}/${activeChannel}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des scores.");
        }
        const data = await response.json();
        const updatedData = await Promise.all(
          data.map(
            async (invSend: {
              username: any;
              status: string;
              receiverId: number;
              senderId: number;
            }) => {
              invSend.username = await fetchUsernameById(
                invSend.receiverId.toString()
              );
              return invSend;
            }
          )
        );
        setInvSend(updatedData);
        return data[0];
      } catch (error) {
        console.error("Erreur:", error);
        return [];
      }
    }
  }

  async function checkBlocked(senderId: string, recipientId: string) {
    try {
      const response = await fetch(
        `http://localhost:3000/friends/blocked/${senderId}/${recipientId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des données.");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Erreur:", error);
      return false;
    }
  }

  async function fetchInviteReceiveList() {
    try {
      const response = await fetch(
        `http://localhost:3000/chat/invReceive/${user?.id}/`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des scores.");
      }
      const data = await response.json();
      const updatedData = await Promise.all(
        data.map(
          async (invSend: {
            chatRoomName: string | null;
            chatroomId: number;
            username: any;
            status: string;
            receiverId: number;
            senderId: number;
            isBlocked: boolean;
          }) => {
            // Utilisez recupUsername pour obtenir le nom d'utilisateur
            invSend.username = await fetchUsernameById(
              invSend.senderId.toString()
            );
            invSend.chatRoomName = await fetchRoomNameById(
              invSend.chatroomId.toString()
            );
            invSend.isBlocked = await checkBlocked(
              invSend.senderId.toString(),
              invSend.receiverId.toString()
            );
            return invSend;
          }
        )
      );
      console.log("for see:  ", updatedData);
      setInvReceive(updatedData);
      return data[0];
    } catch (error) {
      console.error("Erreur:", error);
      return [];
    }
  }

  const clickToInvite = async (id: number) => {
    if (!activeChannel) {
      alert("Recipient ID is missing.");
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:3000/chat/invite/${user?.id}/${id}/${activeChannel}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      if (response.ok) {
        console.log(response);
        // if (user && await checkBlockedForNotify(user?.id.toString(), recipientId) === false)
        // socket.emit('notifyFriendShip', id);
        alert("Invitation created successfully.");
      } else {
        console.error("Error creating friendship: request is pending");
        alert("Error creating friendship: request is pending");
      }
    } catch (error) {
      console.error("Error creating friendship:", error);
    }
    setTimeout(() => {
      socket.emit("reloadListRoom", activeChannel);
      socket.emit("NotifyInviteChannel", id);
    }, 100);
  };

  async function refuseInvite(id: string) {
    try {
      const response = await fetch(`http://localhost:3000/chat/refuse/${id}`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des scores.");
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
    window.location.reload();
  }

  return (
    <div className="main_chat_box" style={{ background: "darkgreen" }}>
      <div>
        <ul>
          <h1>Liste des invitations recues :</h1>
          {invReceive.map((chan) => (
            <div key={chan.id}>
              {!chan.isBlocked && (
                <div>
                  <button
                    onClick={() =>
                      clickToJoinChan(
                        parseInt(chan.id),
                        chan.chatRoomName,
                        "PUBLIC"
                      )
                    }
                  >
                    <div>
                      inviter par: {chan.username} pour le chan:{" "}
                      {chan.chatRoomName}
                    </div>
                  </button>
                  <button onClick={() => refuseInvite(chan.id.toString())}>
                    Cancel invite
                  </button>
                </div>
              )}
            </div>
          ))}
        </ul>
      </div>
      <div>
        <ul>
          <h1>Liste des channels disponible :</h1>
          {channels.map((chan) => (
            <div key={chan.id}>
              <button
                onClick={() =>
                  clickToJoinChan(chan.id, chan.name, chan.visibility)
                }
                disabled={activeChannel === chan.id}
              >
                <div>
                  id: {chan.id} --- name chan: {chan.name} --- options:{" "}
                  {chan.visibility}
                </div>
              </button>
            </div>
          ))}
        </ul>
      </div>
      <div>
        <ul>
          <h1>Liste des convos privées :</h1>
          {privMSG.map((priv) => (
            <div key={priv.id}>
              <button
                onClick={() => {
                  navToPrivateConv(priv.id);
                  if (showConv) {
                    handleButtonConv();
                  } else {
                    setShowConv(true);
                    setShowChatChannel(false);
                    setActiveChannel(0);
                  }
                }}
                disabled={selectedPrivateConv === priv.id}
              >
                <div>
                  id: {priv.id} --- username: {priv.username}
                </div>
              </button>
            </div>
          ))}
        </ul>
      </div>
      <div>
        <ul>
          <h1>Liste des channels join :</h1>
          {channelsJoin.map((chan) => (
            <div key={chan.id}>
              <button
                onClick={() => {
                  navToChan(chan.id);
                  if (showChatChannel) {
                    handleButton();
                  } else {
                    setShowChatChannel(true);
                    setShowConv(false);
                    setSelectedPrivateConv(0);
                  }
                  if (chan.visibility === "PRIVATE") {
                    setIsPrivatechan(1);
                  } else setIsPrivatechan(0);
                }}
                disabled={activeChannel === chan.id}
              >
                <div>
                  id: {chan.id} --- name chan: {chan.name} --- options:{" "}
                  {chan.visibility}
                </div>
              </button>
            </div>
          ))}
          <div>
            {isPrivatechan === 1 && (
              <div>
                <ul>
                  <h1>Liste des gens que tu peux inviter :</h1>
                  {notInRoom.map((chan) => (
                    <div key={chan.id}>
                      <div>
                        id: {chan.id} - user {chan.username}
                      </div>
                      <button onClick={() => clickToInvite(chan.id)}>
                        Invite to chan
                      </button>
                    </div>
                  ))}
                </ul>
                <ul>
                  <h1>Liste des gens que as inviter :</h1>
                  {invSend.map((invsend) => (
                    <div key={invsend.id}>
                      <div>
                        id: {invsend.id} - user {invsend.username}
                      </div>
                      <button
                        onClick={() => refuseInvite(invsend.id.toString())}
                      >
                        Cancel invite
                      </button>
                    </div>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </ul>
      </div>
      <div className="chat_list">
        <div className="navbarmainpage nav_box">
          <img src={icon} className="buttonnav" alt="icon" />
          <p className="title_box">WHO'S ONLINE</p>
        </div>
      </div>
      <div className="message_box">
        <div className="navbarmainpage nav_box">
          <img src={icon} className="buttonnav" alt="icon" />
          <p className="title_box">CONV WITH m a c h i n</p>
        </div>
      </div>
      <div>
        <button className="logoutBtn" onClick={() => Logout({ user, setUser })}>
          LOG OUT{" "}
        </button>
      </div>

      <div>
        <input
          type="text"
          placeholder="Nom de la room"
          value={valueRoom}
          onChange={handleInputChange}
        />
        <select value={selectedOption} onChange={handleOptionChange}>
          <option value="public">Public</option>
          <option value="private">Private</option>
          <option value="protected">Protected</option>
        </select>
        {selectedOption === "protected" && (
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}
        <button onClick={createRoom} disabled={isButtonDisabled}>
          Créer une nouvelle room
        </button>
        <button onClick={joinRoom} disabled={isButtonDisabled}>
          Rejoindre une room existante
        </button>
      </div>
      {showChatChannel && <ChatChannel />}
      {!showConv && recipient && <PrivateChat />}
      {showConv && <PrivateChat />}
    </div>
  );
};

export default Chat;
