import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import { useParams } from "react-router-dom";
import "../../style/Profile.css";

export const GameHistory = (props: any) => {
  const { user, setUser } = useAuth();
  const [gameData, setGameData] = useState<Game[]>([]);
  const { id } = useParams();

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
    pictureURLP1: string;
    pictureURLP2: string;
  }

  const displayPic = async (userId: number, pos: number) => {
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/users/${userId}/avatar`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (response.ok) {
        const pictureURL = await response.text();
        if (pictureURL.includes("https")) {
          if (pos === 1) return pictureURL;
          if (pos === 2) return pictureURL;
        } else {
          try {
            const response = await fetch(
              `http://${window.location.hostname}:3000/users/uploads/${pictureURL}`,
              {
                method: "GET",
                credentials: "include",
              }
            );
            if (response.ok) {
              const blob = await response.blob();
              const absoluteURL = URL.createObjectURL(blob);
              if (pos === 1) return absoluteURL;
              if (pos === 2) return absoluteURL;
            }
          } catch (error) {
            console.error(error);
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const FetchGames = async () => {
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/users/${id}/games-data`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        const updatedGameData = [...data];
        let i: number = 0;
        while (i < updatedGameData.length) {
          if (updatedGameData[i].superGame === 1) {
            updatedGameData[i].super = "☆";
          }
          try {
            const response = await fetch(
              `http://${window.location.hostname}:3000/users/${updatedGameData[i].userId1}/username`,
              {
                method: "GET",
                credentials: "include",
              }
            );
            const response2 = await fetch(
              `http://${window.location.hostname}:3000/users/${updatedGameData[i].userId2}/username`,
              {
                method: "GET",
                credentials: "include",
              }
            );
            if (response.ok)
              updatedGameData[i].username1 = await response.text();
            if (response2.ok)
              updatedGameData[i].username2 = await response2.text();
          } catch (error) {
            console.log(error);
          }
          updatedGameData[i].pictureURLP1 = await displayPic(
            updatedGameData[i].userId1,
            1
          );
          updatedGameData[i].pictureURLP2 = await displayPic(
            updatedGameData[i].userId2,
            2
          );
          i++;
        }

        setGameData(updatedGameData);
      } else {
        console.log("response pas ok");
      }
    } catch (error) {
      console.error("error de get game data", error);
    }
  };

  return (
    <>
      <div className="gameHistory">
        {gameData.map((game: Game, index: number) => (
          <div className="games" key={index}>
            <p>{game.super}</p>
            <div className="avatar-container">
              <img className="" src={game.pictureURLP1} alt="p1 avatar" />
              <p>{game.username1}</p>
            </div>
            <div className="scores">
              <p>{game.start_at}</p>
              {game.scrP1} - {game.scrP2}
            </div>
            <div className="avatar-container">
              <img className="" src={game.pictureURLP2} alt="p2 avatar" />
              <p>{game.username2}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="footersmallbox">
        <br></br>
      </div>
    </>
  );
};
