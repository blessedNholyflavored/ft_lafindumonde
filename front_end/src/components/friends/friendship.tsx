import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useParams } from "react-router-dom";

export const FriendshipComponent = ({ recipientId }: { recipientId?: string }) => {
    const { user } = useAuth(); 
    const { id } = useParams();

    const [friendshipStatus, setFriendshipStatus] = useState<string | null>(''); 

    useEffect(() => {
        fetchFriendshipStatus();
    }, [user, recipientId]);

    const fetchFriendshipStatus = async () => {
        try {
            const response = await fetch(`http://localhost:3001/friends/status?user=${user}&recipientId=${recipientId}`);
            if (response.ok) {
                const status = await response.text();
                setFriendshipStatus(status);
            } else {
                console.log("Error fetching friendship status");
            }
        } catch (error) {
            console.error('Error fetching friendship status:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!recipientId) {
            alert('Recipient ID is missing.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/friends/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user, recipientId: parseInt(recipientId) }),
            });
            
            if (response.ok) {
                setFriendshipStatus('Pending');
                localStorage.setItem('friendshipStatus', 'Pending');
                alert('Friendship created successfully.');
            } else {
                console.error('Error creating friendship:', response.statusText);
                alert('Error creating friendship: ' + response.statusText);
            }
        } catch (error) {
            console.error('Error creating friendship:', error);
        }
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <button type="submit" disabled={friendshipStatus === 'Pending'}>
                {friendshipStatus === 'Pending' ? 'Pending' : 'Add Friend'}
            </button>
        </form>
    );
}

export default FriendshipComponent;
