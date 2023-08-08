import React, { useState, useEffect } from 'react';

export const UserSetting: React.FC = () => {
	const [newUsername, setNewUsername] = useState('');
	const [newPicture, setNewPicture] = useState<File | null>(null);
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
		const userId = 3;

		try {
			const response = await fetch(`http://localhost:3000/users/${userId}/avatar`, {
				method: 'GET',
			});
			if (response.ok) {
				const pictureURL = await response.text();
				setImgUrl(pictureURL);
				console.log(pictureURL);
			}
		}
		catch (error) {
			console.error(error);
		}
	}
	displayPic();
}, [ImgUrl]);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		e.preventDefault();
		const file = e.target.files?.[0];
		if (file) {
			console.log("QQQQQQQQQQQQQQQQQ", file);
			setNewPicture(file);
		}
	};

	const changePic = async () => {
		console.log("DANS CHANGE PIC");
		const userId = 3;
		if (newPicture) {
		  const blob = new Blob([newPicture], { type: newPicture.type });
		  const formData = new FormData();
		  
		  formData.append("userpic", blob, newPicture.name); // Utilisez simplement newPicture.name comme deuxième argument
	  
		  console.log(formData);
	  
		  try {
			const response = await fetch(`http://localhost:3000/users/${userId}/update-avatar`, {
			  method: 'POST',
			  body: formData,
			});
	  
			if (response.ok) {
			  alert('profil picture mise à jour avec succès !');
			} else {
			  alert('ya eu un souci poto');
			}
		  } catch (error) {
			console.error('erreur = ', error);
		  }
		}
	  };
	  
  return (
	<>
		<form onSubmit={handleSubmit}>
			<label>
				Nouveau Nom d'utilisateur:
				<input
					type="text"
					value={newUsername}
					onChange={(e) => setNewUsername(e.target.value)} />
			</label>
			<button type="submit">Mettre à jour</button>
		</form>
		<p>current picture</p>
		<img src={ImgUrl} alt='user profile avatar'></img>
		<div>
			<input type="file" accept="image/*" onChange={handleFileChange} />
			<button onClick={changePic}>Upload</button>
		</div>
	</>
  );
};

export default UserSetting;
