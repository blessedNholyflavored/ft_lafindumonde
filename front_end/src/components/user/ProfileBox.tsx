import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import icon from "../../img/iconpic.png";
import FriendshipComponent from "./../friends/friendship"; // Assurez-vous que le chemin d'importation est correct
import { useAuth } from "../auth/AuthProvider";
import { WebsocketContext } from "../../WebsocketContext";

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

  useEffect(() => {
    fetchUserTab(id);
    fetchFriendshipStatus();


  }, []);

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
        // }
      } else {
        console.log("error : wrong shit");
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
        rank: {elo} / 10000000
      </p>

      {renderFriendshipButton()}
    </div>
  );
};

export default ProfileBox;
