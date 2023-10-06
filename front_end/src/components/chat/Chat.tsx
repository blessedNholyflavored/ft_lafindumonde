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
import Notify from "../../Notify";

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
  isBlocked: string;
}

interface channels {
  name: string;
  visibility: string;
  id: number;
  AmIBanned: string;
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
  const { id } = useParams();
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
  const [activeBanChannel, setActiveBanChannel] = useState<number | null>(null);
  const navigate = useNavigate();
  const socket = useContext(WebsocketContext);
  const [selectedPrivateConv, setSelectedPrivateConv] = useState<number | null>(
    null
  );
  const [isPrivatechan, setIsPrivatechan] = useState<number | null>(null);
  const [isPrivateConvButtonDisabled, setIsPrivateConvButtonDisabled] =
    useState(false);
  const [toNotify, setToNotify] = useState(false);
  const [invSend, setInvSend] = useState<invSend[]>([]);
  const [invReceive, setInvReceive] = useState<invSend[]>([]);
  const [userIsBanned, setUserIsBanned] = useState(false);
  const [pass, setpass] = useState("");
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notifyMSG, setNotifyMSG] = useState<string>("");
  const [notifyType, setNotifyType] = useState<number>(0);
  const [banTimeLeft, setBanTimeLeft] = useState<number>(0);
  const [kickChan, setKickChan] = useState("");
  const [kickReason, setKickReason] = useState("");

  const handleBeforeUnload = (e: BeforeUnloadEvent) => {};

  async function fetchYourRoomsList() {
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/chat/recupYourRooms`,
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
        const friendInfo = await Promise.all(
          friendObjects.map(
            async (friend: {
              name: string;
              visibility: string;
              id: number;
              AmIBanned: string;
            }) => {
              const isBannedResponse = await fetch(
                `http://${window.location.hostname}:3000/chat/banned/${user?.id}/${friend.id}`,
                {
                  method: "GET",
                  credentials: "include",
                }
              );
              if (isBannedResponse.ok) {
                const isBanned = await isBannedResponse.text();
                friend.AmIBanned = isBanned;
              }
              return friend;
            }
          )
        );
        setChannelsJoin(friendInfo);
      } else setChannelsJoin(data);
    } catch (error) {
      console.error("Erreur :", error);
      return [];
    }
  }

  async function fetchRoomsList() {
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/chat/recupRooms`,
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
        const friendObjects = data;
        const friendInfo = friendObjects.map(
          (friend: { name: string; visibility: string; id: number }) => ({
            name: friend.name,
            visibility: friend.visibility,
            id: friend.id,
          })
        );
        setChannels(friendInfo);
      } else setChannels(data);
    } catch (error) {
      console.error("Erreur :", error);
      return [];
    }
  }

  async function fetchUsernameById(userId: string) {
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/users/${userId}/username`,
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
      return null;
    }
  }

  async function fetchRoomNameById(roomId: string) {
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/chat/roomName/${roomId}/`,
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
        `http://${window.location.hostname}:3000/chat/recupPrivate`,
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
        const promises = data.map(async (userId: string, isBlocked: string) => {
          const username = await fetchUsernameById(userId);
          const isBlockedResponse = await fetch(
            `http://${window.location.hostname}:3000/friends/blocked/${userId}/${user?.id}`,
            {
              method: "GET",
              credentials: "include",
            }
          );
          const blocked = await isBlockedResponse.text();
          isBlocked = blocked;
          return { id: userId, username, isBlocked };
        });

        const usernames: privMSG[] = await Promise.all(promises);
        setPrivMSG(usernames);
        console.log(privMSG);
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

  async function checkBanned(userId: number, roomId: string) {
    if (!roomId || parseInt(roomId) === 0)
      return ;
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/chat/banned/${userId}/${roomId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des scores.");
      }
      const data = await response.text();
      if (userId === user?.id) {
        if (data === "false") setUserIsBanned(false);
        else setUserIsBanned(true);
      } else return data;
    } catch (error) {
      console.error("Erreur:", error);
    }
  }

  async function fetchBanTimeLeft(roomId: number) {
    if (!activeBanChannel || activeChannel === 0) return;
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/chat/timeBan/${user?.id}/${roomId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des messages privés.");
      } else {
        const data = await response.text();
        setBanTimeLeft(parseInt(data));
      }
    } catch (error: any) {
      console.log(error);
    }
    return "";
  }

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
        fetchYourRooms();
        fetchPossibleInvite();
        fetchInviteSend();
        fetchInviteReceive();
        fetchRooms();
      });
    }
    if (socket) {
      socket.on("refreshAll", () => {
        fetchPossibleInvite();
        fetchInviteSend();
        fetchInviteReceive();
        fetchYourRooms();
        fetchRooms();
      });
    }
    if (socket) {
      socket.on("refreshForOne", () => {
        setTimeout(() => {
          fetchYourRooms();
          fetchRooms();
        }, 500);
        setActiveChannel(0);
        setShowChatChannel(false);
      });
    }

    // const kickMessage = localStorage.getItem("kickMessage");
    // if (kickMessage) {
    //   setShowNotification(true);
    //   setNotifyMSG(kickMessage);
    //   setNotifyType(2);
    // }
    // localStorage.removeItem("kickMessage");

    // const muteMessage = localStorage.getItem("muteMessage");
    // if (muteMessage) {
    //   setShowNotification(true);
    //   setNotifyMSG(muteMessage);
    //   setNotifyType(2);
    // }
    // localStorage.removeItem("muteMessage");

    const banMessage = localStorage.getItem("banMessage");
    if (banMessage) {
      setShowNotification(true);
      setNotifyMSG(banMessage);
      setNotifyType(2);
    }
    localStorage.removeItem("banMessage");

    if (socket) {
      socket.on("refreshAfterKick", (roomName: string, reason: string) => {
        // window.location.reload();
        // window.location.href = "/chat";
        navigate("/chat");

        socket.emit("reloadListRoomForOne");
        // localStorage.setItem(
        //   "kickMessage",
        //   "You have been kicked from " + roomName + ". Raison: " + reason
        // );
        setShowNotification(true);
        setNotifyMSG(
          "You have been kicked from " + roomName + ". Raison: " + reason
        );
        setNotifyType(2);
      });
    }
    if (socket) {
      socket.on(
        "refreshAfterMute",
        (roomName: string, reason: string, time: number) => {
          setShowNotification(true);
          setNotifyMSG(
            "You have been muted from " +
              roomName +
              ". Raison: " +
              reason +
              ", pendant: " +
              time +
              " minutes"
          );
          setNotifyType(2);
        }
      );
    }
    if (socket) {
      socket.on(
        "refreshAfterBan",
        (roomId:number, roomName: string, reason: string, time: number) => {
          // window.location.reload();
          // window.location.href = "/chat";
          navigate("/chat");
          setActiveBanChannel(roomId);
          // localStorage.setItem(
          //   "banMessage",
          //   "You have been banned from " +
          //     roomNames +
          //     ". Raison: " +
          //     reason +
          //     ", pendant: " +
          //     time +
          //     " minutes"
          // );
          setShowNotification(true);
          setNotifyMSG(
            "You have been banned from " +
              roomName +
              ". Raison: " +
              reason +
              ", pendant: " +
              time +
              " minutes"
          );
          setNotifyType(2);
          fetchBanTimeLeft(roomId);
          setActiveChannel(0);
          setShowChatChannel(false);
        }
      );
    }

    if (socket) {
      socket.on("refreshMessages", async () => {
        await fetchPrivateConv();
        console.log(privMSG);
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

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (socket) {
      }
    };
  }, [activeChannel]);

  const checkRoomAlreadyExist = async () => {
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/chat/checkRoomName/${valueRoom}`,
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

  const checkIfAlreadyIn = async () => {
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/chat/checkIfIn/${valueRoom}/${user?.id}`,
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
      setTimeout(() => {
        socket.emit("ActuAtRoomCreate", valueRoom, selectedOption);
        socket.emit("reloadListRoomAtJoin", valueRoom);
      }, 300);
    } else {
      setShowNotification(true);
      setNotifyMSG("Name deja pris mon gars !");
      setNotifyType(2);
    }
    setValueRoom("");
    return "";
  };

  const joinRoom = async () => {
    if ((await checkRoomAlreadyExist()) === false) {
      setShowNotification(true);
      setNotifyMSG("Room n'existe pas !");
      setNotifyType(2);
      setValueRoom("");

      return "";
    }
    if ((await checkIfAlreadyIn()) === true) {
      setShowNotification(true);
      setNotifyMSG("Tu es deja dans le channel !");
      setNotifyType(2);
      setValueRoom("");
      return "";
    }
    if ((await checkRoomAlreadyExist()) === true) {
      socket.emit("joinChatRoom", valueRoom, selectedOption, password);
      setTimeout(() => {
        socket.emit("reloadListRoomAtJoin", valueRoom);
      }, 100);
    } else {
      setShowNotification(true);
      setNotifyMSG("Room n'existe pas !");
      setNotifyType(2);
    }
    setValueRoom("");
    return "";
  };

  const navToChan = async (id: number) => {
    if (user) {
      await checkBanned(user?.id, id.toString());
    }
    if (userIsBanned === true) {
      window.location.reload();
    } else {
      navigate(`/chat/chan/${id}`);
      setActiveChannel(id);
    }
  };

  const navToPrivateConv = (id: number) => {
    navigate(`/chat/priv/${id}`);
    setSelectedPrivateConv(id);
  };

  const clickToJoinChan = async (
    id: number,
    name: string,
    option: string,
    pass: string
  ) => {
    if (option === "PUBLIC") {
      socket.emit("joinChatRoom", name, option, "");
    } else if (option === "PWD_PROTECTED") {
      if (pass !== null) {
        socket.emit("joinChatRoom", name, option, pass);
      } else {
        alert(
          "Annulation : Vous devez fournir un mot de passe pour rejoindre le channel protégé."
        );
      }
    }
    setTimeout(() => {
      socket.emit("ActuAtRoomCreate");
    }, 300);
    setActiveChannel(0);
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
          `http://${window.location.hostname}:3000/chat/usersNotInRoom/${activeChannel}/${user?.id}`,
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
          `http://${window.location.hostname}:3000/chat/invSend/${user?.id}/${activeChannel}`,
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
        `http://${window.location.hostname}:3000/friends/blocked/${senderId}/${recipientId}`,
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
        `http://${window.location.hostname}:3000/chat/invReceive/${user?.id}/`,
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
      setInvReceive(updatedData);
      return data[0];
    } catch (error) {
      console.error("Erreur:", error);
      return [];
    }
  }

  const clickToInvite = async (id: number) => {
    if (!activeChannel || activeChannel === 0) {
      alert("Recipient ID is missing.");
      return;
    }
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/chat/invite/${user?.id}/${id}/${activeChannel}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      if (response.ok) {
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
      const response = await fetch(
        `http://${window.location.hostname}:3000/chat/refuse/${id}`,
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
    window.location.reload();
  }

  const handleJoinClick = (id: number) => {
    setpass("");
    setIsPromptOpen(true);
    setActiveChannel(id);
  };

  const handlePasswordChange = (event: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setpass(event.target.value);
  };

  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  const decrementBanTimeLeft = () => {
    if (banTimeLeft > 0) {
      setBanTimeLeft((prevTime) => prevTime - 1);
    } else if (banTimeLeft <= 0 && banTimeLeft >= -2) {
      fetchBanTimeLeft(activeBanChannel as number);
      setUserIsBanned(false);
      checkBanned(user?.id as number, activeBanChannel as any);
      setActiveBanChannel(0);
    }
  };

  useEffect(() => {
    const interval = setInterval(decrementBanTimeLeft, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [banTimeLeft]);

  return (
    <div className="main_chat_box" style={{ background: "darkgreen" }}>
      <div>
        {showNotification && (
          <Notify
            message={notifyMSG}
            type={notifyType}
            senderId={0}
            onClose={handleCloseNotification}
          />
        )}
      </div>
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
                        "PUBLIC",
                        ""
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
              <div>
                {isPromptOpen}
                <button
                  onClick={() => handleJoinClick(chan.id)}
                  disabled={activeChannel === chan.id}
                >
                  <div>
                    id: {chan.id} --- name chan: {chan.name} --- options:{" "}
                    {chan.visibility}
                  </div>
                </button>
                {isPromptOpen === true &&
                  activeChannel === chan.id &&
                  chan.visibility === "PWD_PROTECTED" && (
                    <div>
                      <input
                        type="password"
                        placeholder="Entrez le mot de passe"
                        value={pass}
                        onChange={handlePasswordChange}
                      />
                      <button
                        onClick={() =>
                          clickToJoinChan(
                            chan.id,
                            chan.name,
                            "PWD_PROTECTED",
                            pass
                          )
                        }
                        disabled={pass.length === 0}
                      >
                        Join
                      </button>
                    </div>
                  )}
                {chan.visibility === "PUBLIC" && activeChannel === chan.id && (
                  <button
                    onClick={() =>
                      clickToJoinChan(chan.id, chan.name, "PUBLIC", "")
                    }
                  >
                    Join
                  </button>
                )}
              </div>
            </div>
          ))}
        </ul>
      </div>
      <div>
        <ul>
          <h1>Liste des convos privées :</h1>
          {privMSG.map((priv) => (
            <div key={priv.id}>
              {priv.isBlocked === "false" && (
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
              )}
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
                onClick={ () => {
                  if (chan.AmIBanned === "false") {
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
                  } else {
                    setActiveBanChannel(chan.id);
                    setNotifyMSG(
                      "t bannis mon reuf pour " + banTimeLeft + " secondes"
                    );
                    setShowNotification(true);
                    setNotifyType(2);
                  }
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
      {!showChatChannel && id && <ChatChannel />}
      {!showConv && recipient && <PrivateChat />}
      {showConv && <PrivateChat />}
    </div>
  );
};

export default Chat;
