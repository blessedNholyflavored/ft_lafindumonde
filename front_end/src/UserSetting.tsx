import React, { useState } from 'react';

export const UserSetting: React.FC = () => {
  const [newUsername, setNewUsername] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const userId = 2; // Remplacez 1 par l'ID de l'utilisateur que vous souhaitez mettre à jour

    try {
      const response = await fetch(`http://localhost:3000/users/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: newUsername }), // Utilisez { newUsername } ici pour créer un objet avec la clé "newUsername"
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

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Nouveau Nom d'utilisateur:
        <input
          type="text"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
        />
      </label>
      <button type="submit">Mettre à jour</button>
    </form>
  );
};

export default UserSetting;
