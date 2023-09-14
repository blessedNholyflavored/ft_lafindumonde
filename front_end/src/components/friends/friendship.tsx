import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useParams } from "react-router-dom";
// 

export enum FriendsInvitationStatus {
    ACCEPTED = "ACCEPTED",
    PENDING = "PENDING",
    REFUSED = "REFUSED",
  }

export const FriendshipComponent = ({ recipientId }: { recipientId?: string }) => {
    const {user, setUser } = useAuth();
    const { id } = useParams();
// 
    const [friendshipStatus, setFriendshipStatus] = useState<string | null>();
// 
// 

useEffect(() => {

fetchFriendshipStatus();
}
);


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
                setFriendshipStatus('PENDING');
                alert('Friendship created successfully.');
            } else {
                console.error('Error creating friendship: request is pending');
                alert('Error creating friendship: request is pending');
            }
        } catch (error) {
            console.error('Error creating friendship:', error);
        }
    };

    const checkAlreadyFriend = async () => {
        try {
            const response = await fetch(`http://localhost:3001/friends/already/${user?.id}/${id}`);
            if (response.ok) {
                let status = await response.text();
                setFriendshipStatus(status);
            } else {
                console.log("Error fetching friendship status. Status code:", response.status);
                const errorText = await response.text();
                console.error("Error details:", errorText);
            }
        } catch (error) {
            console.error('Error fetching friendship status:', error);
        }
    }


    const fetchFriendshipStatus = async () => {

        console.log("ICICICICICICII");
        console.log("id         :", id);
        console.log("user?id    :", user?.id);
        try {
            const response = await fetch(`http://localhost:3001/friends/status/${user?.id}/${id}`);
            if (response.ok) {
                let status = await response.text();
                console.log("qqqqqqq: ", friendshipStatus);
                if (status === "not")
                {
                    await checkAlreadyFriend();
                    return ;
                }
                setFriendshipStatus(status);
            } else {
                console.log("Error fetching friendship status. Status code:", response.status);
                const errorText = await response.text();
                console.error("Error details:", errorText);
                
            }
        } catch (error) {
            console.error('Error fetching friendship status:', error);
        }
    };

    const chekButton = () => {
    
        if (friendshipStatus === "PENDING" || friendshipStatus === "ACCEPTED")
            return true
        return false;
    }

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
            <button type="submit" disabled={chekButton()}>
                {friendshipStatus}
            </button>
        </form>
    );
};
// 
export default FriendshipComponent;