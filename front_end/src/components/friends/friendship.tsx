import React, { useState, useEffect } from 'react';

export const FriendshipComponent = ({ recipientId }: { recipientId?: string }) => {
    const [senderId] = useState(1);
    const [friendshipStatus, setFriendshipStatus] = useState<string | null>(() => {
        // Initialize the friendshipStatus from localStorage
        return localStorage.getItem('friendshipStatus') || '';
    });

    useEffect(() => {
        // Fetch the friendship status when the component mounts
        fetchFriendshipStatus();
    }, []);

    const fetchFriendshipStatus = async () => {
        try {
            const response = await fetch(`http://localhost:3000/friends/status?senderId=${senderId}&recipientId=${recipientId}`);
            if (response.ok) {
                const status = await response.text();
                setFriendshipStatus(status);
                // Store the friendshipStatus in localStorage
                localStorage.setItem('friendshipStatus', status);
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
            const response = await fetch('http://localhost:3000/friends', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ senderId, recipientId: parseInt(recipientId) }),
            });

            if (response.ok) {
                // Update the friendship status to "Pending"
                setFriendshipStatus('Pending');
                // Store the friendshipStatus in localStorage
                localStorage.setItem('friendshipStatus', 'Pending');
                alert('Friendship created successfully.');
            } else {
                console.error('Error creating friendship: request is pending');
                alert('Error creating friendship: request is pending');
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
            <button type="submit" disabled={friendshipStatus === 'Pending'}>
                {friendshipStatus === 'Pending' ? 'Pending' : 'Add Friend'}
            </button>
        </form>
    );
};

export default FriendshipComponent;
