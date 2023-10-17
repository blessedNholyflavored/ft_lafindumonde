import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import icon from "../../img/iconpic.png";
import FriendshipComponent from "./../friends/friendship";
import { useAuth } from "../auth/AuthProvider";
import { WebsocketContext } from "../../services/WebsocketContext";

export enum FriendsInvitationStatus {
  ACCEPTED = "ACCEPTED",
  PENDING = "PENDING",
  REFUSED = "REFUSED",
}

export const ProfileBox = (props: any) => {
  const { id } = useParams();
  const [userr, setUserr] = useState<string | null>(null);
  const [lvl, setLevel] = useState<string | null>(null);
  const [xp, setXp] = useState<string | null>(null);
  const [elo, setElo] = useState<string | null>(null);
  const [friendshipStatus, setFriendshipStatus] =
    useState<FriendsInvitationStatus | null>(null);
  const { user, setUser } = useAuth();
  const socket = useContext(WebsocketContext);
  const [rank, setRank] = useState<string>("");

  useEffect(() => {
    fetchUserTab(id);
    fetchFriendshipStatus();
    fetchDivision();
  }, [id]);

  const fetchUserTab = async (id: string | undefined) => {
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/users/${id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUserr(data.username);
        setLevel(data.level.toString());
        setXp(data.xp);
        setElo(data.ELO);
      } else {
        console.log("error : wrong fetch");
      }
    } catch (error) {
      console.error("Error fetching usernames:", error);
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
        const status = await response.text();
        setFriendshipStatus(status as FriendsInvitationStatus);
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

  const renderFriendshipButton = () => {
    if (friendshipStatus === "ACCEPTED") {
      return <FriendshipComponent recipientId={id} />;
    } else if (friendshipStatus === "PENDING") {
      return <FriendshipComponent recipientId={id} />;
    } else if (friendshipStatus === "REFUSED") {
      return <FriendshipComponent recipientId={id} />;
    } else {
      return <FriendshipComponent recipientId={id} />;
    }
  };

  const fetchDivision = async () => {
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/users/${id}/rank`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.text();
        setRank(data);
      }
    } catch (error) {
      console.error("Error fetching usernames:", error);
    }
  };

  return (
    <div className="profilecard">
      <p className="username">
        <img src={icon} className="icon" alt="icon"></img>
        username:{userr}
      </p>
      <p className="userlvl">
        <img src={icon} className="icon" alt="icon"></img>
        level: {lvl}
      </p>
      <p className="userxp">
        <img src={icon} className="icon" alt="icon"></img>
        xp: {xp}
      </p>
      <p className="userelo">
        <img src={icon} className="icon" alt="icon"></img>
        rank: {elo} / {rank}
      </p>

      {renderFriendshipButton()}
    </div>
  );
};

export default ProfileBox;
