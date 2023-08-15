import React, { useState, useEffect } from 'react';
import '../../style/Profile.css'
import icon from "../../img/buttoncomp.png"
import logo from "../../img/logo42.png"
//import { useParams } from 'react-router-dom';

export const UserSetting: React.FC = () => {
	const [newUsername, setNewUsername] = useState('');
	const [newPicture, setNewPicture] = useState<File | null>(null);
	let [ImgUrl, setImgUrl] = useState<string>('');
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		displayPic2();
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const userId = 1;
		try {
			const response = await fetch(`http://localhost:3000/users/${userId}/update-username`, {
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

	const displayPic2 = async() => {
		const userId = 1;

		try {
			const response = await fetch(`http://localhost:3000/users/${userId}/avatar`, {
				method: 'GET',
			});
			if (response.ok) {
				const pictureURL = await response.text();
				//console.log("aaaaaaA",pictureURL);
				try {
					const response = await fetch(`http://localhost:3000/users/uploads/${pictureURL}`, {
						method: 'GET',
					});
					if (response.ok) {
						// const backPath = 'http://localhost:3000/users';
						// const absoluteURL = `${backPath}/${pictureURL}`
						//setImgUrl(pictureURL);
						const blob = await response.blob();
						const absoluteURL = URL.createObjectURL(blob);
						setImgUrl(absoluteURL);
						//console.log("FOFOFOFOFOFOFOF", absoluteURL);
						//setImgUrl(URL.createObjectURL(blob));
						//console.log("dans front", pictureURL);
					}
				}
				catch (error) {
					//console.error(error);
				}
			//	const pictureURL = await response.text();
				// const backPath = 'http://localhost:3000/users';
				// const absoluteURL = `${backPath}/${pictureURL}`
				//setImgUrl(pictureURL);
				//const blob = await response.blob();
				//console.log("FOFOFOFOFOFOFOF", blob);
				//setImgUrl(URL.createObjectURL(blob));
				//const absoluteURL = URL.createObjectURL(blob);
				//setImgUrl(absoluteURL);
				//console.log("dans front", pictureURL);
			}
		}
		catch (error) {
			console.error(error);
		}
	}

// 	useEffect(() => {

// 	const displayPic = async() => {
// 		const userId = 1;

// 		try {
// 			const response = await fetch(`http://localhost:3000/users/${userId}/avatar`, {
// 				method: 'GET',
// 			});
// 			if (response.ok) {
// 				const pictureURL = await response.text();
// 				console.log("aaaaaaA",pictureURL);
// 				try {
// 					const response = await fetch(`http://localhost:3000/users/uploads/${pictureURL}`, {
// 						method: 'GET',
// 					});
// 					if (response.ok) {

// 						// const backPath = 'http://localhost:3000/users';
// 						// const absoluteURL = `${backPath}/${pictureURL}`
// 						//setImgUrl(pictureURL);
// 						const blob = await response.blob();
// 						const absoluteURL = URL.createObjectURL(blob);
// 						setImgUrl(absoluteURL);
// 						console.log("FOFOFOFOFOFOFOF", absoluteURL);
// 						//setImgUrl(URL.createObjectURL(blob));
// 						//console.log("dans front", pictureURL);
// 					}
// 				}
// 				catch (error) {
// 					console.error(error);
// 				}
// 			//	const pictureURL = await response.text();
// 				// const backPath = 'http://localhost:3000/users';
// 				// const absoluteURL = `${backPath}/${pictureURL}`
// 				//setImgUrl(pictureURL);
// 				//const blob = await response.blob();
// 				//console.log("FOFOFOFOFOFOFOF", blob);
// 				//setImgUrl(URL.createObjectURL(blob));
// 				//const absoluteURL = URL.createObjectURL(blob);
// 				//setImgUrl(absoluteURL);
// 				//console.log("dans front", pictureURL);
// 			}
// 		}
// 		catch (error) {
// 			console.error(error);
// 		}
// 	}
// 	displayPic();
// }, []);

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
		const userId = 1;
		if (newPicture) {
		  const blob = new Blob([newPicture], { type: newPicture.type });
		  const formData = new FormData();
		  
		  formData.append("userpic", blob, newPicture.name);
	  
		  console.log(formData);
	  
		  try {
			const response = await fetch(`http://localhost:3000/users/${userId}/update-avatar`, {
			  method: 'POST',
			  body: formData,
			});
			if (response.ok) {
				const result = await response.json();
				setImgUrl(result.pictureURL);
				//setImgUrl(URL.createObjectURL(blob));
				console.log("DDDDDDDDDDDDDDDDDDDDDD", result.pictureURL);
				alert('profil picture mise à jour avec succès !');
				displayPic2();
				
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
			<p className="boxtitle"> CHANGE USERNAME </p>
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
			<p className="boxtitle"> CHANGE IMAGE </p>
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
	<div className="boxrowsettings">
		<div className="navbarsmallbox">
			<p className="boxtitle"> 2FAC AUTH </p>
		</div>
		<div className="footersmallbox">
			<br></br>
		</div>
	</div>

	</div>

	</div>
	<div className="footerprofilsettings">
		{/* <br></br> */}
		<img src={logo} className="logo" alt="icon" />
	</div>
	</div>
	</>
  );
};

export default UserSetting;
