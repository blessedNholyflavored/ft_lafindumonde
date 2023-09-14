import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useParams } from "react-router-dom";



interface friendsSend {
    id: string;
    status: string;
    senderId: number;
    recipientId: number;
    username: string;
  }


export const FriendsPage: React.FC = () => {

    const { user, setUser } =useAuth();
    const [ username, setUsername] = useState<string>('');


    // console.log(user.invitFriendSent);




const [friendsSend, setfriendsSend] = useState<friendsSend[]>([]);
const [friendsRequest, setfriendsRequest] = useState<friendsSend[]>([]);
const [friends, setFriends] = useState<friendsSend[]>([]);



    async function fetchfriendsSend() {
        try {
          const response = await fetch(`http://localhost:3001/friends/invSend/${user?.id}`, {
            method: 'GET',
          });
          if (!response.ok) {
              throw new Error('Erreur lors de la récupération des scores.');
            }
            const data = await response.json();
            const updatedData = await Promise.all(data.map(async (friend: {
              username: any; status: string; recipientId: number;
            }) => {
              // Utilisez recupUsername pour obtenir le nom d'utilisateur
              friend.username = await recupUsername(friend.recipientId);
              return friend; // Retournez l'ami mis à jour
            }));
            console.log(data);
            setfriendsSend(updatedData);
          return data[0];
        } catch (error) {
          console.error('Erreur:', error);
          return [];
        }
      }

      async function fetchfriendsRequest() {
        try {
          const response = await fetch(`http://localhost:3001/friends/invRequest/${user?.id}`, {
            method: 'GET',
          });
          if (!response.ok) {
              throw new Error('Erreur lors de la récupération des scores.');
            }
            const data = await response.json();
            const updatedData = await Promise.all(data.map(async (friend: {
              username: any; status: string; senderId: number;
            }) => {
              // Utilisez recupUsername pour obtenir le nom d'utilisateur
              friend.username = await recupUsername(friend.senderId);
              return friend; // Retournez l'ami mis à jour
            }));
            setfriendsRequest(updatedData);
          return data[0];
        } catch (error) {
          console.error('Erreur:', error);
          return [];
        }
      }

      const fetchFriendsList = async () => {
        try {
            const response = await fetch(`http://localhost:3001/friends/${user?.id}`, {
                method: "GET",
                // les trucs dauth
            });

            if (response.ok) {
              const data = await response.json();
                if (data.length > 0) { 
                    const friendObjects = data[0].friends;
                    console.log("aaaaa:   ", friendObjects);
                    const friendInfo = friendObjects.map((friend: {id:number; username: any; status: any; }) => ({
                        username: friend.username,
                        status: friend.status,
                        senderId: user?.id,
                        recipientId: friend.id,
                    }));
                    setFriends(friendInfo);
                    console.log(friendInfo);
                }
            } else {
                console.log("error: HTTP request failed");
            }
        } catch (error) {
            console.error('Error fetching friends:', error);
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
        fetchScores();
        fetchRequest();
        fetchFriends();

      }, []);

      async function recupUsername(id: number) {
        try {
            const response = await fetch(`http://localhost:3001/users/${id}`, {
              method: 'GET',
            });
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des scores.');
            }
            const data = await response.json();
            return(data.username);
          } catch (error) {
            console.error('Erreur:', error);
            return [];
          }
      }

      async function AcceptFriend(id: string) {
        try {
          const response = await fetch(`http://localhost:3001/friends/accept/${id}`, {
            method: 'POST',
          });
          if (!response.ok) {
              throw new Error('Erreur lors de la récupération des scores.');
          }
        } catch (error) {
          console.error('Erreur:', error);
        }
        window.location.reload();
      }

      async function RefuseFriend(id: string) {
        try {
          const response = await fetch(`http://localhost:3001/friends/refuse/${id}`, {
            method: 'POST',
          });
          if (!response.ok) {
              throw new Error('Erreur lors de la récupération des scores.');
          }
        } catch (error) {
          console.error('Erreur:', error);
        }
        window.location.reload();
      }

      async function deleteFriend(sender: string, recipient: string) {

        console.log(sender);
        console.log(recipient);
        try {
          const response = await fetch(`http://localhost:3001/friends/delete/${sender}/${recipient}`, {
            method: 'POST',
          });
          if (!response.ok) {
              throw new Error('Erreur lors de la récupération des scores.');
          }
        } catch (error) {
          console.error('Erreur:', error);
        }
        window.location.reload();
      }


      return (

      
        <div>
          <ul>

          {friends.length > 0 ? (
            friends.map((friend, index) => (
                <div key={index}>
              <h1>Liste des amis :</h1>

                    <div>{friend.username}</div>
                    <div>{friend.status}</div>
                    <button onClick={() => deleteFriend(friend.senderId.toString(), friend.recipientId.toString())}>Delete</button>

                </div>
            ))
        ) : (
            <div>ptdr t'as pas de pote</div>
        )}
        </ul>
          <ul>
            {friendsRequest.map((friend) => (
              <div>

              { friend.status === "PENDING" && (
                <li key={friend.id}>
              <h1>Liste des requetes en attente recues :</h1>
            <div>ID: {friend.id}</div>
            <div>Status: {friend.status}</div>
            <div>Sender ID: {user?.username}</div>
            <div>recipientId ID: {friend.username}</div>
            <button onClick={() => AcceptFriend(friend.id)}>Accepter</button>
            <button onClick={() => RefuseFriend(friend.id)}>Refuser</button>

          </li>
              )}
          </div>
            ))}
          </ul>
          <ul>

            {friendsSend.map((friend) => (

                <div>

                { friend.status === "PENDING" && (
                  <li key={friend.id}>
                <h1>Liste des requetes en attente envoyees :</h1>
              <div>ID: {friend.id}</div>
              <div>Status: {friend.status}</div>
              <div>Sender ID: {user?.username}</div>
              <div>recipientId ID: {friend.username}</div>
            </li>
              )}
                { friend.status === "ACCEPTED" && (
                <li key={friend.id}>
                  <h1>Liste des requetes ACCEPTED :</h1>
                <div>ID: {friend.id}</div>
                <div>Status: {friend.status}</div>
                <div>Sender ID: {user?.username}</div>
                <div>Recipient ID: {friend.username}</div>
              </li>
              )}
                { friend.status === "BLOQUE" && (
                <li key={friend.id}>
                  <h1>Liste des requetes en attente :</h1>
                <div>ID: {friend.id}</div>
                <div>Status: {friend.status}</div>
                <div>Sender ID: {user?.username}</div>
                <div>Recipient ID: {friend.username}</div>
              </li>
              )}
              </div>
            ))}
          </ul>
        </div>
      );
}   

export default FriendsPage;
