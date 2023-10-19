import React, { useState, useEffect, useContext, useCallback } from "react";
import { useAuth } from "../auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { WebsocketContext } from "../../services/WebsocketContext";
import Notify from "../../services/Notify";
import nav from "./../../img/buttoncomp.png";
import { Logout } from "../auth/Logout";
import logo from "./../../img/logo42.png";
import foldergreen from "./../../img/foldergreen.png";
import folderblue from "./../../img/folderblue.png";
import folderpink from "./../../img/folderpink.png";
import folderyellow from "./../../img/folderyellow.png";
import folderviolet from "./../../img/folderviolet.png";
import icon from "../../img/buttoncomp.png";
import "../../style/Profile.css";
import "../../style/Home.css";
import folderred from "../../img/folderred.png";

interface friendsSend {
  id: string;
  status: string;
  senderId: number;
  recipientId: number;
  username: string;
  isBlocked: boolean;
  pictureURL: string;
}

interface onlinePlayers {
  id: string;
  username: string;
  pictureURL: string;
}

export const FriendsPage: React.FC = () => {
  const { user, setUser } = useAuth();

  const [sender, setSender] = useState<number>(0);
  const socket = useContext(WebsocketContext);
  const [friendsSend, setfriendsSend] = useState<friendsSend[]>([]);
  const [friendsRequest, setfriendsRequest] = useState<friendsSend[]>([]);
  const [friends, setFriends] = useState<friendsSend[]>([]);
  const [blocked, setBlocked] = useState<friendsSend[]>([]);
  const [onlinePlayers, setOnlinePlayers] = useState<onlinePlayers[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notifyMSG, setNotifyMSG] = useState<string>("");
  const [notifyType, setNotifyType] = useState<number>(0);
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState(0);
  let [ImgURL] = useState<string>("");

  const displayPic = useCallback(
    async (userId: number) => {
      try {
        const response = await fetch(
          `http://${window.location.hostname}:3000/users/${userId}/avatar`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (response.ok) {
          const pictureURL = await response.text();
          if (pictureURL.includes("https")) {
            return pictureURL;
          } else {
            try {
              const response = await fetch(
                `http://${window.location.hostname}:3000/users/uploads/${pictureURL}`,
                {
                  method: "GET",
                  credentials: "include",
                }
              );
              if (response.ok) {
                const blob = await response.blob();
                const absoluteURL = URL.createObjectURL(blob);
                return absoluteURL;
              }
            } catch (error) {
              console.error(error);
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
      return ImgURL;
    },
    [ImgURL]
  );

  const fetchfriendsSend = useCallback(async () => {
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/friends/invSend/${user?.id}`,
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
          async (friend: {
            username: any;
            status: string;
            recipientId: number;
          }) => {
            friend.username = await recupUsername(friend.recipientId);
            return friend;
          }
        )
      );
      setfriendsSend(updatedData);
      return data[0];
    } catch (error) {
      console.error("Erreur:", error);
      return [];
    }
  }, [user?.id]);

  const fetchfriendsRequest = useCallback(async () => {
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/friends/invRequest/${user?.id}`,
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
          async (friend: {
            username: any;
            status: string;
            senderId: number;
            isBlocked: boolean;
            pictureURL: string;
          }) => {
            friend.username = await recupUsername(friend.senderId);
            friend.pictureURL = await displayPic(friend.senderId);
            if (user)
              friend.isBlocked = await checkBlocked(
                friend.senderId.toString(),
                user.id.toString()
              );
            return friend;
          }
        )
      );
      setfriendsRequest(updatedData);
      return data[0];
    } catch (error) {
      console.error("Erreur:", error);
      return [];
    }
  }, [displayPic, user]);

  const fetchFriendsList = useCallback(async () => {
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/friends/${user?.id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          const friendObjects = data[0].friends;
          const friendInfo = await Promise.all(
            friendObjects.map(
              async (friend: {
                isBlocked: boolean;
                id: number;
                username: any;
                status: any;
              }) => {
                const pictureURL = await displayPic(friend.id);
                return {
                  username: friend.username,
                  status: friend.status,
                  senderId: user?.id,
                  recipientId: friend.id,
                  pictureURL: pictureURL,
                };
              }
            )
          );
          setFriends(friendInfo);
        }
      } else {
        console.log("error: HTTP request failed");
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  }, [displayPic, user?.id]);

  const fetchBlockedList = useCallback(async () => {
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/friends/blockedList/${user?.id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          const friendInfo = await Promise.all(
            data.map(
              async (block: {
                isBlocked: boolean;
                id: number;
                username: any;
                status: any;
              }) => {
                const pictureURL = await displayPic(block.id);
                return {
                  username: block.username,
                  status: block.status,
                  senderId: user?.id,
                  recipientId: block.id,
                  pictureURL: pictureURL,
                };
              }
            )
          );
          setBlocked(friendInfo);
        } else {
          setBlocked(data);
        }
      } else {
        console.log("error: HTTP request failed");
      }
    } catch (error) {
      console.error("Error fetching blocked friends:", error);
    }
  }, [displayPic, user?.id]);

  const fetchOnlinePlayersList = useCallback(async () => {
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/friends/online/${user?.id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          const friendInfo = await Promise.all(
            data.map(async (user: { id: number; username: any }) => {
              const pictureURL = await displayPic(user.id);
              return {
                username: user.username,
                id: user.id,
                pictureURL: pictureURL,
              };
            })
          );
          setOnlinePlayers(friendInfo);
        } else {
          setOnlinePlayers(data);
        }
      } else {
        console.log("error: HTTP request failed");
      }
    } catch (error) {
      console.error("Error fetching online players:", error);
    }
  }, [displayPic, user?.id]);

  useEffect(() => {
    if (socket) {
      socket.on("SomeoneGoOnlineOrOffline", () => {
        setTimeout(() => {
          fetchOnlinePlayers();
          fetchBlocked();
          fetchFriends();
        }, 1000);
      });
    }

    if (socket) {
      socket.on("reloadInGame", () => {
        setTimeout(() => {
          fetchFriends();
          fetchOnlinePlayers();
        }, 500);
      });
    }

    if (socket) {
      socket.on("refreshListFriendPage", () => {
        setTimeout(() => {
          fetchScores();
          fetchRequest();
          fetchFriends();
          fetchBlocked();
          fetchOnlinePlayers();
        }, 1000);
        setSelectedUser(0);
      });
    }

    async function fetchScores() {
      await fetchfriendsSend();
    }
    async function fetchRequest() {
      await fetchfriendsRequest();
    }
    async function fetchFriends() {
      await fetchFriendsList();
    }
    async function fetchBlocked() {
      await fetchBlockedList();
    }
    async function fetchOnlinePlayers() {
      await fetchOnlinePlayersList();
    }
    fetchScores();
    fetchRequest();
    fetchFriends();
    fetchBlocked();
    fetchOnlinePlayers();
  }, [
    socket,
    fetchBlockedList,
    fetchFriendsList,
    fetchOnlinePlayersList,
    fetchfriendsRequest,
    fetchfriendsSend,
  ]);

  async function recupUsername(userId: number) {
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

  async function AcceptFriend(id: string, sender: number) {
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/friends/accept/${id}`,
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
      socket.emit("reloadListFriendPage", sender);
    }, 300);
  }

  async function RefuseFriend(id: string, sender: number) {
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/friends/refuse/${id}`,
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
      socket.emit("reloadListFriendPage", sender);
    }, 300);
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
    setTimeout(() => {
      socket.emit("reloadListFriendPage", recipient);
    }, 300);
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
      socket.emit("reloadListFriendPage", 0);
    }, 300);
  }

  async function BlockFriend(sender: string, recipient: string) {
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
      socket.emit("reloadListFriendPage", recipient);
    }, 300);
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

  async function addSomeone(recipientId: string) {
    if (!recipientId) {
      alert("Recipient ID is missing.");
      return;
    }
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/friends/${user?.id}/${recipientId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ recipientId: parseInt(recipientId) }),
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = response.text();
        if ((await data).valueOf() === "exist") {
          setNotifyMSG("friend request already in PENDING");
          setShowNotification(true);
          setSender(0);
          setNotifyType(2);
        } else {
          setNotifyMSG("friend request sent !");
          setShowNotification(true);
          setSender(0);
          setNotifyType(2);
        }
        if (
          user &&
          (await checkBlockedForNotify(
            user?.id.toString(),
            parseInt(recipientId)
          )) === false
        )
          socket.emit("notifyFriendShip", recipientId);
        setTimeout(() => {
          socket.emit("reloadListFriendPage", recipientId);
        }, 300);
      } else {
        console.error("Error creating friendship: request is pending");
        alert("Error creating friendship: request is pending");
      }
    } catch (error) {
      console.error("Error creating friendship:", error);
    }
  }

  function navToProfil(id: string) {
    navigate(`/users/profile/${id}`);
  }
  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  if (socket) {
    socket.on("receiveInvite", (sender: number) => {
      setShowNotification(true);
      setNotifyMSG("you've received a game invitation !");
      setNotifyType(1);
      setSender(sender);
    });
  }

  async function messagePage(recipientId: string) {
    navigate(`/chat/priv/${recipientId}`);
  }

  const navigateToProfPage = () => {
    navigate(`/users/profile/${user?.id}`);
  };

  const navigateToChat = () => {
    navigate("/chat");
  };

  const navigateToFriends = () => {
    navigate("/friends");
  };

  const navigateToHome = () => {
    navigate("/");
  };

  const navToGamePage = () => {
    navigate("/gamePage");
  };

  const navigateToSettings = () => {
    navigate("/settings");
  };

  const handleUserClick = async (userId: number) => {
    let flag = 0;
    if (selectedUser !== 0 && userId === selectedUser) flag = 1;
    setSelectedUser(userId);
    if (flag === 1) setSelectedUser(0);
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
        <main className="commonmain">
          <div>
            {showNotification && (
              <Notify
                message={notifyMSG}
                type={notifyType}
                senderId={sender}
                onClose={handleCloseNotification}
              />
            )}
          </div>

          <div className="fullpage1">
            <div className="navbarbox">
              <img src={icon} alt="icon" />
              <h1> FRIENDS </h1>
            </div>
            <div className="testingrow">
              <div className="boxrowtest2">
                <div className="navbarsmallbox">
                  <p className="boxtitle"> Friend list </p>
                </div>
                <ul>
                  {friends.length > 0 ? (
                    friends.map((friend, index) => (
                      <div key={index}>
                        <img
                          src={friend.pictureURL}
                          className="avatar"
                          alt=""
                        />
                        <div style={{ fontWeight: "bold" }}>
                          {friend.username}
                        </div>
                        <button
                          className="buttonseemore"
                          onClick={() => handleUserClick(friend.recipientId)}
                        >
                          {" "}
                          see more
                        </button>
                        <div>
                          {friend.status === "ONLINE" && (
                            <span style={{ fontStyle: "italic" }}>
                              {" "}
                              status: 🟢
                            </span>
                          )}
                          {friend.status === "INGAME" && (
                            <span style={{ fontStyle: "italic" }}>
                              {" "}
                              status: 🎮
                            </span>
                          )}
                          {friend.status === "OFFLINE" && (
                            <span style={{ fontStyle: "italic" }}>
                              {" "}
                              status: 🔴
                            </span>
                          )}
                        </div>
                        {selectedUser === friend.recipientId && (
                          <div>
                            <button
                              className="onlinebttn"
                              onClick={() =>
                                deleteFriend(
                                  friend.senderId.toString(),
                                  friend.recipientId.toString()
                                )
                              }
                            >
                              delete
                            </button>
                            <button
                              className="onlinebttn"
                              onClick={() =>
                                BlockFriend(
                                  friend.senderId.toString(),
                                  friend.recipientId.toString()
                                )
                              }
                            >
                              block
                            </button>
                            <button
                              className="onlinebttn"
                              onClick={() =>
                                navToProfil(friend.recipientId.toString())
                              }
                            >
                              see profile
                            </button>
                            <button
                              className="onlinebttn"
                              onClick={() =>
                                messagePage(friend.recipientId.toString())
                              }
                            >
                              send a message
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="emptymessage">
                      🩷🩷🩷🩷 <br></br>please make some friends<br></br>🩷🩷🩷🩷{" "}
                    </div>
                  )}
                </ul>
              </div>
              <div className="boxrowtest2">
                <div className="navbarsmallbox">
                  <p className="boxtitle"> Blocked list </p>
                </div>
                <ul>
                  {blocked.length > 0 ? (
                    blocked.map((blocked, index) => (
                      <div key={index}>
                        <img
                          src={blocked.pictureURL}
                          className="avatar"
                          alt=""
                        />
                        <div style={{ fontWeight: "bold" }}>
                          {blocked.username}
                        </div>
                        <button
                          className="onlinebttn"
                          onClick={() =>
                            removeBlocked(
                              blocked.senderId.toString(),
                              blocked.recipientId.toString()
                            )
                          }
                        >
                          unblock
                        </button>
                        <button
                          className="onlinebttn"
                          onClick={() =>
                            navToProfil(blocked.recipientId.toString())
                          }
                        >
                          see profile
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="emptymessage">
                      🩷🩷🩷🩷 <br></br>you didn't block anyone. yet.<br></br>🩷🩷🩷🩷
                    </div>
                  )}
                </ul>
              </div>
              <div className="boxrowtest2">
                <div className="navbarsmallbox">
                  <p className="boxtitle"> Who's online? </p>
                </div>
                <div className="online">
                  {onlinePlayers.length > 0 && user ? (
                    onlinePlayers.map((friend, index) => (
                      <div key={index}>
                        <img
                          src={friend.pictureURL}
                          className="avatar"
                          alt=""
                        />
                        <div className="name1">{friend.username}</div>
                        <button
                          className="buttonseemore"
                          onClick={() => handleUserClick(parseInt(friend.id))}
                          disabled={user?.id.toString() === friend.id}
                        >
                          see more
                        </button>
                        {selectedUser === parseInt(friend.id) && (
                          <div>
                            <button
                              className="onlinebttn"
                              onClick={() => addSomeone(friend.id.toString())}
                            >
                              add
                            </button>
                            <button
                              className="onlinebttn"
                              onClick={() =>
                                BlockFriend(
                                  user.id.toString(),
                                  friend.id.toString()
                                )
                              }
                            >
                              block
                            </button>
                            <button
                              className="onlinebttn"
                              onClick={() => navToProfil(friend.id.toString())}
                            >
                              see profile
                            </button>
                            <button
                              className="onlinebttn"
                              onClick={() => messagePage(friend.id.toString())}
                            >
                              send a message
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="emptymessage">
                      🩷🩷🩷🩷 <br></br>no one's here, you're all alone<br></br>🩷🩷🩷🩷
                    </div>
                  )}
                </div>
              </div>
              <div className="boxrowtest2">
                <div className="navbarsmallbox">
                  <p className="boxtitle"> Friend requests </p>
                </div>
                <div className="requests">
                  {friendsRequest.length === 0 ? (
                    <div className="emptymessage">
                      🩷🩷🩷🩷 <br></br> such empty. not that popular? <br></br>🩷🩷🩷🩷
                    </div>
                  ) : (
                    friendsRequest.map((friend) => (
                      <div key={friend.id}>
                        {friend.status === "PENDING" && !friend.isBlocked && (
                          <div className="requestinfo" >
                            <img
                              src={friend.pictureURL}
                              className="avatar"
                              alt=""
                            />
                            <div>{friend?.username}</div>
                            <div style={{ fontStyle: "italic", fontSize: 12 }}>
                              Status: {friend.status}
                            </div>
                            <div className="bttnholder">
                              <button
                                className="acceptbutton"
                                onClick={() =>
                                  AcceptFriend(friend.id, friend.senderId)
                                }
                              >
                                accept
                              </button>
                              <button
                                className="deletebutton"
                                onClick={() =>
                                  RefuseFriend(friend.id, friend.senderId)
                                }
                              >
                                delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
        <nav className="commonnav">
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
                <img src={foldergreen} alt="Menu 3" />
                <p>Friends</p>
              </a>
            </li>
            <li className="menu-item">
              <a onClick={navigateToChat}>
                <img src={folderred} alt="Menu 3" />
                <p>Chat</p>
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <footer className="footerfriends">
        <button className="logoutBtn" onClick={() => Logout({ user, setUser })}>
          LOG OUT{" "}
        </button>
        <img src={logo} className="logo" alt="icon" />
      </footer>
    </>
  );
};

export default FriendsPage;
