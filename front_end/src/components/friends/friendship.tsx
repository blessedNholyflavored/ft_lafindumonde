import React, { useState, useEffect, useContext } from "react";
import { useAuth } from "../auth/AuthProvider";
import { useNavigate, useParams } from "react-router-dom";
import { WebsocketContext } from "../../services/WebsocketContext";
//

export enum FriendsInvitationStatus {
  ACCEPTED = "ACCEPTED",
  PENDING = "PENDING",
  REFUSED = "REFUSED",
}

export const FriendshipComponent = ({
  recipientId,
}: {
  recipientId?: string;
}) => {
  const { user, setUser } = useAuth();
  const { id } = useParams();
  const [friendshipStatus, setFriendshipStatus] = useState<string | null>();
  const socket = useContext(WebsocketContext);
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    fetchFriendshipStatus();
    if (socket) {
      socket.on("refreshListFriendPage", () => {
        fetchFriendshipStatus();
      });
    }
  });
  async function checkBlockedForNotify(senderId: string, recipientId: string) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientId) {
      alert("Recipient ID is missing.");
      return;
    }
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/friends/${user?.id}/${id}`,
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
        setFriendshipStatus("PENDING");
        if (
          user &&
          (await checkBlockedForNotify(user?.id.toString(), recipientId)) ===
            false
        )
          socket.emit("notifyFriendShip", id);
        socket.emit("reloadListFriendPage", id);
        alert("Friendship created successfully.");
      } else {
        console.error("Error creating friendship: request is pending");
        alert("Error creating friendship: request is pending");
      }
    } catch (error) {
      console.error("Error creating friendship:", error);
    }
  };

  const checkAlreadyFriend = async () => {
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/friends/already/${user?.id}/${id}`,
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        let status = await response.text();
        if (status === "Add friend") {
          await checkBlocked();
          return;
        }
        setFriendshipStatus(status);
      } else {
        console.log(
          "Error fetching friendship status. Status code:",
          response.status
        );
        const errorText = await response.text();
        console.error("Error details:", errorText);
      }
    } catch (error) {
      console.error("Error fetching friendship status:", error);
    }
  };

  const checkBlocked = async () => {
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/friends/blockedStatus/${id}/${user?.id}/`,
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        let status = await response.text();
        setFriendshipStatus(status);
      } else {
        console.log(
          "Error fetching friendship status. Status code:",
          response.status
        );
        const errorText = await response.text();
        console.error("Error details:", errorText);
      }
    } catch (error) {
      console.error("Error fetching friendship status:", error);
    }
  };

  const fetchFriendshipStatus = async () => {
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/friends/status/${user?.id}/${id}`,
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        let status = await response.text();
        if (status === "not") {
          await checkAlreadyFriend();
          return;
        }
        setFriendshipStatus(status);
      } else {
        console.log(
          "Error fetching friendship status. Status code:",
          response.status
        );
        const errorText = await response.text();
        console.error("Error details:", errorText);
      }
    } catch (error) {
      console.error("Error fetching friendship status:", error);
    }
  };

  const checkButton = () => {
    if (
      friendshipStatus === "PENDING" ||
      friendshipStatus === "ACCEPTED" ||
      friendshipStatus === "BLOCKED"
    )
      return true;
    return false;
  };

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
    window.location.reload();
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
    window.location.reload();
  }

  async function inviteToMatch(sender: string, recipient: string) {
    if (
      user &&
      (await checkBlockedForNotify(user?.id.toString(), recipient)) === false
    )
      socket.emit("inviteToMatch", recipient);
  }

  if (socket && accepted === false) {
    socket?.on("matchStart", (roomdId: number) => {
      setAccepted(true);
      navigate(`/gamefriend/${roomdId}`);
    });
  }

  //
  return (
    <div>
      {user && user.id.toString() !== recipientId && (
        <form onSubmit={handleSubmit}>
          <div>
            <label>Sender ID: {user?.id}</label>
          </div>
          <div>
            <label>Recipient ID: {recipientId}</label>
          </div>
          <button type="submit" disabled={checkButton()}>
            {friendshipStatus}
          </button>
        </form>
      )}
      {friendshipStatus === "Add friend" &&
        user &&
        user.id.toString() !== recipientId && (
          <button
            onClick={() => BlockFriend(user?.id as any, id as string)}
            disabled={checkButton()}
          >
            Block ?
          </button>
        )}
      {user && user.id.toString() !== recipientId && (
        <button onClick={() => inviteToMatch(user?.id as any, id as string)}>
          inviter en match ?
        </button>
      )}
    </div>
  );
};
export default FriendshipComponent;
