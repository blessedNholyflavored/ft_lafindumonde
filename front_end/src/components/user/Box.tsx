import React, { useContext, useEffect, useState } from "react";
import '../../style/Profile.css'
import ProfileBox from "./ProfileBox"
import icon from "../../img/buttoncomp.png"
import logo from "../../img/logo42.png"
import domo from "../../img/domo.png"
import ScoreList from "./ScoreList";
import Friends from "./FriendsList";
import { useAuth } from "../auth/AuthProvider";
import Notify from '../../Notify';
import { WebsocketContext } from "../../WebsocketContext";
import { GameHistory } from "./GameHistory";

const Box = (props: any) => {

    const [info, setInfo] = useState<any>(null);
	let [ImgUrl, setImgUrl] = useState<string>('');
	const { user, setUser } = useAuth();
    const [notifyMSG, setNotifyMSG] = useState<string>('');
    const [notifyType, setNotifyType] = useState<number>(0);
    const [sender, setSender] = useState<number>(0);
    const socket = useContext(WebsocketContext);
    const [showNotification, setShowNotification] = useState(false);


    useEffect(() => {
		displayPic();
        if (props.type === 'info') {
            setInfo(<ProfileBox type={props.type}/>)
        } else if  (props.type === 'friends') {
             setInfo(<Friends type={props.type}/>)
        } else if (props.type === 'score')
            setInfo(<ScoreList type={props.type}/>)
    
}, [props.type])

const displayPic = async() => {

    const userId = user?.id;
    try {
        const response = await fetch(`http://localhost:3001/users/${userId}/avatar`, {
            method: 'GET',
        });
        if (response.ok) {
            const pictureURL = await response.text();
            //console.log("aaaaaaA",pictureURL);
            if (pictureURL.includes("https"))
            {
                setImgUrl(pictureURL);
            }
            else {
                try {
                const response = await fetch(`http://localhost:3001/users/uploads/${pictureURL}`, {
                    method: 'GET',
                });
                if (response.ok) {
                    const blob = await response.blob();
                    const absoluteURL = URL.createObjectURL(blob);
                    setImgUrl(absoluteURL);
                }
                }
                catch (error) {
                    console.error(error);
                }
            }
        }
    }
    catch (error) {
        console.error(error);
    }
}

const handleCloseNotification = () => {
    setShowNotification(false);
  };
  
  if (socket)
{
socket.on("receiveInvite", (sender: number) => {
setShowNotification(true);
setNotifyMSG("Tu as recu une invitation pour une partie")
setNotifyType(1);
setSender(sender);
})
}

if (socket)
{
  socket.on("friendShipNotif", () => {
    setShowNotification(true);
    setNotifyMSG("Tu as recu une demande d'ami")
    setNotifyType(0);
  })
}

return (
<div>
    <div className="mainpage">
      {showNotification && (
        <Notify message={notifyMSG} type={notifyType} senderId={sender} onClose={handleCloseNotification} />
      )}
        <div className="navbarmainpage">
        <img src={icon} className="buttonnav" alt="icon" />
           <p className="titlemainpage"> TRANSCENDENCE </p>
        </div>
        <div className="Insidemain">
        <div className="navbarbox">
        <img src={icon} className="buttonnav" alt="icon" />
           <p className="titlebox"> PROFIL </p>
        </div>

        <div className="threerow">
            <div className="color">
            <img src={ImgUrl} alt='user avatar'></img>
            </div>
            <div className="boxrow">
                <div className="navbarsmallbox">
                    <p className="boxtitle"> INFO </p>
                </div>
                    <ProfileBox type="info"/>
                <div className="footersmallbox">
                    <br></br>
                </div>
            </div>
            <div className="boxrow">
                <div className="navbarsmallbox">
                    <p className="boxtitle"> Game History </p>
                </div>
                    <GameHistory type="info"/>
                    <div className="footersmallbox">
                    <br></br>
                </div>
            </div>
            <div className="boxrow">
                <div className="navbarsmallbox">
                    <p className="boxtitle"> SCORE </p>
                </div>
                    <ScoreList type="score"/>
                    <div className="footersmallbox">
                    <br></br>
                </div>
            </div>
        </div>
        </div>
        <div className="footerprofil">
            {/* <br></br> */}
            <img src={logo} className="logo" alt="icon" />

            {/* <img src={footer} className="footer" alt="icon" /> */}
        </div>
        {/* // <Friendslist type="friends"/> */}
        {/* // <Scorelist type ="scorelist"/> */}
    
    </div>
    </div>
)
}

export default Box;