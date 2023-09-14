import React, { useState, useEffect } from 'react';
import '../../style/Profile.css';
import '../../style/twoFA.css';
import icon from "../../img/buttoncomp.png";
import logo from "../../img/logo42.png";
import { useAuth } from '../auth/AuthProvider';
import { twoFAEnable, twoFADisable } from '../auth/2faComp';
import api from '../../AxiosInstance';
import { Logout } from './../auth/Logout';
import { useNavigate } from 'react-router-dom';


export const UserSetting: React.FC = () => {
	const [newUsername, setNewUsername] = useState('');
	const [newPicture, setNewPicture] = useState<File | null>(null);
	let [ImgUrl, setImgUrl] = useState<string>('');
	const [error, setError] = useState<string | null>(null);
	const { user, setUser } = useAuth();
	const navigate = useNavigate();
	const [gameData, setGameData] = useState<Game[]>([]);

	useEffect(() => {
		displayPic();
		FetchGames();
	}, []);
	

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const userId = user?.id;
		console.log("dans front user id = ", userId);
		try {
			const response = await fetch(`http://localhost:3001/users/${userId}/update-username`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ username: newUsername }),
			});
			if (response.ok) {
				alert('Nom d\'utilisateur mis à jour avec succès !');
			} else {
				alert('Une erreur s\'est produite lors de la mise à jour du nom d\'utilisateur.');
			}
		} catch (error) {
			console.error('Erreur:', error);
		}
	};

	const displayPic = async() => {

		const userId = user?.id;
		try {
			const response = await fetch(`http://localhost:3001/users/${userId}/avatar`, {
				method: 'GET',
			});
			if (response.ok) {
				const pictureURL = await response.text();
				if (pictureURL.includes("https"))
				{
					setImgUrl(pictureURL);
				}
				else {
					try {
					const response = await fetch(`http://localhost:3001/users/uploads/${pictureURL}`, {
						method: 'GET',
					});
					if (response.ok) {
						const blob = await response.blob();
						const absoluteURL = URL.createObjectURL(blob);
						setImgUrl(absoluteURL);
					}
					}
					catch (error) {
						console.error(error);
					}
				}
			}
		}
		catch (error) {
			console.error(error);
		}
	}

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		e.preventDefault();
		const file = e.target.files?.[0];
		if (file) {
			console.log(file.type);
			console.log("QQQQQQQQQQQQQQQQQ", file);
			setNewPicture(file);
		}
	};

	const changePic = async () => {
		console.log("DANS CHANGE PIC");
		const userId = user?.id;
		if (newPicture) {
		  const blob = new Blob([newPicture], { type: newPicture.type });
		  const formData = new FormData();
		  
		  formData.append("userpic", blob, newPicture.name);
	  
		  console.log(formData);
	  
		  try {
			const response = await fetch(`http://localhost:3001/users/${userId}/update-avatar`, {
			  method: 'POST',
			  body: formData,
			});
			if (response.ok) {
				const result = await response.json();
				setImgUrl(result.pictureURL);
				//setImgUrl(URL.createObjectURL(blob));
				console.log("DDDDDDDDDDDDDDDDDDDDDD", result.pictureURL);
				alert('profil picture mise à jour avec succès !');
				displayPic();

			} else {
				console.log("kkkkkkkkkk");
				const backError = await response.json();
				setError(backError.message);
				alert(backError.message);
			}
		  } catch (error) {
			//console.log("icicicci   ",error);
			if (error instanceof Response) {
				const backError = await error.json();
				setError(backError.message);
				alert(backError.message);
				console.log("llalalalaal   ", backError)
			}
		}
		}
	  }
	// async function twoFAEnable() {
    //     try {
    //         //mettre ici bonne route finale 
    //         const res = await api.get('/auth/2FAenable');
    //         console.log(res.data.code);
    //         return navigate(`/totpSave?qrCodeImg=${encodeURIComponent(res.data.code)}`)
    //     } catch (error) {
    //         console.log('Error while 2fa-ing : ', error);
    //     }
    // }

	interface Game {
		id: number;
		start_at: string;
		userId1: number;
		userId2: number;
		username1: string;
		username2: string;
		scrP1: number;
		scrP2: number;
	  }

	  const FetchGames = async () => {

		const userId = user?.id;
		try {
			const response = await fetch(`http://localhost:3001/users/${userId}/games-data`, {
				method: "GET",
			});
			if (response.ok)
			{
				const data = await response.json();
				const updatedGameData = [...data];
				let i: number = 0;
				while (i < updatedGameData.length)
				{
					try {
						const response = await fetch(`http://localhost:3001/users/${updatedGameData[i].userId1}/username`, {
							method: "GET",
						});
						const response2 = await fetch(`http://localhost:3001/users/${updatedGameData[i].userId2}/username`, {
							method: "GET",
						});
						if (response.ok)
							updatedGameData[i].username1 = await response.text();
						if (response2.ok)
							updatedGameData[i].username2 = await response2.text();
					}
					catch (error) {
						console.log (error);
					}
					i++;
				}
				setGameData(updatedGameData.reverse());
			}
			else
			{
				console.log("response pas ok");
			}
		} catch (error) {
			console.error("error de get game data", error);
		}
	  };

  return (
	<>
	<div className="mainpage">
		<div className="navbarmainpage">
			<img src={icon} className="buttonnav" alt="icon" />
			<p className="titlemainpage"> TRANSCENDENCE </p>
		</div>
		<div className="Insidemain">
			<div className="navbarbox">
				<img src={icon} className="buttonnav" alt="icon" />
				<p className="titlebox"> SETTINGS </p>
			</div>
		<div className="threerow">

{/* premier */}
	<div className="boxrowsettings">
		<div className="navbarsmallbox">
			<p className="boxtitle"> USERNAME </p>
		</div>
		<form className='formsettings' onSubmit={handleSubmit}>
			<label className='labelcss'>
			<input
				className='inputcss'
				type="text"
				value={newUsername}
				placeholder="type new username"
				onChange={(e) => setNewUsername(e.target.value)} />
			</label>
			<button className='buttonsettings' type="submit">update</button>
		</form>
		<div className="footersmallbox">
			<br></br>
		</div>
	</div>

	{/* deuxieme */}
	<div className="boxrowsettings">
		<div className="navbarsmallbox">
			<p className="boxtitle"> AVATAR </p>
		</div>
		<img src={ImgUrl} alt='user avatar'></img>
		<div>
			<input type="file" accept="image/.jpg,.jpeg,.png" onChange={handleFileChange} />
			<button onClick={changePic}>Upload</button>
		</div>
		<div className="footersmallbox">
			<br></br>
		</div>
	</div>

{/* troisieme */}
	{/* <div className="boxrowsettings">
		<div className="navbarsmallbox">
			<p className="boxtitle"> 2FAC AUTH </p>
		</div>
		<div className="twoFA">
			<button className="twoFAenabled" onClick={() => twoFAEnable(navigate)}>enable</button>
			<button className="twoFAdisabled" onClick={() => twoFADisable({user, setUser})}>disable</button>
		</div>
		<div className="footersmallbox">
			<br></br>
		</div>
	</div> */}


{/* quatre juste pour test game history */}
	<div className="boxrowsettings">
		<div className="navbarsmallbox">
			<p className="boxtitle"> GAME HISTORY </p>
		</div>
		<div>
			<table>
			<thead>
				<tr>
				<th>game id</th>
				<th>Joueur 1</th>
				<th></th>
				<th></th>
				<th>Joueur 2</th>
				</tr>
			</thead>
			<tbody>
				{gameData.slice(0, 5).map((game: Game, index: number) => (
				<tr key={index}>
					<td>{game.id}</td>
					<td>{game.username1}</td>
					<td>{game.scrP1}</td>
					<td>{game.scrP2}</td>
					<td>{game.username2}</td>
				</tr>
				))}
			</tbody>
			</table>
		</div>

		<div className="footersmallbox">
			<br></br>
		</div>
	</div>
	</div>

	</div>
	<div className="footerprofilsettings">
		{/* <br></br> */}
		<button className="logoutBtn" onClick={() => Logout({user, setUser})}>LOG OUT </button>
		<img src={logo} className="logo" alt="icon" />
	</div>
	</div>
	</>
  );
};

export default UserSetting;
