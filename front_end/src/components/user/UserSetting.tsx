import React, { useState, useEffect } from 'react';
import '../../style/Profile.css';
import '../../style/twoFA.css';
import icon from "../../img/buttoncomp.png";
import logo from "../../img/logo42.png";
import { useAuth } from '../auth/AuthProvider';
import { twoFAEnable, twoFADisable } from '../auth/2faComp';
import { Logout } from './../auth/Logout';
import { useNavigate } from 'react-router-dom';
import "../../../src/style/Home.css";
import folder from "./../../img/folder0.png";
import folder1 from "./../../img/folder2.png";
import folder2 from "./../../img/folder3.png";
import folder3 from "./../../img/folder4.png";
import folder4 from "./../../img/folder5.png";
import folder0 from "./../../img/folder1.png";
import folder6 from "./../../img/folder6.png";
import nav from "../../img/buttoncomp.png"

export const UserSetting: React.FC = () => {
	const [newUsername, setNewUsername] = useState('');
	const [newPicture, setNewPicture] = useState<File | null>(null);
	let [ImgUrl, setImgUrl] = useState<string>('');
	const [error, setError] = useState<string | null>(null);
	const { user, setUser } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		displayPic();
	}, []);
	

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const userId = user?.id;
		console.log("dans front user id = ", userId);
		try {
			const response = await fetch(`http://localhost:3000/users/${userId}/update-username`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ username: newUsername }),
				credentials: 'include',
			});
			if (response.ok) {
				alert('Nom d\'utilisateur mis à jour avec succès !');
				//window.location.reload();
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
			const response = await fetch(`http://localhost:3000/users/${userId}/avatar`, {
				method: 'GET',
				credentials: 'include',
			});
			if (response.ok) {
				const pictureURL = await response.text();
				//console.log("aaaaaaA",pictureURL);
				if (pictureURL.includes("https"))
				{
					setImgUrl(pictureURL);
				}
				else {
					try {
					const response = await fetch(`http://localhost:3000/users/uploads/${pictureURL}`, {
						method: 'GET',
						credentials: 'include',
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
			const response = await fetch(`http://localhost:3000/users/${userId}/update-avatar`, {
			  method: 'POST',
			  body: formData,
				credentials: 'include',
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
	const navigateToHome = () => {
		navigate('/');
	};


	  const navigateToProfPage = () => {
		navigate(`/users/profile/${user?.id}`);
	  };
	
	  const navigateToChat = () => {
		navigate('/chat');
	  };
	
	  const NavToSoloPong = () => {
		navigate('/solopong');
		};
	
	  const navigateToFriends = () => {
		navigate('/friends');
		};
	
	
	  const navigateToSettings = () => {
		navigate('/settings');
		};


		
  return (
	<>
  <body>

	<header>
        <div>
            <img src={nav} alt="Menu 1"/>
        </div>
        <h1>TRANSCENDENCE</h1>
    </header>
    
    <div className="flex-bg">
		<main>
	{/* <div className="mainpage"> */}
		{/* <div className="navbarmainpage">
			<img src={icon} className="buttonnav" alt="icon" />
			<p className="titlemainpage"> TRANSCENDENCE </p>
		</div> */}
		{/* <div className="Insidemain">
			<div className="navbarbox">
				<img src={icon} className="buttonnav" alt="icon" />
				<p className="titlebox"> SETTINGS </p>
			</div> */}
		<div className="threerow">

{/* premier */}
	<div className="boxrowsettings">
		<div className="navbarsmallbox">
			<p className="boxtitle"> CHANGE USERNAME </p>
		</div>
		<form className='formsettings' onSubmit={handleSubmit}>
			<label className='labelcss'>
			<input
				maxLength={9}
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
			<p className="boxtitle"> CHANGE AVATAR </p>
		</div>
		<img src={ImgUrl} alt='user avatar'></img>
		<div>
			<input type="file" accept="image/*" onChange={handleFileChange} />
			<button onClick={changePic}>Upload</button>
		</div>
		<div className="footersmallbox">
			<br></br>
		</div>
	</div>

{/* troisieme */}
	<div className="boxrowsettings">
		<div className="navbarsmallbox">
			<p className="boxtitle"> 2FAC AUTH </p>
		</div>
		<div className="twoFA">
			<button className="twoFAenabled" onClick={() => twoFAEnable(navigate, user)}>enable</button>
			<button className="twoFAdisabled" onClick={() => twoFADisable({user, setUser})}>disable</button>
		</div>
		<div className="footersmallbox">
			<br></br>
		</div>
	</div>
	</div>

			</main>

	<nav>
            <ul>
            <li className="menu-item">
                    <a onClick={navigateToHome}>
                        <img src={folder6} alt="Menu 3"/>
                        <p  >Home</p>
                    </a>
                </li>
                <li className="menu-item">
                    {/* <a > onClick={() => handlePlayerSelect('1')}> */}
                    <a>
                        <img src={folder4} alt="Menu 1"/>
                        <p  >Matchmaking</p>
                       {/* {(queueCount > 0 || queueCountBonus > 0) &&  (
    						<p>En attente d'autres joueurs...</p>
  						)}
  						{queueCount === 2 && (
    						<p>La partie commence entre Ldinaut et Mcouppe !</p>
  						)}
              { inGame === 1 && (
                <p>Deja en game mon reuf !</p>
              )} */}
                    </a>
                </li>
                <li className="menu-item">
                    {/* <a onClick={() => handlePlayerSelect222('1')}> */}
                    <a>
                        <img src={folder3} alt="Menu 2"/>
                        <p  >Big Game</p>
                        
                    </a>
                </li>
                <li className="menu-item">
                    <a onClick={() => NavToSoloPong()}>
                        <img src={folder2} alt="Menu 3"/>
                        <p  >Tiny Game</p>
                    </a>
                </li>
                <li className="menu-item">
                    <a onClick={navigateToProfPage}>
                        <img src={folder1} alt="Menu 3"/>
                        <p >Profile</p>
                    </a>
                </li>
                <li className="menu-item">
                    <a onClick={navigateToSettings}>
                        <img src={folder} alt="Menu 3"/>
                        <p  >Settings</p>
                    </a>
                </li>
                <li className="menu-item">
                    <a onClick={navigateToFriends}>
                        <img src={folder0} alt="Menu 3"/>
                        <p  >Friends</p>
                    </a>
                </li>
            </ul>
        </nav>
	</div>

	<footer>
        <button className="logoutBtn" onClick={() => Logout({user, setUser})}>LOG OUT </button>
			<img src={logo} className="logo" alt="icon" />
    </footer>
	</body>


	</>
  );
};

export default UserSetting;
