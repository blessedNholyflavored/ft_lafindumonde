import { useState } from "react";
import '../../style/Profile.css'
import  Box from "./Box";
import { useAuth } from "../auth/AuthProvider";
// import myimage from "../../img/buttoncomp.png";
// import myicon from "../../img/iconpic.png";

export const Profile = () =>
{
  // const [user] = useState<any>(null);
  const { user, setUser } =useAuth();

  return (
     <div className="lucie">
      	<Box user={user} type="info" ></Box>
     </div>
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