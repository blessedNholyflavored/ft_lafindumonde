import { useEffect, useState } from "react";
import '../../style/Profile.css'
import Box from "./Box";
import { useAuth } from "../auth/AuthProvider";
import { useParams, useNavigate } from 'react-router-dom';
// import myicon from "../../img/iconpic.png";

export const Profile = () => {
	const { user, setUser } = useAuth();
	const [userExists, setUserExists] = useState<boolean>(false);
	const navigate = useNavigate();
	const { id } = useParams();
  
	useEffect(() => {
	  const checkId = async () => {
		try {
		  const response = await fetch(`http://${window.location.hostname}:3000/users/${id}`, {
			method: 'GET',
			credentials: 'include',
		  });
		  if (response.ok) {
			setUserExists(true);
		  } else {
			navigate('/404');
		  }
		} catch (error) {
		  console.log(error);
		}
	  };
	  checkId();
	}, [id, navigate, setUserExists]);
  
	return (
	  <div className="lucie">
		{userExists && (
		  <Box user={user} type="info"></Box>
		)}
		{/* <Box type="friends"></Box> */}
	  </div>
	);
  };
  

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