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
  const [selectedUser, setSelectedUser] = useState(0);

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
      return null;
    }
  }

  async function fetchRoomMessageList() {
    try {
      const response = await fetch(
        `http://localhost:3000/chat/recupRoomMess/${id}`,
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
        const usernamePromises = data.map(
          async (message: {
            senderRole: string;
            senderId: any;
            senderUsername: string;
            isBlocked: string;
          }) => {
            try {
              const senderResponse = await fetch(
                `http://localhost:3000/users/${message.senderId}/username`,
                {
                  method: "GET",
                  credentials: "include",
                }
              );
              const rolesenderResponse = await fetch(
                `http://localhost:3000/chat/getRole/${message.senderId}/${id}`,
                {
                  method: "GET",
                  credentials: "include",
                }
              );
              const isBlockedResponse = await fetch(
                `http://localhost:3000/friends/blocked/${message.senderId}/${user?.id}`,
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
                console.log("WHS C QUOI CE DEL:   ", message);
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
        `http://localhost:3000/chat/getUserInRoom/${id}`,
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
            }) => {
              if (user)
                {
                  const isBlockedResponse = await fetch(
                    `http://localhost:3000/friends/blocked/${friend.id}/${user?.id}`,
                    {
                      method: "GET",
                      credentials: "include",
                    }
                  );
                  if (isBlockedResponse.ok)
                  {
                    const isBlocked = isBlockedResponse.text();
                    friend.isBlocked = await isBlocked;
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

  async function fetchYourRole() {
    try {
      const response = await fetch(
        `http://localhost:3000/chat/getRole/${user?.id}/${id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des messages privés.");
      } else {
        const data = await response.text();
        setYourRole(data);
      }
    } catch (error: any) {
      console.log(error);
    }
  }

  useEffect(() => {
    async function fetchRoomMessage() {
      const scores = await fetchRoomMessageList();
    }
    async function fetchUserRole() {
      const scores = await fetchYourRole();
    }
    async function fetchUserInRoom() {
      const scores = await fectUserInRoomList();
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
      });
    }
    fetchRoomMessage();
    fetchUserRole();
    fetchUserInRoom();
  }, []);

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

    try {
      const response = await fetch(
        `http://localhost:3000/chat/leftChan/${id}/${user?.id}`,
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
    setTimeout(() => {
      window.location.reload();
  }, 100);
  };

  const handleUserClick = (userId: number) => {
    setSelectedUser(userId);
    setShowMenu(true);
  };

  const handleInvite = () => {
    setShowMenu(false);
  };

  const handleViewProfile = () => {
    navigate(`/users/profile/${selectedUser}`);
    setShowMenu(false);
  };

  async function checkBlockedForNotify(senderId: string, recipientId: number) {
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
    socket?.on("matchStart", () => {
      socket?.emit("updateUserIG", user?.id);
      navigate("/gamefriend");
    });
  }

  async function deleteFriend(sender: string, recipient: string) {
    try {
      const response = await fetch(
        `http://localhost:3000/friends/delete/${sender}/${recipient}`,
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
        `http://localhost:3000/friends/block/${sender}/${recipient}`,
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
        `http://localhost:3000/friends/unblock/${sender}/${recipient}`,
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

  return (
    <div>
      <div>
        <button onClick={leftChannel}>Quitter le channel ?</button>
        {id && (
          <ul>
            <h1>Liste des msgs envoyes :</h1>
            {messageListSend.length > 0 && user ? (
              messageListSend.map((friend, index) => (
                <div>
                  {friend.senderId === user?.id && (
                    <div style={{ backgroundColor: "blue", float: "left" }}>
                      <div key={index}>
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
                        <div key={index}>
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
      {id && (
        <div>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <button onClick={onSubmit}>Submit</button>
        </div>
      )}
      <div>
        <ul>
          <h1>Liste des utilisateurs :</h1>
          {usersInRoom.map((users) => (
            <div key={users.id}>
              <button
                onClick={() => handleUserClick(users.id)}
                disabled={user?.id === users.id}
              >
                <div>
                  id: {users.id} --- name users: {users.username} --- role:{" "}
                  {users.role}
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
                        removeBlocked(user?.id.toString() as any, users.id.toString())
                      }
                    >
                      Debloquer
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </ul>
      </div>
      <div>
        {/* { yourRole === "OWNER" && (

      )} */}
      </div>
    </div>
  );
};

export default ChatChannel;
