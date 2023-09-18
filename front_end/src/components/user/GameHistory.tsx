import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';

export const GameHistory = (props: any) => {
	const { user, setUser } = useAuth();
	const [gameData, setGameData] = useState<Game[]>([]);

	useEffect(() => {
		FetchGames();
	}, []);

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
					let date:string = updatedGameData[i].start_at.split("T");
					let day: string = date[0].replace(/-/g, "/");
					let hour: string = date[1].split(".")[0];
					updatedGameData[i].start_at = day + " " + hour;
					console.log("DAAAAAATE", date);
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
			<div style={{color: 'black'}} >
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
						<td>{game.start_at}</td>
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
		</>
	  )
}
