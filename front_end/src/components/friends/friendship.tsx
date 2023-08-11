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
                console.log('Friendship created successfully.');
            } else {
                console.error('Error creating friendship : request is pending');
                alert('Error creatingg friendship : request is pending');
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
            <button type="submit">add friend</button>
        </form>
    );
};


export default FriendshipComponent;