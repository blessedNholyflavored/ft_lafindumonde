import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import '../../style/Profile.css'
import Box from "./Box";
// import myimage from "../../img/buttoncomp.png";
// import myicon from "../../img/iconpic.png";

export const Profile = () =>
{
  const [user, setUser] = useState<any>(null);
  const { id } = useParams();
  
  useEffect(() => {
    fetchUserTab(id);
  }, [id]);

  const fetchUserTab = async (id: string | undefined) => {
    try {
      const response =  await fetch(`http://localhost:3001/users/${id}`, {
        method: "GET",
        //ici il faudra rajouter des trucs de header grace a lauth (pour verifier que lutilisateur connecte a bien les droits pour cette route)
      })
      if (response.ok) {
      const data = await response.json();
      setUser(data);

      } else {
      console.log("error : wrong shit");
      return "error";
      }
    } catch (error) {
      console.error('Error fetching usernames:', error);
    }
  }

  return(
    // <div className="main">
    //   <div className="navbar">
    //     {/* <img alt="navdots" className="navimg" src={myimage}/> */}
    //     <p className="navtitle"> INFOS</p>
    //     </div>
    //   <div className="contain-page">
    //   {user && (
         <div className="lucie">
        	<Box user={user} type="info" ></Box>
          
        	{/* <Box type="friends" ></Box> */}

       </div>
    //       </div>
    //       <div className="footer">
    //         hhh
    //       </div>
    // </div>
  )
}


// useEffect(() => {
//   getUser(props.id)
// }, [props.id])


// const getUser = async (id: string) => {
//   try {
//     const response = await fetch("http://" + window.location.hostname + ':3000'  + `/users/friends/${id}`, {
//       method: "GET",
//     })
//     if (response.ok) {
//       const data = await response.json();
//       setUser(data);
//     } else {
//       console.log("POST error on /friendship/id");
//       return "error";
//     }
//   } catch (error) {
//     console.log("error", error);
//    }
// }
