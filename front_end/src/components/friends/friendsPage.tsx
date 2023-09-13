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



    async function fetchfriendsSend() {
        try {
          const response = await fetch(`http://localhost:3001/friends/invSend/${user?.id}`, {
            method: 'GET',
          });
          if (!response.ok) {
              throw new Error('Erreur lors de la récupération des scores.');
            }
            const data = await response.json();
            // const array = data.map((friends:{    id: string;
            //     status: string;
            //     senderId: number;
            //     recipientId: number;}) => friends.id);
            // console.log(data[0]);
            // setfriendsSend(array);
            setfriendsSend(data);
          return data[0];
        } catch (error) {
          console.error('Erreur:', error);
          return [];
        }
      }
    
      useEffect(() => {
        async function fetchScores() {
          const scores = await fetchfriendsSend();
          // Tri des scores dans l'ordre décroissant
          // Attribuer les places aux joueurs
        }
        fetchScores();
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
            setUsername(data.username);
          } catch (error) {
            console.error('Erreur:', error);
            return [];
          }
        
      }

      return (
        <div>
          <h1>Liste des amis envoyés :</h1>
          {/* <ul>
            {friendsSend.map((friend, index) => (
              <li key={friend.id}>
                <div>ID: {friend.id}</div>
                <div>Status: {friend.status}</div>
                <div>Sender ID: {friend.senderId}</div>
                <div>
                  {friend.username ? (
                    `Recipient ID: ${friend.username}`
                  ) : (
                    index !== undefined ? (
                      `Recipient ID: ${recupUsername(friend.recipientId)}`
                    ) : (
                      ''
                    )
                  )}
                </div>
              </li>
            ))}
          </ul> */}
        </div>
      );
      
    //     <div>
    //       <ul>
    //         {friendsSend.map((friend, index) => (
    //             {!friend.username && (
    //                 recupUsername(friend.recipientId, index),
    //             )}
    //             <div>
    //             { friend.status === "PENDING" && (
    //             <li key={friend.id}>
    //               <h1>Liste des requetes en attente :</h1>
    //             <div>ID: {friend.id}</div>
    //             <div>Status: {friend.status}</div>
    //             <div>Sender ID: {user?.username}</div>
    //             <div>Recipient ID: {username}</div>
    //           </li>
    //           )}
    //             { friend.status === "ACCEPTED" && (
    //             <li key={friend.id}>
    //               <h1>Liste des requetes en attente :</h1>
    //             <div>ID: {friend.id}</div>
    //             <div>Status: {friend.status}</div>
    //             <div>Sender ID: {user?.username}</div>
    //             <div>Recipient ID: {username}</div>
    //           </li>
    //           )}
    //             { friend.status === "BLOQUE" && (
    //             <li key={friend.id}>
    //               <h1>Liste des requetes en attente :</h1>
    //             <div>ID: {friend.id}</div>
    //             <div>Status: {friend.status}</div>
    //             <div>Sender ID: {user?.username}</div>
    //             <div>Recipient ID: {username}</div>
    //           </li>
    //           )}
    //           </div>
    //         ))}
    //       </ul>
    //     </div>
    //   );
}   

export default FriendsPage;
