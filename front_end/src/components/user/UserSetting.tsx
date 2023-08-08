import React, { useState, useEffect } from 'react';
import '../../style/Profile.css'
import icon from "../../img/buttoncomp.png"
import logo from "../../img/logo42.png"

export const UserSetting: React.FC = () => {
	const [newUsername, setNewUsername] = useState('');
	const [newPicture, setNewPicture] = useState(String);
	let [ImgUrl, setImgUrl] = useState<string>('');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const userId = 3; // Remplacez 1 par l'ID de l'utilisateur que vous souhaitez mettre à jour

		try {
			const response = await fetch(`http://localhost:3000/users/${userId}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ username: newUsername }),
			});

			if (response.ok) {
				alert('Nom d\'utilisateur mis à jour avec succès !');
				setNewUsername('');
			} else {
				alert('Une erreur s\'est produite lors de la mise à jour du nom d\'utilisateur.');
			}
		} catch (error) {
			console.error('Erreur:', error);
		}
	};

	useEffect(() => {

	const displayPic = async() => {
		const userId = 1;

		try {
			const response = await fetch(`http://localhost:3000/users/${userId}/avatar`, {
				method: 'GET',
			});
			if (response.ok) {
				const pictureURL = await response.text();
				setImgUrl(pictureURL);
				console.log(ImgUrl);
			}
		}
		catch (error) {
			console.error(error);
		}
	}
	displayPic();
}, [ImgUrl]);

	// const changePic = async(e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
	// 	e.preventDefault();

	// 	const userId = 3;
	// 	const formData = new FormData();

	// 	try {
	// 		const response = await fetch(`http://localhost:3000.users/${userId}`, {
	// 			method: 'POST',
	// 			body: formData,
	// 		});

	// 		if (response.ok) {
	// 			alert('profil picture mise à jour avec succès !');
	// 			setNewPicture('');
	// 		} else {
	// 			alert('ya eu un souci poto');
	// 		}
	// 	}
	// 	catch (error) {
	// 		console.error('erreur = ', error);
	// 	}
	// };

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

		<p>current picture</p>
		<img src={ImgUrl} ></img>

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
