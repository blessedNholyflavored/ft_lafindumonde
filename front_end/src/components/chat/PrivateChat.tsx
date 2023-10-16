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

interface messages {
  senderId: any;
  start_at: string;
  content: string;
  recipientId: number;
  senderUsername: string;
  recipientUsername: string;
  isBlocked: string;
}

export const PrivateChat = () => {
  const { user } = useAuth();
  const { recipient } = useParams();
  const [value, setValue] = useState("");
  const [messageListSend, setMessageList] = useState<messages[]>([]);
  const navigate = useNavigate();
  const socket = useContext(WebsocketContext);
  const [isBlocked, setIsBlocked] = useState<string>("");
  const bottomEl = useRef<null | HTMLDivElement>(null);

  const fetchPrivMessageList = useCallback(async () => {
    if (!recipient) return;
    try {
      const firstres = await fetch(
        `http://${window.location.hostname}:3000/users/${recipient}/exist`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!firstres.ok) navigate(`/chat/`);
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
      scrollToBottom();

      return data[0];
    } catch (error) {
      console.error("Erreur :", error);
      return [];
    }
  }, [recipient, user?.id]);

  const fetchLastMessage = useCallback(async () => {
    if (!recipient) return;
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/chat/recupLastMess/${user?.id}/${recipient}`,
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
        const recipientResponse = await fetch(
          `http://${window.location.hostname}:3000/users/${messages.recipientId}/username`,
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
        if (senderResponse.ok && recipientResponse.ok && isBlockedResponse.ok) {
          const senderUsername = await senderResponse.text();
          const recipientUsername = await recipientResponse.text();
          const isBlocked = await isBlockedResponse.text();

          messages.senderUsername = senderUsername;
          messages.recipientUsername = recipientUsername;
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
  }, [recipient, user?.id]);

  useEffect(() => {
    if (socket) {
      socket.on("refreshMessagesTEST", () => {
        fetchLastMessage();
        setTimeout(() => {
          scrollToBottom();
        }, 300);
      });
    }
    return () => {
      if (socket) {
        socket.off("refreshMessagesTEST");
      }
    };
  });

  useEffect(() => {
    async function fetchPrivMessage() {
      if (recipient) {
        await fetchPrivMessageList();
      }
    }

    checkBlocked(recipient as any, user?.id as any);
    fetchPrivMessage();
    if (isBlocked === "true") navigate("/chat");
    return () => {
      if (socket) {
        socket.off("refreshMessagesTEST");
        socket.off("reloadMessRoom");
        socket.off("reloadListRoomForOne");
        socket.off("reloadMessagesTEST");
        socket.off("newMessage");
      }
    };
  }, [isBlocked, fetchPrivMessageList, navigate, recipient, user?.id, socket]);

  const onSubmit = () => {
    if (value.length > 0) {
      socket.emit("newMessage", value, recipient);
      setTimeout(() => {
        socket.emit("reloadMessagesTEST", value, recipient);
      }, 200);
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
    socket.emit("reloadListRoomForOne", recipient);
    navigate("/chat");
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
  }

  const handleEnter = (e: { key: string }) => {
    if (e.key === "Enter") {
      onSubmit();
    }
  };

  const scrollToBottom = () => {
    bottomEl?.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  return (
    <div className="testingchat ">
      <div className="chat-container">
        <div className="chatmessagebar-private">
          <div className="chat-messages" ref={bottomEl}>
            {recipient && (
              <ul>
                {messageListSend.length > 0 && user ? (
                  messageListSend.map((friend, index) => (
                    <div className="messorder" key={index}>
                      {friend.recipientId === user?.id && (
                        <div className="sentmessage">
                          <div>
                              {/* <div>{friend.start_at}</div> */}
                              <div className="whoschattin">
                                <div>{friend.senderUsername}</div>
                              </div>
                              <div>{friend.content}</div>
                          </div>
                        </div>
                      )}
                      {friend.recipientId !== user?.id && (
                        <div className="receivedmessage">
                          <div>
                              <div className="whoschattin">
                                <div>{friend.senderUsername}</div>
                              </div>
                              <div>{friend.content}</div>
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
            {/* <div ref={bottomEl}></div> */}
            <div className="sendingzoneprivate-privatechat">
              {recipient && (
                <div>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyPress={handleEnter}
                  />
                  <button
                    className="buttonseemore buttonchan"
                    onClick={() => {
                      onSubmit();
                      scrollToBottom();
                    }}
                    disabled={value.length > 80}
                  >
                    send
                  </button>
                </div>
              )}
              {recipient && isBlocked === "false" && (
                <button
                  className="buttonseemore buttonnotchan blocking"
                  onClick={() => BlockFriend(recipient.toString())}
                >
                  block
                </button>
              )}
              {isBlocked === "true" && recipient && (
                <button
                  className="buttonseemore buttonokchan"
                  onClick={() =>
                    removeBlocked(
                      user?.id.toString() as any,
                      recipient.toString()
                    )
                  }
                >
                  unblock
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PrivateChat;
