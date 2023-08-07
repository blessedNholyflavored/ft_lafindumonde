import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from 'axios';

export const FriendsList = (props: any) => {
    const [friends, setFriends] = useState<string[]>([]);
    const { id } = useParams();

    const [senderId, setSenderId] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [friendshipResult, setFriendshipResult] = useState(null);

    useEffect(() => {
        fetchFriendsList();
    }, [id]);

    const fetchFriendsList = async () => {
        try {
            const response = await fetch(`http://localhost:3000/friends/${id}`, {
                method: "GET",
                // les trucs dauth
            });

            if (response.ok) {
                const data = await response.json();
                if (data.length > 0) { 
                    const friendObjects = data[0].friends; 
                    const friendNames = friendObjects.map((friend: { username: any; }) => friend.username);
                    setFriends(friendNames);
                }
            } else {
                console.log("error: HTTP request failed");
            }
        } catch (error) {
            console.error('Error fetching friends:', error);
        }
    };

    // const openFriendship = async () => {
    //     try {
    //       const response = await axios.post('/api/addFriends', {
    //         senderId: parseInt(senderId), // Convert to number
    //         recipientId: parseInt(recipientId), // Convert to number
    //       });
    //       setFriendshipResult(response.data);
    //     } catch (err) {
    //       return('An error occurred while opening the friendship.');
    //     }
    //   };

    return (
        <div className="test">
            {friends.map((friend, index) => (
                <div key={index}>{friend} </div>
            ))}
        <div>
      {/* <input
        type="text" // Change the type to "text"
        value={senderId}
        onChange={(e) => setSenderId(e.target.value)}
        placeholder="Sender ID"
      />
      <input
        type="text" // Change the type to "text"
        value={recipientId}
        onChange={(e) => setRecipientId(e.target.value)}
        placeholder="Recipient ID"
      />
      <button onClick={openFriendship}>Open Friendship</button>
      {friendshipResult && (
        <p>Friendship opened between {friendshipResult.senderId} and {friendshipResult.recipientId}</p>
      )} */}
    </div> 
    </div>
        
    );




 
  
 

}


export default FriendsList;
