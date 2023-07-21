import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export const Profile = () =>
{
  const [user, setUser] = useState(null);
  const { id } = useParams();
  
  useEffect(() => {
    fetchUserTab(id);
  }, [id]);

  const fetchUserTab = async (id: string | undefined) => {
    try {
      const response =  await fetch(`http://localhost:3000/users/${id}`, {
        method: "GET",
        //ici il faudra rajouter des trucs de header grace a lauth (pour verifier que lutilisateur connecte a bien les droits pour cette route)
      });
      const data = await response.json();
      // console.log(data);
      
      setUser(data);
      console.log("retouuuuur", data);

    } catch (error) {
      console.error('Error fetching usernames:', error);
    }
  };

  return(
<div className="App">
      {id}
      </div>
  )
}