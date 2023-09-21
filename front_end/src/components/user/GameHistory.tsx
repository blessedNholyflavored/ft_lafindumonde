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
		superGame: number;
		super: string;
	  }

	  const FetchGames = async () => {

		const userId = user?.id;
		try {
			const response = await fetch(`http://localhost:3001/users/${userId}/games-data`, {
				method: "GET",
				credentials: 'include',
			});
			if (response.ok)
			{
				const data = await response.json();
				const updatedGameData = [...data];
				console.log("ICI", updatedGameData);
				let i: number = 0;
				while (i < updatedGameData.length)
				{
					let date:string = updatedGameData[i].start_at.split("T");
					let day: string = date[0].replace(/-/g, "/");
					let hour = date[1].split(".")[0];
					updatedGameData[i].start_at = day + " " + hour;
					if (updatedGameData[i].superGame === 1)
					{
						updatedGameData[i].super = "☆";
					}
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
				//console.log("update", gameData);
				//console.log("update", typeof gameData[0].superGame);
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
					<th></th>
					<th>date</th>
					<th>Player1</th>
					<th></th>
					<th></th>
					<th>Player2</th>
					</tr>
				</thead>
				<tbody>
					{gameData.slice(0, 5).map((game: Game, index: number) => (
					<tr key={index}>
						<td>{game.super}</td>
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
