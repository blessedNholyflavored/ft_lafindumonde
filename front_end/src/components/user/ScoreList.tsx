/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import star from "../../img/iconscore.png";
import "@fontsource/ibm-plex-mono";

const ScoreList = (props: any) => {
  const [level, setLevel] = useState<number>();
  const [gameplayed, setGamePlayed] = useState<number>();
  const [achievement, setAchievement] = useState<string>("No Achievement");
  const [achievementgame, setAchievementGame] = useState<string>("No Achievement");

  const { id } = useParams();

  useEffect(() => {
    fetchScorelist();
  }, [id]);

  const fetchScorelist = async () => {
    try {
      const response = await fetch(`http://localhost:3000/users/${id}`, {
        method: "GET",
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.level !== undefined) {
          setLevel(data.level);
          setAchievement(getAchievementByLevel(data.level)); 
        } if (data.gameplayed !== undefined) { // pas fan du else if retiré
          // console.log("vrai nb", data.gameplayed);
          // console.log("lol");
          setGamePlayed(data.gameplayed);
          setAchievementGame(getAchievementByGames(data.gameplayed));
          // console.log("assignation", gameplayed);
        } else {
          console.log("error : wrong data scorelist");
        }
      }
    } catch (error) {
      console.error('Error fetching usernames:', error);
    }
  };

  const achievements = [
    { name: "Achievement de vieux noob", level: 1 },
    { name: "Achievement de cool noob", level: 2 },
    { name: "Achievement de vieux rookie", level: 3 },
    { name: "Achievement de rookie prems", level: 4 },
    { name: "Achievement de pro bg", level: 5 },
  ];

  const nbgames = [
    { name: "Congrats on your first game!", gameplayed: 1 },
    { name: "good job on your first games!", gameplayed: 2 },
    { name: "Tu kiffes le jeu ou quoi?", gameplayed: 10 },
    { name: "Ah ouais ca tryhard?", gameplayed: 20 },
    { name: "Attends mais c'est toi qui a codé ce truc?", gameplayed: 50 },
    { name: "Top Challenger", gameplayed: 100 },
  ];

  const getAchievementByLevel = (level: number) => {
    const achievement = achievements.reduce((acc, curr) => {
      if (level >= curr.level) {
        return curr;
      }
      return acc;
    }, { name: "No Achievement", level: 0 });

    return achievement.name;
  };


  const getAchievementByGames = (gameplayed: number) => {
    const achievementgame = nbgames.reduce((acc, curr) => {
      if (gameplayed >= curr.gameplayed) {
        return curr;
      }
      return acc;
    }, { name: "No Achievement", gameplayed: 0 });

    return achievementgame.name;
  };

  return (
    <div className="scorelist">
<div className="lvlscore">
  <div className="imgstar">
<img src={star} className="star" alt="icon"></img></div>
<div className="textscore">
  {achievement} <p className="under">congrats on level {level}!</p></div></div>
<div className="lvlscore"> 
<div className="imgstar">
<img src={star} className="star" alt="icon"></img></div>
<div className="textscore">
{achievement} <p className="under">congrats on level {level}!</p></div> </div>
<div className="lvlscore"> 
<div className="imgstar">
<img src={star} className="star" alt="icon"></img></div>
<div className="textscore">
{achievementgame}
<p className="under">You've played {gameplayed} games!</p></div></div>
</div>
  );
};

export default ScoreList;

