import React, { useState } from 'react';

export const FriendshipComponent = ()  => {
  const [senderId, setSenderId] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [friendshipResult, setFriendshipResult] = useState(null);

  const addFriendship = async () => {
    try {
      const response = await fetch('http://localhost:3001/users/friends/${id}', {
        method: "POST",
    })
    if (response.ok) {
      const data = await response.json();
      if(data.senderId !== undefined) {
      setSenderId(data);
      } if(data.recipientId !== undefined) {
      setRecipientId(data);
    } 
    } else {
        console.log("error : wrong data");
      }
    }
   catch (error) {
    console.error('Error fetching usernames:', error);
  }
};

  return (
    <div>
      <input
        type="text" 
        value={senderId}
        onChange={(e) => setSenderId(e.target.value)}
      />
      <input
        type="text"
        value={recipientId}
        onChange={(e) => setRecipientId(e.target.value)}
      />
      <button onClick={addFriendship}>add a new Friendship</button>
      {friendshipResult}
    </div>
  );
}

