import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import { useParams } from "react-router-dom";
import "../../style/Profile.css";
//import { format, parseISO } from "date-fns";

export const GameHistory = (props: any) => {
  const { user, setUser } = useAuth();
  const [gameData, setGameData] = useState<Game[]>([]);
  const { id } = useParams();
  const [imgUrl1, setImgUrl1] = useState<string>("");
  const [imgUrl2, setImgUrl2] = useState<string>("");

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

  const formatDate = (dateString: string) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options as any);
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
        //console.log("ICI", updatedGameData);
        let i: number = 0;
        while (i < updatedGameData.length) {
          let truc = formatDate(updatedGameData[i].start_at);
          console.log("JKJKJKKJKKJ", truc);
          let date: string = updatedGameData[i].start_at.split("T");
          let day: string = date[0].replace(/-/g, "/");
          let hour = date[1].split(".")[0];
          updatedGameData[i].start_at = day + " " + hour;
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
          console.log("sfsdfsf", imgUrl1);
          //updatedGameData[i].pictureURLP1 = imgUrl1;
          //updatedGameData[i].pictureURLP2 = imgUrl2;
          i++;
        }

        setGameData(updatedGameData.reverse());
        //console.log("update", gameData);
        //console.log("update", typeof gameData[0].superGame);
      } else {
        console.log("response pas ok");
      }
    } catch (error) {
      console.error("error de get game data", error);
    }
  };

  return (
    <>
      <div style={{ color: "black" }}>
        {gameData.slice(0, 5).map((game: Game, index: number) => (
          <div className="gameHistory" key={index}>
            <img className="avatar" src={game.pictureURLP1} alt="p1 avatar" />
            <p>{game.username1}</p>
            <div className="scores">
              {game.scrP1} - {game.scrP2}
            </div>
            <img className="avatar" src={game.pictureURLP2} alt="p2 avatar" />
            <p>{game.username2}</p>
            <p>{game.start_at}</p>
          </div>
        ))}

        {/* <table>
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
                <td>{game.pictureURLP1}</td>
                <td>{game.username1}</td>
                <td>{game.scrP1}</td>
                <td>{game.scrP2}</td>
                <td>{game.username2}</td>
                <img src={game.pictureURLP2}></img>
              </tr>
            ))}
          </tbody>
        </table> */}
      </div>
      <div className="footersmallbox">
        <br></br>
      </div>
    </>
  );
};
