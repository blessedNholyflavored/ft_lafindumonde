import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export const FriendsList = (props: any) => {
    const [friends, setFriends] = useState<{ name: string; status: string }[]>([]);
    const { id } = useParams();

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
                console.log(data);
                if (data.length > 0) { 
                    const friendObjects = data[0].friends;
                    const friendInfo = friendObjects.map((friend: { username: any; status: any; }) => ({
                        name: friend.username,
                        status: friend.status
                    }));
                    setFriends(friendInfo);
                }
            } else {
                console.log("error: HTTP request failed");
            }
        } catch (error) {
            console.error('Error fetching friends:', error);
        }
    };

    return (
        <div className="test">
        {friends.length > 0 ? (
            friends.map((friend, index) => (
                <div key={index}>
                    <div>{friend.name}</div>
                    <div>{friend.status}</div>
                </div>
            ))
        ) : (
            <div>ptdr t'as pas de pote</div>
        )}
    </div>
);
}

export default FriendsList;

