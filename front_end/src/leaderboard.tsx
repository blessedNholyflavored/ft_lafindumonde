import React, { useState, useRef, useEffect, useContext } from 'react';
import { useAuth } from './components/auth/AuthProvider';
import { WebsocketContext } from './WebsocketContext';


interface PlayerScore {
    place: number;
    username: string;
    ELO: number;
  }

export const Classement = () => {

  const [playerScores, setPlayerScores] = useState<PlayerScore[]>([]);



    async function fetchPlayerScores() {
        try {
          const response = await fetch(`http://localhost:3000/users/`, {
            method: 'GET',
          });
          if (!response.ok) {
            throw new Error('Erreur lors de la récupération des scores.');
          }
          const data = await response.json();
          return data;
        } catch (error) {
          console.error('Erreur:', error);
          return [];
        }
      }
    
      useEffect(() => {
        async function fetchScores() {
          const scores = await fetchPlayerScores();
          // Tri des scores dans l'ordre décroissant
          scores.sort((a: { ELO: number; }, b: { ELO: number; }) => b.ELO - a.ELO);
          // Attribuer les places aux joueurs
          scores.forEach((score: { place: any; }, index: number) => {
            score.place = index + 1;
          });
          setPlayerScores(scores);
        }
    
        fetchScores();
      }, []);


return(
<div style={{ float: 'right' }}>
<h2>Scores des joueurs :</h2>
<ul>
  {playerScores.map((score) => (
    <li key={score.username}>
      {score.place} - {score.username}: {score.ELO}
    </li>
  ))}
</ul>
</div>
);
}

export default Classement;