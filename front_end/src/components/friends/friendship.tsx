// import React, { useState } from 'react';

// export const FriendshipComponent = () => {
//   const [senderId, setSenderId] = useState('');
//   const [recipientId, setRecipientId] = useState('');

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     try {
//       const response = await fetch('http://localhost:3000/friends', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ senderId: parseInt(senderId), recipientId: parseInt(recipientId) }),
//       });

//       if (response.ok) {
//         alert('Friendship created successfully.');
//         setSenderId('');
//         setRecipientId('');
//       } else {
//         alert('Error creating friendship.');
//       }
//     } catch (error) {
//       console.error('Error creating friendship:', error);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <div>
//         <label>
//           Sender ID:
//           <input type="number" value={senderId} onChange={(e) => setSenderId(e.target.value)} />
//         </label>
//       </div>
//       <div>
//         <label>
//           Recipient ID:
//           <input type="number" value={recipientId} onChange={(e) => setRecipientId(e.target.value)} />
//         </label>
//       </div>
//       <button type="submit">Create Friendship</button>
//     </form>
//   );
// };

// // export default FriendshipComponent;

import React, { useState } from 'react';

export const FriendshipComponent = ({ recipientId }: { recipientId?: string }) => {
    const [senderId] = useState(1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!recipientId) {
            alert('Recipient ID is missing.');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/friends', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ senderId, recipientId: parseInt(recipientId) }),
            });

            if (response.ok) {
                alert('Friendship created successfully.');
            } else {
                alert('Error creating friendship.');
            }
        } catch (error) {
            console.error('Error creating friendship:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>
                    Sender ID: {senderId}
                </label>
            </div>
            <div>
                <label>
                    Recipient ID: {recipientId}
                </label>
            </div>
            <button type="submit">Create Friendship</button>
        </form>
    );
};


export default FriendshipComponent;
