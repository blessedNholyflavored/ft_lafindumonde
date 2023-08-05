import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const FriendsList = (props: any) => {
    const [friends, displayfriends] = useState<string>('');
    // const [user, setUser] = useState<any>(null);
    // const [lvl, setLevel] = useState<number>();
    // const [xp, setXp] = useState<number>();
    const { id } = useParams();
    // let mode = 0;

    useEffect(() => {
        fetchFriendsList(id);
      }, [id, props.type]);

      const fetchFriendsList = async (id: string | undefined) => {
        try {
          const response =  await fetch(`http://localhost:3000/users/${id}`, {
            method: "GET",
            //ici il faudra rajouter des trucs de header grace a lauth (pour verifier que lutilisateur connecte a bien les droits pour cette route)
          })
          if (response.ok) {
            const data = await response.json();
            if (data.username) {
                displayfriends(data.username);
        } else
          console.log("error : wrong shit");
          return "error";
          }
        } catch (error) {
          console.error('Error fetching usernames:', error);
        }
}
    return (
      <div className="test">
      {/* { mode ===1 && (
      <p>hiiiii {user}, your level is {lvl} and your xp is {xp} </p>)}
      { mode ===2 && (
      <p>6 {user}, your {lvl} </p>)}
       */}
        </div>
    )
}

export default FriendsList;