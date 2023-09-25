import React, { useState, useEffect } from 'react';
import { useAuth } from "./components/auth/AuthProvider";
import { useNavigate } from "react-router-dom";


interface PlayerScore {
    place: number;
    username: string;
    ELO: number;
	id: number;
  }

export const Classement = () => {

  const [playerScores, setPlayerScores] = useState<PlayerScore[]>([]);
  const { user, setUser } = useAuth();
  const userId = user?.id;
  const navigate = useNavigate();


 useEffect(() => {
	fetchPlayerScores();
 }, []);

    async function fetchPlayerScores() {
        try {
          const response = await fetch(`http://localhost:3000/users/leaderboard/${userId}`, {
            method: 'GET',
            credentials: 'include',
          });
          if (!response.ok) {
            throw new Error('Erreur lors de la récupération des scores.');
          }
          const data = await response.json();
		  console.log("DANS LEADERBOARD.TSX", data);
          setPlayerScores(data);
        } catch (error) {
          console.error('Erreur:', error);
          return [];
        }
      }
	  function navToProfil(id: string) {
		navigate(`/users/profile/${id}`);
	  }

return(
	<>
		<h2>Scores des joueurs :</h2>
		<div>
			<table>
			<thead>
				<tr>
				<th>Rank</th>
				<th>Username</th>
				<th>Elo</th>
				</tr>
			</thead>
			<tbody>
				{playerScores.map((tab: PlayerScore, index: number) => (
				<tr key={index}>
					<td>{tab.place}</td>
					<td>{tab.username}</td>
					<td>{tab.ELO}</td>
					<td><button
                      onClick={() => navToProfil(tab.id.toString())}
                    >
					Voir Profile
				  </button></td>
				</tr>
				))}
			</tbody>
			</table>
		</div>
		<div className="footersmallbox">
				<br></br>
		</div>
	</>
);
}

export default Classement;