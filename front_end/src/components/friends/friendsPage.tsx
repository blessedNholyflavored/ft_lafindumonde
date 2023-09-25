import React, { useState, useEffect, useContext } from "react";
import { useAuth } from "../auth/AuthProvider";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { WebsocketContext } from "../../WebsocketContext";
import Notify from "../../Notify";
import nav from "./../../img/buttoncomp.png";
import { Logout } from "../auth/Logout";
import logo from "./../../img/logo42.png";
import folder from "./../../img/folder0.png";
import folder1 from "./../../img/folder2.png";
import folder2 from "./../../img/folder3.png";
import folder3 from "./../../img/folder4.png";
import folder4 from "./../../img/folder5.png";
import folder0 from "./../../img/folder1.png";
import folder6 from "./../../img/folder6.png";

interface friendsSend {
  id: string;
  status: string;
  senderId: number;
  recipientId: number;
  username: string;
  isBlocked: boolean;
}

interface onlinePlayers {
  id: string;
  username: string;
}

export const FriendsPage: React.FC = () => {
  const { user, setUser } = useAuth();
  const [username, setUsername] = useState<string>("");
  const navigate = useNavigate();
  const [notifyMSG, setNotifyMSG] = useState<string>("");
  const [notifyType, setNotifyType] = useState<number>(0);
  const [sender, setSender] = useState<number>(0);
  const socket = useContext(WebsocketContext);

  // console.log(user.invitFriendSent);

  const [friendsSend, setfriendsSend] = useState<friendsSend[]>([]);
  const [friendsRequest, setfriendsRequest] = useState<friendsSend[]>([]);
  const [friends, setFriends] = useState<friendsSend[]>([]);
  const [blocked, setBlocked] = useState<friendsSend[]>([]);
  const [onlinePlayers, setOnlinePlayers] = useState<onlinePlayers[]>([]);
  const [showNotification, setShowNotification] = useState(false);

  async function fetchfriendsSend() {
    try {
      const response = await fetch(
        `http://localhost:3000/friends/invSend/${user?.id}`,
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
            // Utilisez recupUsername pour obtenir le nom d'utilisateur
            friend.username = await recupUsername(friend.recipientId);
            return friend; // Retournez l'ami mis à jour
          }
        )
      );
      setfriendsSend(updatedData);
      return data[0];
    } catch (error) {
      console.error("Erreur:", error);
      return [];
    }
  }

  async function fetchfriendsRequest() {
    try {
      const response = await fetch(
        `http://localhost:3000/friends/invRequest/${user?.id}`,
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
          }) => {
            friend.username = await recupUsername(friend.senderId);
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
  }

  const fetchFriendsList = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/friends/${user?.id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          const friendObjects = data[0].friends;
          const friendInfo = friendObjects.map(
            (friend: {
              isBlocked: boolean;
              id: number;
              username: any;
              status: any;
            }) => ({
              username: friend.username,
              status: friend.status,
              senderId: user?.id,
              recipientId: friend.id,
              // isBlocked: checkBlocked(friend.id.toString()),
            })
          );
          setFriends(friendInfo);
        }
      } else {
        console.log("error: HTTP request failed");
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  const fetchBlockedList = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/friends/blockedList/${user?.id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          const friendObjects = data;
          const friendInfo = friendObjects.map(
            (block: {
              isBlocked: boolean;
              id: number;
              username: any;
              status: any;
            }) => ({
              username: block.username,
              status: block.status,
              senderId: user?.id,
              recipientId: block.id,
            })
          );
          setBlocked(friendInfo);
        }
      } else {
        console.log("error: HTTP request failed");
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  const fetchOnlinePlayersList = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/friends/online/${user?.id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          const friendObjects = data;

          const friendInfo = friendObjects.map(
            (user: { id: number; username: any }) => ({
              username: user.username,
              id: user.id,
            })
          );
          setOnlinePlayers(friendInfo);
          console.log(friendInfo);
        }
      } else {
        console.log("error: HTTP request failed");
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };
  useEffect(() => {
    async function fetchScores() {
      const scores = await fetchfriendsSend();
    }
    async function fetchRequest() {
      const scores = await fetchfriendsRequest();
    }
    async function fetchFriends() {
      const scores = await fetchFriendsList();
    }
    async function fetchBlocked() {
      const scores = await fetchBlockedList();
    }
    async function fetchOnlinePlayers() {
      const scores = await fetchOnlinePlayersList();
    }
    fetchScores();
    fetchRequest();
    fetchFriends();
    fetchBlocked();
    fetchOnlinePlayers();
  }, []);

  async function recupUsername(userId: number) {
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

  async function AcceptFriend(id: string) {
    try {
      const response = await fetch(
        `http://localhost:3000/friends/accept/${id}`,
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

  async function RefuseFriend(id: string) {
    try {
      const response = await fetch(
        `http://localhost:3000/friends/refuse/${id}`,
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

  async function deleteFriend(sender: string, recipient: string) {
    console.log(sender);
    console.log(recipient);
    try {
      const response = await fetch(
        `http://localhost:3000/friends/delete/${recipient}`,
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

  async function removeBlocked(sender: string, recipient: string) {
    try {
      const response = await fetch(
        `http://localhost:3000/friends/unblock/${recipient}`,
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

  async function BlockFriend(sender: string, recipient: string) {
    deleteFriend(sender, recipient);
    try {
      const response = await fetch(
        `http://localhost:3000/friends/block/${recipient}`,
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

  async function addSomeone(recipientId: string) {
    if (!recipientId) {
      alert("Recipient ID is missing.");
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:3000/friends/${user?.id}/${recipientId}`,
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
        // if (user && await checkBlockedForNotify(user?.id.toString(), recipientId) === false)
        // socket.emit('notifyFriendShip', id);
        alert("Friendship created successfully.");
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
      setNotifyMSG("Tu as recu une invitation pour une partie");
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

  const NavToSoloPong = () => {
    navigate("/solopong");
  };

  const navigateToFriends = () => {
    navigate("/friends");
  };

  const navigateToHome = () => {
    navigate("/");
  };

  // const handleCloseNotification = () => {
  //   setShowNotification(false);
  // };

  const navigateToSettings = () => {
    navigate("/settings");
  };

  return (
    <>
      <body>
        <header>
          <div>
            <img src={nav} alt="Menu 1" />
          </div>
          <h1>TRANSCENDENCE</h1>
        </header>
        <div className="flex-bg">
          <main>
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

            <ul>
              <h1>Liste des amis :</h1>
              {friends.length > 0 ? (
                friends.map((friend, index) => (
                  <div key={index}>
                    <div>{friend.username}</div>
                    <div>{friend.status}</div>
                    <button
                      onClick={() =>
                        deleteFriend(
                          friend.senderId.toString(),
                          friend.recipientId.toString()
                        )
                      }
                    >
                      Delete
                    </button>
                    <button
                      onClick={() =>
                        BlockFriend(
                          friend.senderId.toString(),
                          friend.recipientId.toString()
                        )
                      }
                    >
                      Bloquer
                    </button>
                    <button
                      onClick={() => navToProfil(friend.recipientId.toString())}
                    >
                      Voir Profile
                    </button>
                    <button
                      onClick={() => messagePage(friend.recipientId.toString())}
                    >
                      Envoyer un message
                    </button>
                  </div>
                ))
              ) : (
                <div>ptdr t'as pas de pote</div>
              )}
            </ul>
            <ul>
              <h1>Liste des gens que t'aimes po ! :</h1>
              {blocked.length > 0 ? (
                blocked.map((blocked, index) => (
                  <div key={index}>
                    <div>{blocked.username}</div>
                    <div>{blocked.status}</div>
                    <button
                      onClick={() =>
                        removeBlocked(
                          blocked.senderId.toString(),
                          blocked.recipientId.toString()
                        )
                      }
                    >
                      Debloquer
                    </button>
                    <button
                      onClick={() =>
                        navToProfil(blocked.recipientId.toString())
                      }
                    >
                      Voir Profile
                    </button>
                  </div>
                ))
              ) : (
                <div>tu aimes tlm</div>
              )}
            </ul>

            <ul>
              <h1>Liste des gens en ligne :</h1>
              {onlinePlayers.length > 0 && user ? (
                onlinePlayers.map((friend, index) => (
                  <div key={index}>
                    <div>{friend.username}</div>
                    <button onClick={() => addSomeone(friend.id.toString())}>
                      Ajouter
                    </button>
                    <button
                      onClick={() =>
                        BlockFriend(user.id.toString(), friend.id.toString())
                      }
                    >
                      Bloquer
                    </button>
                    <button onClick={() => navToProfil(friend.id.toString())}>
                      Voir Profile
                    </button>
                    <button onClick={() => messagePage(friend.id.toString())}>
                      Envoyer un message
                    </button>
                  </div>
                ))
              ) : (
                <div>ptdr ya personne</div>
              )}
            </ul>
            <ul>
              <h1>Liste des requetes en attente recues :</h1>
              {friendsRequest.map((friend) => (
                <div>
                  {friend.status === "PENDING" && !friend.isBlocked && (
                    <li key={friend.id}>
                      <div>ID: {friend.id}</div>
                      <div>Status: {friend.status}</div>
                      <div>Sender ID: {user?.username}</div>
                      <div>recipientId ID: {friend.username}</div>
                      <button onClick={() => AcceptFriend(friend.id)}>
                        Accepter
                      </button>
                      <button onClick={() => RefuseFriend(friend.id)}>
                        Refuser
                      </button>
                    </li>
                  )}
                </div>
              ))}
            </ul>
            <ul>
              <h1>Liste des requetes en attente envoyees :</h1>
              {friendsSend.map((friend) => (
                <div>
                  {friend.status === "PENDING" && (
                    <li key={friend.id}>
                      <div>ID: {friend.id}</div>
                      <div>Status: {friend.status}</div>
                      <div>Sender ID: {user?.username}</div>
                      <div>recipientId ID: {friend.username}</div>
                      <button onClick={() => RefuseFriend(friend.id)}>
                        Cancel
                      </button>
                    </li>
                  )}
                </div>
              ))}
            </ul>
          </main>
          <nav>
            <ul>
              <li className="menu-item">
                <a onClick={navigateToHome}>
                  <img src={folder6} alt="Menu 3" />
                  <p>Home</p>
                </a>
              </li>
              <li className="menu-item">
                {/* <a > onClick={() => handlePlayerSelect('1')}> */}
                <a>
                  <img src={folder4} alt="Menu 1" />
                  <p>Matchmaking</p>
                  {/* {(queueCount > 0 || queueCountBonus > 0) &&  (
    						<p>En attente d'autres joueurs...</p>
  						)}
  						{queueCount === 2 && (
    						<p>La partie commence entre Ldinaut et Mcouppe !</p>
  						)}
              { inGame === 1 && (
                <p>Deja en game mon reuf !</p>
              )} */}
                </a>
              </li>
              <li className="menu-item">
                {/* <a onClick={() => handlePlayerSelect222('1')}> */}
                <a>
                  <img src={folder3} alt="Menu 2" />
                  <p>Big Game</p>
                </a>
              </li>
              <li className="menu-item">
                <a onClick={() => NavToSoloPong()}>
                  <img src={folder2} alt="Menu 3" />
                  <p>Tiny Game</p>
                </a>
              </li>
              <li className="menu-item">
                <a onClick={navigateToProfPage}>
                  <img src={folder1} alt="Menu 3" />
                  <p>Profile</p>
                </a>
              </li>
              <li className="menu-item">
                <a onClick={navigateToSettings}>
                  <img src={folder} alt="Menu 3" />
                  <p>Settings</p>
                </a>
              </li>
              <li className="menu-item">
                <a onClick={navigateToFriends}>
                  <img src={folder0} alt="Menu 3" />
                  <p>Friends</p>
                </a>
              </li>
            </ul>
          </nav>
        </div>
        <footer>
          <button
            className="logoutBtn"
            onClick={() => Logout({ user, setUser })}
          >
            LOG OUT{" "}
          </button>
          <img src={logo} className="logo" alt="icon" />
        </footer>
      </body>
    </>
  );
};

export default FriendsPage;
