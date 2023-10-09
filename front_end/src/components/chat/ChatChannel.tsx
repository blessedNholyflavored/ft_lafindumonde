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
  const { user, setUser } = useAuth();
  const { id } = useParams();
  const [value, setValue] = useState("");
  const navigate = useNavigate();
  const socket = useContext(WebsocketContext);
  const [messageListSend, setMessageList] = useState<messages[]>([]);
  const [usersInRoom, setUsersInRoom] = useState<users[]>([]);
  const [yourRole, setYourRole] = useState("USER");
  const [showMenu, setShowMenu] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
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
  const [onChangeStatut, setOnChangeStatut] = useState(false);
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
  const [notifyMSG, setNotifyMSG] = useState<string>("");
  const [notifyType, setNotifyType] = useState<number>(0);
  const [sender, setSender] = useState<number>(0);

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

  async function fetchRoomMessageList() {
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
        // setShowNotification(true);
        // setNotifyMSG("You're not in this channel!");
        // setNotifyType(5);
        navigate("/chat");
      } else if (!response.ok) {
        // console.log("ici erreur 500 ??");
        // setShowNotification(true);
        // setNotifyMSG("You're not in this channel!");
        // setNotifyType(5);

        throw new Error("Erreur lors de la récupération des messages privés.");
      }

      const data = await response.json();
      if (data.length > 0) {
        const friendObjects = data;
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
    } catch (error) {
      console.log(error);
    }
  }

  async function fectUserInRoomList() {
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
  }

  async function fetchYourRole(userId: number) {
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/chat/getRole/${userId}/${id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des messages privés.");
      } else {
        const data = await response.text();
        return data;
      }
    } catch (error: any) {
      console.log(error);
    }
    return "";
  }

  async function fetchMuteTimeLeft(userId: number) {
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
  }

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
      const scores = await fetchRoomMessageList();
    }
    async function fetchUserRole() {
      if (user) {
        const scores = await fetchYourRole(user?.id);
        setYourRole(scores);
      }
    }
    async function fetchUserInRoom() {
      const scores = await fectUserInRoomList();
    }
    async function UserIsmuted() {
      if (user) {
        const scores = await checkMuted(user?.id);
      }
    }
    async function UserIsbanned() {
      if (user) {
        const scores = await checkBanned(user?.id);
      }
    }

    async function MuteTimeLeft() {
      if (user) {
        const scores = await fetchMuteTimeLeft(user?.id);
      }
    }
    if (socket) {
      socket.on("refreshMessagesRoom", () => {
        fetchRoomMessage();
        fetchUserInRoom();
      });
    }
    if (socket) {
      socket.on("refreshListRoom", () => {
        fetchUserInRoom();
        fetchUserRole();
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
  }, [reactu, userIsBanned]);

  const onSubmit = () => {
    if (value.length > 0) {
      socket.emit("newMessageRoom", value, id);
      setTimeout(() => {
        socket.emit("reloadMessRoom", id);
      }, 100);
    }
    setValue("");
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
      setIsBlocked(data);
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
      socket?.emit("updateUserIG", user?.id);
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
    // window.location.reload();
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
      socket.emit("reloadMessRoom", id);
    }, 150);
    // window.location.reload();
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
    // window.location.reload();
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
    // window.location.reload();
    setSelectedUser(0);
  }

  async function checkMuted(userId: number) {
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
  }

  async function checkBanned(userId: number) {
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

  function handleOnChangeMDP() {
    if (changeStatutButton === true) {
      setChangeStatutButton(false);
      setNewPass("");
    } else setChangeStatutButton(true);
  }

  const handleEnter = (e: { key: string }) => {
    if (e.key === "Enter") {
      onSubmit();
    }
  };

  const decrementMuteTimeLeft = () => {
    if (muteTimeLeft > 0) {
      setMuteTimeLeft((prevTime) => prevTime - 1);
    } else if (muteTimeLeft <= 0 && muteTimeLeft >= -2) {
      fetchMuteTimeLeft(user?.id as number);
      setUserIsMuted(false);
      setValue("");
    }
  };

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
  }, [muteTimeLeft]);

  return (
    <div>
      {showNotification && (
        <Notify
          message={notifyMSG}
          type={notifyType}
          senderId={sender}
          onClose={handleCloseNotification}
        />
      )}
      <div>
        {id && (
          <ul>
            <h1>Liste des messages envoyés :</h1>
            {messageListSend.length > 0 && user ? (
              messageListSend.map((friend, index) => (
                <div key={index}>
                  {friend.senderId === user?.id && (
                    <div style={{ backgroundColor: "blue", float: "left" }}>
                      <div>
                        <div>{friend.start_at}</div>
                        <div>
                          {friend.senderUsername} --- {friend.senderRole}
                        </div>
                        <div>{friend.content}</div>
                      </div>
                    </div>
                  )}
                  {friend.senderId !== user?.id &&
                    friend.isBlocked === "false" && (
                      <div style={{ backgroundColor: "green", float: "right" }}>
                        <div>
                          <div>{friend.start_at}</div>
                          <div>{friend.senderUsername}</div>
                          <div>
                            {friend.content} --- {friend.senderRole}
                          </div>
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
      </div>
      {userIsMuted === true && (
        <div>
          <input
            type="text"
            value={muteTimeLeft + " secondes time left for you mute"}
            onChange={(e) => setValue(e.target.value)}
          />
          <button disabled>Submit</button>
        </div>
      )}
      {userIsMuted === false && (
        <div>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyPress={handleEnter}
          />
          <button onClick={onSubmit} disabled={value.length > 80}>
            Submit
          </button>
        </div>
      )}

      <div>
        {changeStatutButton && statutChan === "PWD_PROTECTED" && (
          <div>
            <button onClick={() => handleOnChangeMDP()}>Changer le MDP</button>
            <input
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
            />
            <button
              onClick={() => ChangeStatutChan("PWD_PROTECTED")}
              disabled={newPass.length === 0 || newPass.length > 15}
            >
              Change Password
            </button>
          </div>
        )}
        {yourRole === "OWNER" && (
          <button
            onClick={() => {
              setChangeStatutButton(true);
              getStatutChan();
            }}
          >
            Changer le statut du chan
          </button>
        )}
        {changeStatutButton && statutChan === "PUBLIC" && (
          <div>
            <button onClick={() => ChangeStatutChan("PRIVATE")}>
              pass to Private
            </button>
            <div>
              <button onClick={() => handleChangeToPWD()}>
                pass to protected
              </button>
              {onPWD === true && (
                <div>
                  <input
                    type="password"
                    placeholder="newPass ?"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                  />

                  <button
                    onClick={() => ChangeStatutChan("PWD_PROTECTED")}
                    disabled={newPass.length === 0}
                  >
                    pass to Protected
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        {changeStatutButton && statutChan === "PRIVATE" && (
          <div>
            <button onClick={() => ChangeStatutChan("PUBLIC")}>
              pass to Public
            </button>
            <div>
              <button onClick={() => handleChangeToPWD()}>
                pass to protected
              </button>
              {onPWD === true && (
                <div>
                  <input
                    type="text"
                    placeholder="newPass ?"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                  />
                  <button
                    onClick={() => ChangeStatutChan("PWD_PROTECTED")}
                    disabled={newPass.length === 0}
                  >
                    pass to Protected
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        {changeStatutButton && statutChan === "PWD_PROTECTED" && (
          <div>
            <button onClick={() => ChangeStatutChan("PRIVATE")}>
              pass to Private
            </button>
            <button onClick={() => ChangeStatutChan("PUBLIC")}>
              pass to Public
            </button>
          </div>
        )}

        <ul>
          <h1>Liste des utilisateurs :</h1>
          {usersInRoom.map((users) => (
            <div key={users.id}>
              <button
                onClick={() => handleUserClick(users.id)}
                disabled={user?.id === users.id}
              >
                <div>
                  id: {users.id} --- name users: {users.username} --- role:
                  {users.role} --- status: {users.status}
                </div>
              </button>
              {showMenu && selectedUser === users.id && (
                <div className="user-menu">
                  <button
                    onClick={() => inviteToMatch(user?.id as any, users.id)}
                  >
                    inviter en match ?
                  </button>
                  <button onClick={handleViewProfile}>Voir le profil</button>
                  {users.isBlocked === "false" && (
                    <button onClick={() => BlockFriend(users.id.toString())}>
                      Bloquer
                    </button>
                  )}
                  {users.isBlocked === "true" && (
                    <button
                      onClick={() =>
                        removeBlocked(
                          user?.id.toString() as any,
                          users.id.toString()
                        )
                      }
                    >
                      Debloquer
                    </button>
                  )}
                  <button onClick={() => messagePage(users.id.toString())}>
                    Envoyer un message
                  </button>

                  {yourRole === "OWNER" && (
                    <div>
                      {selectedUserRole === "USER" && (
                        <button onClick={() => passAdminOfChannel(users.id)}>
                          Promote Admin
                        </button>
                      )}
                      {selectedUserRole === "ADMIN" && (
                        <button onClick={() => demoteAdminOfChannel(users.id)}>
                          Demote Admin
                        </button>
                      )}
                      <div>
                        <button onClick={() => handleKickButton()}>Kick</button>
                        {onKick === true && (
                          <div>
                            <input
                              type="text"
                              placeholder="Reason ?"
                              value={reasonKick}
                              onChange={(e) => setReasonKick(e.target.value)}
                            />
                            <button
                              onClick={() => kickFromChannel(users.id)}
                              disabled={reasonKick.length > 30}
                            >
                              Submit
                            </button>
                          </div>
                        )}
                      </div>

                      {selectedUserIsMuted === "false" && (
                        <div>
                          <div>
                            <button onClick={() => handleMuteButton()}>
                              Mute
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
                                  onClick={() => MuteFromChannel(users.id)}
                                  disabled={
                                    isNaN(parseInt(timeMute)) ||
                                    parseInt(timeMute) === 0 ||
                                    timeMute.length > 3 ||
                                    reasonMute.length > 30
                                  }
                                >
                                  Submit
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {selectedUserIsMuted === "true" && (
                        <button onClick={() => UnMuteFromChannel(users.id)}>
                          Unmute
                        </button>
                      )}
                      {selectedUserIsBanned === "false" && (
                        <div>
                          <div>
                            <button onClick={() => handleBanButton()}>
                              Ban
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
                                  onClick={() => BanFromChannel(users.id)}
                                  disabled={
                                    isNaN(parseInt(timeBan)) ||
                                    parseInt(timeBan) === 0 ||
                                    timeBan.length > 3 ||
                                    reasonBan.length > 30
                                  }
                                >
                                  Submit
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {selectedUserIsBanned === "true" && (
                        <button onClick={() => UnbanFromChannel(users.id)}>
                          Unban
                        </button>
                      )}
                    </div>
                  )}
                  {yourRole === "ADMIN" && (
                    <div>
                      {selectedUserRole === "USER" && (
                        <button onClick={() => passAdminOfChannel(users.id)}>
                          Promote Admin
                        </button>
                      )}
                      {selectedUserRole === "USER" && (
                        <button onClick={() => kickFromChannel(users.id)}>
                          kick
                        </button>
                      )}
                      {selectedUserIsMuted === "false" &&
                        selectedUserRole === "USER" && (
                          <button onClick={() => MuteFromChannel(users.id)}>
                            Mute
                          </button>
                        )}
                      {selectedUserIsMuted === "true" &&
                        selectedUserRole === "USER" && (
                          <button onClick={() => UnMuteFromChannel(users.id)}>
                            Unmute
                          </button>
                        )}
                      {selectedUserIsBanned === "false" &&
                        selectedUserRole === "USER" && (
                          <button onClick={() => BanFromChannel(users.id)}>
                            Ban
                          </button>
                        )}
                      {selectedUserIsBanned === "true" &&
                        selectedUserRole === "USER" && (
                          <button onClick={() => UnbanFromChannel(users.id)}>
                            Unban
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
