import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import icon from "../../img/iconpic.png";
import FriendshipComponent from "./../friends/friendship"; // Assurez-vous que le chemin d'importation est correct

export enum FriendsInvitationStatus {
    ACCEPTED = "ACCEPTED",
    PENDING = "PENDING",
    REFUSED = "REFUSED",
  }

export const ProfileBox = (props: any) => {
    const { id } = useParams();
    const [user, setUser] = useState<string | null>(null);
    const [lvl, setLevel] = useState<number | null>(null);
    const [xp, setXp] = useState<number | null>(null);
    const [friendshipStatus, setFriendshipStatus] = useState<FriendsInvitationStatus | null>(null);

    useEffect(() => {
        fetchUserTab(id);
        fetchFriendshipStatus();
    }, [id, props.type]);

    const fetchUserTab = async (id: string | undefined) => {
        try {
          const response =  await fetch(`http://localhost:3001/users/${id}`, {
            method: "GET",
            //ici il faudra rajouter des trucs de header grace a lauth (pour verifier que lutilisateur connecte a bien les droits pour cette route)
          })
          if (response.ok) {
            const data = await response.json();
            if (data.username) {
              setUser(data.username);
            } if (data.level) {
              setLevel(data.level)
          } if (data.xp) {
              setXp(data.xp)
        } else
          console.log("error : wrong shit");
          return "error";
          }
        } catch (error) {
            console.error('Error fetching usernames:', error);
        }
    };


    const fetchFriendshipStatus = async () => {
        try {
            const response = await fetch(`http://localhost:3000/friends/status?senderId=1&recipientId=${id}`);
            if (response.ok) {
                const status = await response.text();
                setFriendshipStatus(status as FriendsInvitationStatus);
                console.log('hihihihih');
                console.log(response);
            } else {
                console.log("Error fetching friendship status");
            }
        } catch (error) {
            console.error('Error fetching friendship status:', error);
        }
    };
    
    const renderFriendshipButton = () => {
        if (friendshipStatus === FriendsInvitationStatus.ACCEPTED) {
            return <FriendshipComponent recipientId={id} />;
        } else if (friendshipStatus === FriendsInvitationStatus.PENDING) {
            return <FriendshipComponent recipientId={id} />;
        } else if (friendshipStatus === FriendsInvitationStatus.REFUSED) {
            return <FriendshipComponent recipientId={id} />;
        } else {
                return <FriendshipComponent recipientId={id} />;
            }
        }
   
    return (
        <div className="profilecard">
            <p className="username">
                <img src={icon} className="icon" alt="icon"></img>
                {user}
            </p>
            <p className="userlvl">
                <img src={icon} className="icon" alt="icon"></img>
                {lvl}
            </p>
            <p className="userxp">
                <img src={icon} className="icon" alt="icon"></img>
                {xp}
            </p>
            {renderFriendshipButton()}
            

        </div>
    );
};

export default ProfileBox;