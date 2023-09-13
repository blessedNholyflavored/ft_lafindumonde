import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import icon from "../../img/iconpic.png"

const ProfileBox = (props: any) => {
    const [user, setUser] = useState<any>(null);
    const [lvl, setLevel] = useState<number>();
    const [xp, setXp] = useState<number>();
    const { id } = useParams();

    useEffect(() => {
        fetchUserTab(id);
      }, [id, props.type]);
      
      const fetchUserTab = async (id: string | undefined) => {
        try {
          const response =  await fetch(`http://localhost:3001/users/${id}`, {
            method: "GET",
            //ici il faudra rajouter des trucs de header grace a lauth (pour verifier que lutilisateur connecte a bien les droits pour cette route)
          })
          if (response.ok) {
            const data = await response.json();
            if (data.username) {
              setUser(data.username);
            } if (data.level) {
              setLevel(data.level)
          } if (data.xp) {
              setXp(data.xp)
        } else
          console.log("error : wrong shit");
          return "error";
          }
        } catch (error) {
          console.error('Error fetching usernames:', error);
        }
}
    return (
      <div className="profilecard">
          <p className="username">
            <img src={icon} className="icon" alt="icon"></img>
            {user} </p>
          <p className="userlvl"> 
          <img src={icon} className="icon" alt="icon"></img>
          {lvl} </p> 
          <p className="userxp"> 
          <img src={icon} className="icon" alt="icon"></img>
          {xp} </p>
        </div>
    )
}

export default ProfileBox;