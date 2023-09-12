import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useParams } from "react-router-dom";
// 
export const FriendshipComponent = ({ recipientId }: { recipientId?: string }) => {
    const {user, setUser } = useAuth();
    const { id } = useParams();
// 
    const [friendshipStatus, setFriendshipStatus] = useState<string | null>();
// 
// 
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
// 
        if (!recipientId) {
            alert('Recipient ID is missing.');
            return;
        }
        try {
            const response = await fetch(`http://localhost:3001/friends/${user?.id}/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({recipientId: parseInt(recipientId) }),
            });
// 
            if (response.ok) {
                setFriendshipStatus('Pending');
                alert('Friendship created successfully.');
            } else {
                console.error('Error creating friendship: request is pending');
                alert('Error creating friendship: request is pending');
            }
        } catch (error) {
            console.error('Error creating friendship:', error);
        }
    };
// 
    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>
                    Sender ID: {user?.id}
                </label>
            </div>
            <div>
                <label>
                    Recipient ID: {recipientId}
                </label>
            </div>
            <button type="submit" disabled={friendshipStatus === 'Pending'}>
                {friendshipStatus === 'Pending' ? 'Pending' : 'Add Friend'}
            </button>
        </form>
    );
};
// 
export default FriendshipComponent;