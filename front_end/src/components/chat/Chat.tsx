import React, { useContext, useEffect, useState } from "react";
import "./../../App.css";
import "./../../style/Chat.css";
import "./../../style/Profile.css";
import "./../../style/Logout.css";
import { useAuth } from "./../auth/AuthProvider";
import { Navigate, useParams } from "react-router-dom";
import icon from "../../img/buttoncomp.png";
import nav from "../../img/buttoncomp.png";
import logo from "../../img/logo42.png";
import { Logout } from "./../auth/Logout";
import { WebsocketContext } from "../../services/WebsocketContext";
import { useNavigate } from "react-router-dom";
import ChatChannel from "./ChatChannel";
import PrivateChat from "./PrivateChat";
import Notify from "../../services/Notify";
import "../../style/Profile.css";
import "../../style/Home.css";

import foldergreen from "../../img/foldergreen.png";
import folderblue from "../../img/folderblue.png";
import folderpink from "../../img/folderpink.png";
import folderyellow from "../../img/folderyellow.png";
import folderwhite from "../../img/folderwhite.png";
import folderviolet from "../../img/folderviolet.png";
import folderred from "../../img/folderred.png";

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
  status: string;
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
  const [showChatButton, setShowChatButton] = useState(false);

  const [notifyMSG, setNotifyMSG] = useState<string>("");
  const [notifyType, setNotifyType] = useState<number>(0);
  const [banTimeLeft, setBanTimeLeft] = useState<number>(0);
  const [kickChan, setKickChan] = useState("");
  const [kickReason, setKickReason] = useState("");
  const [activeChannelName, setActiveChannelName] = useState("");

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
        const promises = data.map(
          async (userId: string, isBlocked: string, status: string) => {
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
            const statusResponse = await fetch(
              `http://${window.location.hostname}:3000/users/status/${userId}`,
              {
                method: "GET",
                credentials: "include",
              }
            );
            const repStatus = await statusResponse.text();
            status = repStatus;
            return { id: userId, username, isBlocked, status };
          }
        );

        const usernames: privMSG[] = await Promise.all(promises);
        setPrivMSG(usernames);
      } else {
        setPrivMSG(data);
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
    if (!roomId || parseInt(roomId) === 0) return;
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
    if (!roomId) return;
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
        fetchInviteSend();
        fetchInviteReceive();
        fetchRooms();
        fetchPossibleInvite();
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
          fetchPrivateConv();
          fetchPossibleInvite();
          fetchInviteReceive();
        }, 500);
        setActiveChannel(0);
        setShowChatChannel(false);
        setIsPrivatechan(0);
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
        async (
          roomId: number,
          roomName: string,
          reason: string,
          time: number
        ) => {
          navigate("/chat");
          setActiveBanChannel(roomId);
          setActiveChannel(roomId);
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
      socket.on("refreshAfterUnban", async () => {
        fetchYourRooms();
        setBanTimeLeft(-1);
      });
    }

    if (socket) {
      socket.on("refreshMessages", async () => {
        fetchPrivateConv();
      });
    }
    if (socket) {
      socket.on("refreshMessagesRoom", () => {
        fetchPossibleInvite();
        setTimeout(() => {
          fetchPrivateConv();
        }, 300);
      });
    }
    if (socket) {
      socket.on("NotifyReceiveChannelInvit", () => {
        fetchInviteReceive();
      });

      if (socket) {
        socket.on("NotifyBadPWD", () => {
          setNotifyMSG("Wrong password");
          setNotifyType(2);
          setShowNotification(true);
        });
      }
    }

    fetchYourRooms();
    fetchRooms();
    fetchPrivateConv();
    fetchPossibleInvite();
    fetchInviteSend();
    fetchInviteReceive();

    if (banTimeLeft <= 0 && activeBanChannel) {
      setUserIsBanned(false);
      checkBanned(user?.id as number, activeBanChannel as any);
      setActiveBanChannel(0);
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (socket) {
      }
    };
  }, [activeChannel, banTimeLeft]);

  useEffect(() => {
    if (socket) {
      socket.on("SomeoneGoOnlineOrOffline", () => {
        setTimeout(() => {
          fetchPrivateConvList();
        }, 500);
      });
    }
  });

  const checkRoomAlreadyExist = async () => {
    if (!valueRoom) return;
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
    setIsButtonDisabled(true);
    setPassword("");
    return "";
  };

  const joinRoom = async () => {
    if ((await checkRoomAlreadyExist()) === false) {
      setShowNotification(true);
      setNotifyMSG("Room n'existe pas !");
      setNotifyType(2);
      setValueRoom("");
      setIsButtonDisabled(true);
      return "";
    }
    if ((await checkIfAlreadyIn()) === true) {
      setShowNotification(true);
      setNotifyMSG("Tu es deja dans le channel !");
      setNotifyType(2);
      setValueRoom("");
      setIsButtonDisabled(true);
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
    setIsButtonDisabled(true);
    return "";
  };

  const navToChan = async (id: number, name: string) => {
    if (user) {
      await checkBanned(user?.id, id.toString());
    }
    if (userIsBanned === true) {
      window.location.reload();
    } else {
      navigate(`/chat/chan/${id}`);
      setActiveChannel(id);
      setActiveChannelName(name);
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
        } else setNotInRoom(data);
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
        setNotifyMSG("Invite sent");
        setNotifyType(2);
        setShowNotification(true);
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
    socket.emit("reloadListRoom");
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

  const desacButton = () => {
    setShowChatChannel(false);
    setActiveChannel(0);
    setSelectedPrivateConv(recipient as any);
  };

  // const decrementBanTimeLeft = () => {
  //   if (banTimeLeft > 0) {
  //     console.log('cacaacaca');
  //     setBanTimeLeft((prevTime) => prevTime - 1);
  //   } else if (banTimeLeft <= 0 && banTimeLeft >= -2) {
  //     fetchBanTimeLeft(activeBanChannel as number);
  //     setUserIsBanned(false);
  //     checkBanned(user?.id as number, activeBanChannel as any);
  //     setActiveBanChannel(0);
  //   }
  // };

  // useEffect(() => {
  //   const interval = setInterval(decrementBanTimeLeft, 1000);

  //   return () => {
  //     clearInterval(interval);
  //   };
  // }, [banTimeLeft]);

  const navigateToProfPage = () => {
    navigate(`/users/profile/${user?.id}`);
  };

  const navigateToChat = () => {
    navigate("/chat");
  };

  const navToGamePage = () => {
    navigate("/gamePage");
  };

  const navigateToFriends = () => {
    navigate("/friends");
  };

  const navigateToSettings = () => {
    navigate("/settings");
  };
  const navigateToHome = () => {
    navigate("/");
  };

  const leftChannel = async () => {
    if (!id) return;
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/chat/leftChan/${id}/${user?.id}`,
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
    // setTimeout(() => {
    //   socket.emit("reloadMessRoom", id);
    // }, 100);
    setTimeout(() => {
      socket.emit("reloadListRoomForOne", id);
    }, 500);
    navigate("/chat");
  };

  return (
    <>
      <header>
        <div>
          <img src={nav} alt="Menu 1" />
        </div>
        <h1>TRANSCENDENCE</h1>
      </header>
      <div className="flex-bg">
        <main>
          <div className="fullpage fullpagechat">
            <div className="navbarbox">
              <img src={icon} alt="icon" />
              <h1> Chat </h1>
            </div>

            <div className="main_chat_box">
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
              <div className="divdeschats">
                <div className="small-box ">
                  <div>
                    <ul>
                      <div className="navbarsmallbox chantitle">
                        <p style={{ color: "white" }}>received invitations</p>
                      </div>
                      {invReceive.length === 0 ? (
                        <p>no invitations</p>
                      ) : (
                        invReceive.map((chan) => (
                          <div key={chan.id}>
                            {!chan.isBlocked && (
                              <div>
                                <p
                                  style={{
                                    fontWeight: "bold",
                                    marginBottom: "0",
                                  }}
                                >
                                  {chan.chatRoomName}
                                </p>
                                <button
                                  className="buttonseemore buttonokchan"
                                  onClick={() =>
                                    clickToJoinChan(
                                      parseInt(chan.id),
                                      chan.chatRoomName,
                                      "PUBLIC",
                                      ""
                                    )
                                  }
                                >
                                  accept request
                                  <div></div>
                                </button>
                                <button
                                  className="buttonseemore buttonnotchan"
                                  onClick={() =>
                                    refuseInvite(chan.id.toString())
                                  }
                                >
                                  deny request
                                </button>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </ul>
                  </div>

                  <div>
                    <ul>
                      <div className="navbarsmallbox chantitle">
                        <p style={{ color: "white" }}>available channels</p>
                      </div>
                      {channels.length === 0 ? (
                        <p>no available chan for u </p>
                      ) : (
                        channels.map((chan) => (
                          <div key={chan.id}>
                            <div>
                              {isPromptOpen}
                              <button
                                className="buttonseemore buttonchan"
                                onClick={() => handleJoinClick(chan.id)}
                                disabled={activeChannel === chan.id}
                              >
                                <div>
                                  {chan.name} --- {chan.visibility}
                                </div>
                              </button>
                              {isPromptOpen === true &&
                                activeChannel === chan.id &&
                                chan.visibility === "PWD_PROTECTED" && (
                                  <div>
                                    <input
                                      className="inputpasswd"
                                      type="password"
                                      placeholder="enter password"
                                      value={pass}
                                      onChange={handlePasswordChange}
                                    />
                                    <button
                                      className="buttonseemore buttonchan"
                                      onClick={() =>
                                        clickToJoinChan(
                                          chan.id,
                                          chan.name,
                                          "PWD_PROTECTED",
                                          pass
                                        )
                                      }
                                      disabled={
                                        pass.length === 0 || pass.length > 15
                                      }
                                    >
                                      Join
                                    </button>
                                  </div>
                                )}
                              {chan.visibility === "PUBLIC" &&
                                activeChannel === chan.id && (
                                  <button
                                    className="buttonseemore buttonchan"
                                    onClick={() =>
                                      clickToJoinChan(
                                        chan.id,
                                        chan.name,
                                        "PUBLIC",
                                        ""
                                      )
                                    }
                                  >
                                    Join
                                  </button>
                                )}
                            </div>
                          </div>
                        ))
                      )}
                    </ul>
                  </div>
                </div>
                <div className="small-box">
                  <div>
                    <ul>
                      <div className="navbarsmallbox chantitle">
                        <p style={{ color: "white" }}>slide in your dm</p>
                      </div>
                      {privMSG.length === 0 ||
                      privMSG.every((priv) => priv.isBlocked === "true") ? (
                        <p>no dm</p>
                      ) : (
                        privMSG.map((priv) => (
                          <div key={priv.id}>
                            {priv.isBlocked === "false" && (
                              <button
                                className="buttonseemore buttonchan"
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
                                  {priv.username} - {priv.status}
                                </div>
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </ul>
                  </div>

                  <div>
                    <ul>
                      <div className="navbarsmallbox chantitle">
                        <p style={{ color: "white" }}>joined channels</p>
                      </div>
                      {channelsJoin.length === 0 ? (
                        <p>no chan joined</p>
                      ) : (
                        channelsJoin.map((chan) => (
                          <div key={chan.id}>
                            <button
                              className="buttonseemore buttonchan"
                              onClick={() => {
                                if (showChatButton === false)
                                  setShowChatButton(true);
                                else setShowChatButton(true);
                                if (chan.AmIBanned === "false") {
                                  navToChan(chan.id, chan.name);
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
                                  fetchBanTimeLeft(chan.id);
                                  setActiveBanChannel(chan.id);
                                  setNotifyMSG(
                                    "you've been banned for " +
                                      banTimeLeft +
                                      " seconds"
                                  );
                                  setShowNotification(true);
                                  setNotifyType(2);
                                }
                              }}
                              disabled={activeChannel === chan.id}
                            >
                              <div>
                                {chan.name} --- {chan.visibility}
                              </div>
                            </button>
                            {activeChannel === chan.id &&
                              showChatButton === true && (
                                <div>
                                  <button
                                    className="buttonseemore buttonchan leave"
                                    onClick={leftChannel}
                                  >
                                    Leave chan
                                  </button>
                                </div>
                              )}
                          </div>
                        ))
                      )}
                      <div>
                        {isPrivatechan === 1 && (
                          <div>
                            <ul>
                              <p>invite them!</p>
                              {notInRoom.map((chan) => (
                                <div key={chan.id}>
                                  <div style={{ fontWeight: "bold" }}>
                                    {chan.username}
                                  </div>
                                  <button
                                    className="buttonseemore buttonchan"
                                    onClick={() => clickToInvite(chan.id)}
                                  >
                                    Invite to chan
                                  </button>
                                </div>
                              ))}
                            </ul>
                            <ul>
                              <p>you already invited</p>
                              {invSend.map((invsend) => (
                                <div key={invsend.id}>
                                  <div>{invsend.username}</div>
                                  <button
                                    className="buttonseemore buttonnotchan"
                                    onClick={() =>
                                      refuseInvite(invsend.id.toString())
                                    }
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
                </div>
                <div className="small-box wider-box">
                  {/* <div className="chat_list">
                    <div className="navbarmainpage nav_box">
                      <img src={icon} className="buttonnav" alt="icon" />
                      <p className="title_box">WHO'S ONLINE</p>
                    </div>
                  </div> */}
                  {/* <div className="message_box"> */}
                  {/* <img src={icon} className="buttonnav" alt="icon" /> */}
                  {/* <div className="chatbox">  */}
                  {!showConv && recipient && <PrivateChat />}
                  {showConv && <PrivateChat />}
                  {/* <div className="navbarsmallbox "> */}
                  {/* <p style={{color:"black"}} className="title_box">CONV WITH {activeChannelName}</p> */}
                  {showChatChannel && <ChatChannel />}
                  {/* </div> */}
                  {!showChatChannel && id && <ChatChannel />}
                  {/* </div> */}
                  {/* </div> */}
                </div>
                <div className="small-box">
                  <div>
                    <div className="navbarsmallbox chantitle putain">
                      <p style={{ color: "white" }}>create new chan</p>
                    </div>
                    <input
                      className="labelcss select-chat"
                      type="text"
                      placeholder="Nom de la room"
                      value={valueRoom}
                      onChange={handleInputChange}
                    />
                    <select
                      className="buttonseemore selectfield"
                      value={selectedOption}
                      onChange={handleOptionChange}
                    >
                      <option value="public">public</option>
                      <option value="private">private</option>
                      <option value="protected">protected</option>
                    </select>
                    {selectedOption === "protected" && (
                      <input
                        type="password"
                        placeholder="Mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    )}
                    <button
                      className="buttonseemore buttonchan"
                      onClick={createRoom}
                      disabled={
                        isButtonDisabled ||
                        (selectedOption === "protected" &&
                          (password.length === 0 || password.length > 15)) ||
                        valueRoom.length > 15
                      }
                    >
                      create new room
                    </button>
                    <button
                      className="buttonseemore buttonchan"
                      onClick={joinRoom}
                      disabled={
                        isButtonDisabled ||
                        (selectedOption === "protected" &&
                          (password.length === 0 || password.length > 15)) ||
                        valueRoom.length > 15
                      }
                    >
                      join existing room
                    </button>
                  </div>
                </div>
              </div>
              {/* {showChatChannel && <ChatChannel />}
      {!showChatChannel && id && <ChatChannel />} */}
              {/* {!showConv && recipient && <PrivateChat />}
      {showConv && <PrivateChat />} */}
              {(showConv || recipient) && showChatChannel && (
                <div>{desacButton() as any}</div>
              )}
            </div>
          </div>
        </main>
        <nav>
          <ul>
            <li className="menu-item">
              <a onClick={navigateToHome}>
                <img src={folderviolet} alt="Menu 3" />
                <p>Home</p>
              </a>
            </li>
            <li className="menu-item">
              <a onClick={() => navToGamePage()}>
                <img src={folderblue} alt="Menu 3" />
                <p>Game</p>
              </a>
            </li>
            <li className="menu-item">
              <a onClick={navigateToProfPage}>
                <img src={folderpink} alt="Menu 3" />
                <p>Profile</p>
              </a>
            </li>
            <li className="menu-item">
              <a onClick={navigateToSettings}>
                <img src={folderyellow} alt="Menu 3" />
                <p>Settings</p>
              </a>
            </li>
            <li className="menu-item">
              <a onClick={navigateToFriends}>
                <img src={folderwhite} alt="Menu 3" />
                <p>Friends</p>
              </a>
            </li>
            <li className="menu-item">
              <a onClick={navigateToChat}>
                <img src={foldergreen} alt="Menu 3" />
                <p>Chat</p>
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <footer>
        <button className="logoutBtn" onClick={() => Logout({ user, setUser })}>
          LOG OUT{" "}
        </button>
        <img src={logo} className="logo" alt="icon" />
      </footer>
    </>
  );
};

export default Chat;
