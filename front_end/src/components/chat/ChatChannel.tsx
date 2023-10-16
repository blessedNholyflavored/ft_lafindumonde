import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import "./../../App.css";
import "./../../style/Chat.css";
import "./../../style/Logout.css";
import { useAuth } from "./../auth/AuthProvider";
import { useParams } from "react-router-dom";
import { WebsocketContext } from "../../services/WebsocketContext";
import { useNavigate } from "react-router-dom";
import Notify from "../../services/Notify";

interface messages {
  start_at: string;
  content: string;
  senderUsername: string;
  senderId: number;
  senderRole: string;
  isBlocked: string;
}

interface users {
  id: number;
  username: string;
  role: string;
  isBlocked: string;
  isMuted: string;
  status: string;
}

export const ChatChannel = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const [value, setValue] = useState("");
  const navigate = useNavigate();
  const socket = useContext(WebsocketContext);
  const [messageListSend, setMessageList] = useState<messages[]>([]);
  const [usersInRoom, setUsersInRoom] = useState<users[]>([]);
  const [yourRole, setYourRole] = useState("USER");
  const [showMenu, setShowMenu] = useState(false);
  const [userIsBanned, setUserIsBanned] = useState(false);
  const [userIsMuted, setUserIsMuted] = useState(false);
  const [selectedUser, setSelectedUser] = useState(0);
  const [muteTimeLeft, setMuteTimeLeft] = useState(0);
  const [selectedUserRole, setSelectedUserRole] = useState("USER");
  const [selectedUserIsMuted, setSelectedUserIsMuted] = useState<string | any>(
    "false"
  );
  const [newPass, setNewPass] = useState("");
  const [selectedUserIsBanned, setSelectedUserIsBanned] = useState<
    string | any
  >("false");
  const [reactu, setReactu] = useState(0);
  const [changeStatutButton, setChangeStatutButton] = useState(false);
  const [onMute, setOnMute] = useState(false);
  const [onBan, setOnBan] = useState(false);
  const [onKick, setOnKick] = useState(false);
  const [timeMute, setTimeMute] = useState("");
  const [reasonMute, setReason] = useState("");
  const [timeBan, setTimeBan] = useState("");
  const [reasonBan, setReasonBan] = useState("");
  const [reasonKick, setReasonKick] = useState("");
  const [onPWD, setOnPWD] = useState(false);
  const [statutChan, setStatutChan] = useState("PUBLIC");
  const [showNotification, setShowNotification] = useState(false);
  const [notifyMSG] = useState<string>("");
  const [notifyType] = useState<number>(0);
  const [sender] = useState<number>(0);
  const bottomEl = useRef<null | HTMLDivElement>(null);

  const fetchRoomMessageList = useCallback(async () => {
    if (!id) return;
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/chat/recupRoomMess/${id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (response.status === 401) {
        navigate("/chat");
      } else if (!response.ok) {
        throw new Error("Erreur lors de la récupération des messages privés.");
      }

      const data = await response.json();
      if (data.length > 0) {
        const usernamePromises = data.map(
          async (message: {
            senderRole: string;
            senderId: any;
            senderUsername: string;
            isBlocked: string;
          }) => {
            try {
              const senderResponse = await fetch(
                `http://${window.location.hostname}:3000/users/${message.senderId}/username`,
                {
                  method: "GET",
                  credentials: "include",
                }
              );
              const rolesenderResponse = await fetch(
                `http://${window.location.hostname}:3000/chat/getRole/${message.senderId}/${id}`,
                {
                  method: "GET",
                  credentials: "include",
                }
              );
              const isBlockedResponse = await fetch(
                `http://${window.location.hostname}:3000/friends/blocked/${message.senderId}/${user?.id}`,
                {
                  method: "GET",
                  credentials: "include",
                }
              );
              if (
                senderResponse.ok &&
                rolesenderResponse.ok &&
                isBlockedResponse.ok
              ) {
                const senderUsername = await senderResponse.text();
                const senderRole = await rolesenderResponse.text();
                const isBlocked = await isBlockedResponse.text();

                message.senderUsername = senderUsername;
                message.senderRole = senderRole;
                message.isBlocked = isBlocked;
              }
            } catch (error: any) {
              console.log(error);
            }
          }
        );
        await Promise.all(usernamePromises);

        setMessageList(data);
      }
      setTimeout(() => {
        scrollToBottom();
      }, 300);
    } catch (error) {
      console.log(error);
    }
  }, [id, navigate, user?.id]);

  const fectUserInRoomList = useCallback(async () => {
    if (!id) return;
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/chat/getUserInRoom/${id}`,
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
              id: number;
              username: string;
              role: string;
              isBlocked: string;
              isMuted: string;
              status: string;
            }) => {
              if (user) {
                const isBlockedResponse = await fetch(
                  `http://${window.location.hostname}:3000/friends/blocked/${friend.id}/${user?.id}`,
                  {
                    method: "GET",
                    credentials: "include",
                  }
                );
                const isMutedResponse = await fetch(
                  `http://${window.location.hostname}:3000/chat/muted/${friend.id}/${id}`,
                  {
                    method: "GET",
                    credentials: "include",
                  }
                );
                const statusResponse = await fetch(
                  `http://${window.location.hostname}:3000/users/status/${friend.id}`,
                  {
                    method: "GET",
                    credentials: "include",
                  }
                );
                if (
                  isBlockedResponse.ok &&
                  isMutedResponse.ok &&
                  statusResponse.ok
                ) {
                  const isBlocked = isBlockedResponse.text();
                  friend.isBlocked = await isBlocked;
                  const isMuted = isMutedResponse.text();
                  friend.isMuted = await isMuted;
                  const status = statusResponse.text();
                  friend.status = await status;
                }
              }
              return friend;
            }
          )
        );
        setUsersInRoom(friendInfo);
      }
    } catch (error: any) {
      console.log(error);
    }
  }, [id, user]);

  const fetchYourRole = useCallback(
    async (userId: number) => {
      if (!id)
        return "";
      try {
        const response = await fetch(
          `http://${window.location.hostname}:3000/chat/getRole/${userId}/${id}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Erreur lors de la récupération des messages privés."
          );
        } else {
          const data = await response.text();
          return data;
        }
      } catch (error: any) {
        console.log(error);
      }
      return "";
    },
    [id]
  );

  const fetchMuteTimeLeft = useCallback(
    async (userId: number) => {
      if (id) {
        try {
          const response = await fetch(
            `http://${window.location.hostname}:3000/chat/timeMute/${userId}/${id}`,
            {
              method: "GET",
              credentials: "include",
            }
          );

          if (!response.ok) {
            throw new Error(
              "Erreur lors de la récupération des messages privés."
            );
          } else {
            const data = await response.text();
            setMuteTimeLeft(parseInt(data));
          }
        } catch (error: any) {
          console.log(error);
        }
        return "";
      }
    },
    [id]
  );

  const fetchLastMessage = useCallback(async () => {
    if (!id) return;
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/chat/recupRoomMessLast/${id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des messages privés.");
      }
      const messages = await response.json();
      try {
        const senderResponse = await fetch(
          `http://${window.location.hostname}:3000/users/${messages.senderId}/username`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        const rolesenderResponse = await fetch(
          `http://${window.location.hostname}:3000/chat/getRole/${messages.senderId}/${id}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        const isBlockedResponse = await fetch(
          `http://${window.location.hostname}:3000/friends/blocked/${messages.senderId}/${user?.id}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (
          senderResponse.ok &&
          rolesenderResponse.ok &&
          isBlockedResponse.ok
        ) {
          const senderUsername = await senderResponse.text();
          const senderRole = await rolesenderResponse.text();
          const isBlocked = await isBlockedResponse.text();

          messages.senderUsername = senderUsername;
          messages.senderRole = senderRole;
          messages.isBlocked = isBlocked;
        }
      } catch (error) {
        console.log(error);
      }
      setMessageList((prevMessages) => [...prevMessages, messages]);
      return messages;
    } catch (error) {
      console.error("Erreur :", error);
      return null;
    }
  }, [id, user?.id]);

  const scrollToBottom = () => {
    bottomEl?.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  const checkBanned = useCallback(
    async (userId: number) => {
      if (!id) return;
      try {
        const response = await fetch(
          `http://${window.location.hostname}:3000/chat/banned/${userId}/${id}`,
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
    },
    [id, user?.id]
  );

  const checkMuted = useCallback(
    async (userId: number) => {
      if (!id) return;
      try {
        const response = await fetch(
          `http://${window.location.hostname}:3000/chat/muted/${userId}/${id}`,
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
          if (data === "false") setUserIsMuted(false);
          else setUserIsMuted(true);
        } else return data;
      } catch (error) {
        console.error("Erreur:", error);
      }
    },
    [id, user?.id]
  );

  useEffect(() => {
    if (socket) {
      socket.on("refreshMessagesRoom", () => {
        fetchLastMessage();
        setTimeout(() => {
          scrollToBottom();
        }, 500);
      });
    }
    return () => {
      if (socket) {
        socket.off("refreshMessagesRoom");
      }
    };
  }, [id, fetchLastMessage, socket]);

  useEffect(() => {
    if (reactu === 0) {
      setTimeout(() => {
        setReactu(1);
      }, 100);
    }
  }, [reactu]);

  useEffect(() => {
    if (reactu === 0) return;

    async function fetchRoomMessage() {
      await fetchRoomMessageList();
    }
    async function fetchUserRole() {
      if (user) {
        const scores = await fetchYourRole(user?.id);
        setYourRole(scores);
      }
    }
    async function fetchUserInRoom() {
      await fectUserInRoomList();
    }
    async function UserIsmuted() {
      if (user) {
        await checkMuted(user?.id);
      }
    }
    async function UserIsbanned() {
      if (user) {
        await checkBanned(user?.id);
      }
    }

    async function MuteTimeLeft() {
      if (user) {
        await fetchMuteTimeLeft(user?.id);
      }
    }

    if (socket) {
      socket.on("refreshListRoom", () => {
        fetchUserInRoom();
        fetchUserRole();
      });
    }

    if (socket) {
      socket.on("refreshAfterStatusChange", () => {
        fetchUserInRoom();
        fetchUserRole();
        fetchRoomMessage();
      });
    }

    if (socket) {
      socket.on(
        "refreshAfterMute",
        (roomName: string, reason: string, time: number) => {
          MuteTimeLeft();
          setUserIsMuted(false);
          UserIsmuted();
        }
      );
    }

    if (socket) {
      socket.on("refreshAfterUnmute", async () => {
        setMuteTimeLeft(-1);
      });
    }

    if (socket) {
      socket.on("SomeoneGoOnlineOrOffline", () => {
        setTimeout(() => {
          fetchUserInRoom();
        }, 150);
      });
    }

    fetchRoomMessage();
    fetchUserRole();
    fetchUserInRoom();
    UserIsmuted();
    UserIsbanned();
    MuteTimeLeft();
    if (userIsBanned === true) navigate("/chat");
    return () => {
      if (socket) {
        socket.off("SomeoneGoOnlineOrOffline");
        socket.off("refreshAfterUnmute");
        socket.off("refreshAfterMute");
        socket.off("refreshAfterStatusChange");
        socket.off("refreshListRoom");
      }
    };
  }, [
    reactu,
    userIsBanned,
    checkBanned,
    checkMuted,
    fectUserInRoomList,
    fetchMuteTimeLeft,
    fetchRoomMessageList,
    fetchYourRole,
    navigate,
    socket,
    user,
  ]);

  const onSubmit = () => {
    if (value.length > 0) {
      socket.emit("newMessageRoom", value, id);
      setValue("");
      setTimeout(() => {
        socket.emit("reloadMessRoomTEST", id);
      }, 100);
    }
    setValue("");
  };

  const kickFromChannel = async (userId: number) => {
    const reason = reasonKick;
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/chat/leftChan/${id}/${userId}`,
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
      socket.emit("reloadMessRoom", id);
      socket.emit("onkickFromChannel", userId, id, reason);
    }, 100);
    setReasonKick("");
    setSelectedUser(0);
    setOnKick(false);
  };

  const MuteFromChannel = async (userId: number) => {
    let reason = reasonMute;
    let time = timeMute;
    if (!time) time = "0";
    if (!reason) reason = "";
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/chat/mute/${id}/${userId}/${time}`,
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
      socket.emit("reloadMessRoom", id);
      socket.emit("muteFromChannel", userId, id, reason, time);
    }, 100);
    setReason("");
    setTimeMute("");
    setSelectedUser(0);
  };

  const BanFromChannel = async (userId: number) => {
    let reason = reasonBan;
    let time = timeBan;
    if (!time) time = "0";
    if (!reason) reason = "";
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/chat/ban/${id}/${userId}/${time}`,
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
      socket.emit("reloadMessRoom", id);
      socket.emit("banFromChannel", userId, id, reason, time);
    }, 100);
    setTimeBan("");
    setReasonBan("");
    setSelectedUser(0);
  };

  const UnbanFromChannel = async (userId: number) => {
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/chat/unban/${id}/${userId}}`,
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
      socket.emit("UnbanUser", userId);
    }, 100);
    setSelectedUser(0);
  };

  const UnMuteFromChannel = async (userId: number) => {
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/chat/unmute/${id}/${userId}/`,
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
      socket.emit("UnmuteUser", userId);
    }, 100);
    setSelectedUser(0);
  };

  const handleUserClick = async (userId: number) => {
    let flag = 0;
    if (selectedUser !== 0 && userId === selectedUser) flag = 1;
    setSelectedUser(userId);
    setShowMenu(true);
    const role = await fetchYourRole(userId);
    setSelectedUserRole(role);
    const mute = await checkMuted(userId);
    setSelectedUserIsMuted(mute);
    const ban = await checkBanned(userId);
    setSelectedUserIsBanned(ban);
    if (flag === 1) setSelectedUser(0);
  };

  const handleViewProfile = () => {
    navigate(`/users/profile/${selectedUser}`);
    setShowMenu(false);
  };

  async function checkBlockedForNotify(senderId: string, recipientId: number) {
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
      console.log(data);
      return data;
    } catch (error) {
      console.error("Erreur:", error);
      return false;
    }
  }

  async function inviteToMatch(sender: string, recipient: number) {
    if (
      user &&
      (await checkBlockedForNotify(user?.id.toString(), recipient)) === false
    )
      socket.emit("inviteToMatch", recipient);
  }

  if (socket) {
    socket?.on("matchStart", (roomdId: number) => {
      navigate(`/gamefriend/${roomdId}`);
    });
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
    setTimeout(() => {
      socket.emit("reloadMessRoom", id);
    }, 100);
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
      socket.emit("reloadMessRoom", id);
    }, 150);
  }

  async function passAdminOfChannel(userId: number) {
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/chat/admin/${userId}/${id}`,
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
      socket.emit("reloadMessRoom", id);
    }, 100);
    setSelectedUser(0);
  }

  async function demoteAdminOfChannel(userId: number) {
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/chat/demoteAdmin/${userId}/${id}`,
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
      socket.emit("reloadMessRoom", id);
    }, 100);
    setSelectedUser(0);
  }

  async function getStatutChan() {
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/chat/statut/${id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des scores.");
      }
      const data = await response.text();
      setStatutChan(data);
    } catch (error) {
      console.error("Erreur:", error);
    }
  }

  async function ChangeStatutChan(option: string) {
    let pass: string | null = "42";
    if (option === "PWD_PROTECTED") {
      pass = newPass;
    }
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/chat/changeStatut/${id}/${option}/${pass}`,
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
      socket.emit("reloadListRoom", id);
    }, 100);
    setNewPass("");
    setOnPWD(false);
  }

  function handleMuteButton() {
    if (onMute === true) setOnMute(false);
    else setOnMute(true);
  }

  function handleBanButton() {
    if (onBan === true) setOnBan(false);
    else setOnBan(true);
  }

  function handleKickButton() {
    if (onKick === true) setOnKick(false);
    else setOnKick(true);
  }

  function handleChangeToPWD() {
    if (onPWD === true) setOnPWD(false);
    else setOnPWD(true);
  }

  const handleEnter = (e: { key: string }) => {
    if (e.key === "Enter") {
      onSubmit();
    }
  };

  const decrementMuteTimeLeft = useCallback(async () => {
    if (muteTimeLeft > 0) {
      setMuteTimeLeft((prevTime) => prevTime - 1);
    } else if (muteTimeLeft <= 0 && muteTimeLeft >= -2) {
      fetchMuteTimeLeft(user?.id as number);
      setUserIsMuted(false);
      setValue("");
    }
  }, [fetchMuteTimeLeft, muteTimeLeft, user?.id]);

  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  async function messagePage(recipientId: string) {
    setSelectedUser(0);
    navigate(`/chat/priv/${recipientId}`);
  }

  useEffect(() => {
    const interval = setInterval(decrementMuteTimeLeft, 1000);
    if (muteTimeLeft <= 0 && muteTimeLeft >= -2) {
      fetchMuteTimeLeft(user?.id as number);
      setUserIsMuted(false);
      setValue("");
    }
    return () => {
      clearInterval(interval);
    };
  }, [muteTimeLeft, decrementMuteTimeLeft, fetchMuteTimeLeft, user?.id]);

  return (
    <div className="testingchat channelchat">
      {showNotification && (
        <Notify
          message={notifyMSG}
          type={notifyType}
          senderId={sender}
          onClose={handleCloseNotification}
        />
      )}
      {/* <div className="realchat"> */}
      <div ref={bottomEl}>
        <div>
          {id && (
            <ul style={{ marginBottom: "50px" }}>
              {messageListSend.length > 0 && user ? (
                messageListSend.map((friend, index) => (
                  <div className="messorder" key={index}>
                    {friend.senderId === user?.id && (
                      <div className="sentmessage">
                        <div>
                          {/* <div>{friend.start_at}</div> */}
                          <div className="whoschattin">
                            {friend.senderUsername}
                            {/* --- {friend.senderRole} */}
                          </div>
                          <div>{friend.content}</div>
                        </div>
                      </div>
                    )}
                    {friend.senderId !== user?.id &&
                      friend.isBlocked === "false" && (
                        <div className="receivedmessage">
                          <div>
                            {/* <div>{friend.start_at}</div> */}
                            <div className="whoschattin">
                              {friend.senderUsername}
                            </div>
                            <div>
                              {friend.content}
                              {/* --- {friend.senderRole} */}
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                ))
              ) : (
                <div>no messages yet!</div>
              )}
            </ul>
          )}
          <button className="button-reset"></button>
        </div>
        <div className="chatmessagebar">
          {userIsMuted === true && (
            <div>
              <input
                type="text"
                value={muteTimeLeft + " secondes time left for you mute"}
                onChange={(e) => setValue(e.target.value)}
              />
              <button className="buttonseemore buttonchan" disabled>
                send
              </button>
            </div>
          )}
          {yourRole === "OWNER" && (
            <button
              className="buttonseemore buttonchan"
              onClick={() => {
                if (changeStatutButton === false) setChangeStatutButton(true);
                else setChangeStatutButton(false);
                getStatutChan();
              }}
            >
              change privacy status
            </button>
          )}
          {userIsMuted === false && (
            <div className="sendingzonechannel">
              <input
                className="sendchanbttn"
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyPress={handleEnter}
              />
              <button
                className="buttonseemore buttonchan"
                onClick={onSubmit}
                disabled={value.length > 80}
              >
                send
              </button>
            </div>
          )}
        </div>
      </div>

      <div>
        {changeStatutButton && statutChan === "PWD_PROTECTED" && (
          <div className="boxrowtest jpp">
            <div className="navbarsmallbox jpp ">
              <p style={{ color: "white" }}>change chan status</p>
            </div>
            {/* <button 
                className="buttonseemore buttonchan"
                onClick={() => handleOnChangeMDP()}>
                Change password
              </button> */}
            <button
              className="buttonseemore buttonchan zindexcosin"
              onClick={() => ChangeStatutChan("PWD_PROTECTED")}
              disabled={newPass.length === 0 || newPass.length > 15}
            >
              Change pass
            </button>
            <input
              className="inputtestt"
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
            />
          </div>
        )}

        {changeStatutButton && statutChan === "PUBLIC" && (
          <div className="boxrowtest jpp">
            <div className="navbarsmallbox jpp ">
              <p style={{ color: "white" }}>change chan status</p>
            </div>
            <button
              className="buttonseemore buttonchan statusbutton"
              onClick={() => ChangeStatutChan("PRIVATE")}
            >
              switch to Private
            </button>
            <div>
              <button
                className="buttonseemore buttonchan statutbutton"
                onClick={() => handleChangeToPWD()}
              >
                switch to protected
              </button>
              {onPWD === true && (
                <div className="boxrowtest jpp">
                  <div className="navbarsmallbox jpp ">
                    <p style={{ color: "white" }}>change chan status</p>
                  </div>
                  <input
                    className="inputdetest"
                    type="password"
                    placeholder="new password?"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                  />

                  <button
                    className="buttonseemore buttonchan statusbutton"
                    onClick={() => ChangeStatutChan("PWD_PROTECTED")}
                    disabled={newPass.length === 0}
                  >
                    confirm
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        {changeStatutButton && statutChan === "PRIVATE" && (
          <div className="boxrowtest jpp">
            <div className="navbarsmallbox jpp ">
              <p style={{ color: "white" }}>change chan status</p>
            </div>
            <button
              className="buttonseemore buttonchan statutbutton"
              onClick={() => ChangeStatutChan("PUBLIC")}
            >
              switch to Public
            </button>
            <div>
              <button
                className="buttonseemore buttonchan statutbutton"
                onClick={() => handleChangeToPWD()}
              >
                switch to protected
              </button>
              {onPWD === true && (
                <div className="boxrowtest jpp">
                  <div className="navbarsmallbox jpp ">
                    <p style={{ color: "white" }}>change chan status</p>
                  </div>
                  <input
                    type="text"
                    placeholder="new password ?"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                  />
                  <button
                    className="buttonseemore buttonchan statutbutton"
                    onClick={() => ChangeStatutChan("PWD_PROTECTED")}
                    disabled={newPass.length === 0}
                  >
                    confirm
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        {changeStatutButton && statutChan === "PWD_PROTECTED" && (
          <div className="boxrowtest jpp">
            <div className="navbarsmallbox jpp ">
              <p style={{ color: "white" }}>change chan status</p>
            </div>
            <button
              className="buttonseemore buttonchan"
              onClick={() => ChangeStatutChan("PRIVATE")}
            >
              pass to Private
            </button>
            <button
              className="buttonseemore buttonchan"
              onClick={() => ChangeStatutChan("PUBLIC")}
            >
              pass to Public
            </button>
          </div>
        )}
        {/* </div> */}
      </div>

      <div className="onlinepeople">
        <div className="navbarsmallbox">
          <p className="boxtitle"> channel members </p>
        </div>
        <ul>
          {usersInRoom.map((users) => (
            <div key={users.id}>
              <button
                className="buttonseemore buttonchan onlinelist"
                onClick={() => handleUserClick(users.id)}
                disabled={user?.id === users.id}
              >
                <div>
                  {users.status === "ONLINE" && (
                    <span>
                      {users.username}-{users.role} 🟢
                    </span>
                  )}
                  {users.status === "INGAME" && (
                    <span>
                      {users.username}-{users.role} 🎮
                    </span>
                  )}
                  {users.status === "OFFLINE" && (
                    <span>
                      {users.username}-{users.role} 🔴
                    </span>
                  )}
                </div>
              </button>
              {showMenu && selectedUser === users.id && (
                <div className="user-menu">
                  <button
                    className="onlinebttn"
                    onClick={() => inviteToMatch(user?.id as any, users.id)}
                  >
                    start a game
                  </button>
                  <button className="onlinebttn" onClick={handleViewProfile}>
                    see profile
                  </button>
                  {users.isBlocked === "false" && (
                    <button
                      className="onlinebttn"
                      onClick={() => BlockFriend(users.id.toString())}
                    >
                      block
                    </button>
                  )}
                  {users.isBlocked === "true" && (
                    <button
                      className="onlinebttn"
                      onClick={() =>
                        removeBlocked(
                          user?.id.toString() as any,
                          users.id.toString()
                        )
                      }
                    >
                      unblock
                    </button>
                  )}
                  <button
                    className="onlinebttn"
                    onClick={() => messagePage(users.id.toString())}
                  >
                    send a message
                  </button>

                  {yourRole === "OWNER" && (
                    <div>
                      {selectedUserRole === "USER" && (
                        <button
                          className="onlinebttn"
                          onClick={() => passAdminOfChannel(users.id)}
                        >
                          promote admin
                        </button>
                      )}
                      {selectedUserRole === "ADMIN" && (
                        <button
                          className="onlinebttn"
                          onClick={() => demoteAdminOfChannel(users.id)}
                        >
                          demote admin
                        </button>
                      )}
                      <button
                        className="onlinebttn"
                        onClick={() => handleKickButton()}
                      >
                        kick
                      </button>
                      {onKick === true && (
                        <div>
                          <input
                            type="text"
                            placeholder="Reason ?"
                            value={reasonKick}
                            onChange={(e) => setReasonKick(e.target.value)}
                          />
                          <button
                            className="buttonseemore buttonchan onlinelist"
                            onClick={() => kickFromChannel(users.id)}
                            disabled={reasonKick.length > 30}
                          >
                            send
                          </button>
                        </div>
                      )}

                      {selectedUserIsMuted === "false" && (
                        <div>
                          <button
                            className="onlinebttn"
                            onClick={() => handleMuteButton()}
                          >
                            mute
                          </button>
                          {onMute === true && (
                            <div>
                              <input
                                type="text"
                                placeholder="Time ?"
                                value={timeMute}
                                onChange={(e) => setTimeMute(e.target.value)}
                              />
                              <input
                                type="text"
                                placeholder="Reason ?"
                                value={reasonMute}
                                onChange={(e) => setReason(e.target.value)}
                              />
                              <button
                                className="buttonseemore buttonchan onlinelist"
                                onClick={() => MuteFromChannel(users.id)}
                                disabled={
                                  isNaN(parseInt(timeMute)) ||
                                  parseInt(timeMute) === 0 ||
                                  timeMute.length > 3 ||
                                  reasonMute.length > 30
                                }
                              >
                                submit
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      {selectedUserIsMuted === "true" && (
                        <button
                          className="onlinebttn"
                          onClick={() => UnMuteFromChannel(users.id)}
                        >
                          unmute
                        </button>
                      )}
                      {selectedUserIsBanned === "false" && (
                        <div>
                          <button
                            className="onlinebttn"
                            onClick={() => handleBanButton()}
                          >
                            ban
                          </button>
                          {onBan === true && (
                            <div>
                              <input
                                type="text"
                                placeholder="Time ?"
                                value={timeBan}
                                onChange={(e) => setTimeBan(e.target.value)}
                              />
                              <input
                                type="text"
                                placeholder="Reason ?"
                                value={reasonBan}
                                onChange={(e) => setReasonBan(e.target.value)}
                              />
                              <button
                                className="buttonseemore buttonchan onlinelist"
                                onClick={() => BanFromChannel(users.id)}
                                disabled={
                                  isNaN(parseInt(timeBan)) ||
                                  parseInt(timeBan) === 0 ||
                                  timeBan.length > 3 ||
                                  reasonBan.length > 30
                                }
                              >
                                submit
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      {selectedUserIsBanned === "true" && (
                        <button
                          className="onlinebttn"
                          onClick={() => UnbanFromChannel(users.id)}
                        >
                          unban
                        </button>
                      )}
                    </div>
                  )}
                  {yourRole === "ADMIN" && (
                    <div>
                      {selectedUserRole === "USER" && (
                        <button
                          className="onlinebttn"
                          onClick={() => passAdminOfChannel(users.id)}
                        >
                          promote admin
                        </button>
                      )}
                      {selectedUserRole === "USER" && (
                        <button
                          className="onlinebttn"
                          onClick={() => kickFromChannel(users.id)}
                        >
                          kick
                        </button>
                      )}
                      {selectedUserIsMuted === "false" &&
                        selectedUserRole === "USER" && (
                          <button
                            className="onlinebttn"
                            onClick={() => MuteFromChannel(users.id)}
                          >
                            mute
                          </button>
                        )}
                      {selectedUserIsMuted === "true" &&
                        selectedUserRole === "USER" && (
                          <button
                            className="onlinebttn"
                            onClick={() => UnMuteFromChannel(users.id)}
                          >
                            unmute
                          </button>
                        )}
                      {selectedUserIsBanned === "false" &&
                        selectedUserRole === "USER" && (
                          <button
                            className="onlinebttn"
                            onClick={() => BanFromChannel(users.id)}
                          >
                            ban
                          </button>
                        )}
                      {selectedUserIsBanned === "true" &&
                        selectedUserRole === "USER" && (
                          <button
                            className="onlinebttn"
                            onClick={() => UnbanFromChannel(users.id)}
                          >
                            unban
                          </button>
                        )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ChatChannel;
