import React, { useContext, useEffect, useState } from "react";
import '../../style/Profile.css'
import ProfileBox from "./ProfileBox"
import icon from "../../img/buttoncomp.png"
import logo from "../../img/logo42.png"
import domo from "../../img/domo.png"
import ScoreList from "./ScoreList";
import Friends from "./FriendsList";
import Notify from '../../Notify';
import { WebsocketContext } from "../../WebsocketContext";

const Box = (props: any) => {

    const [info, setInfo] = useState<any>(null);
    const [notifyMSG, setNotifyMSG] = useState<string>('');
    const [notifyType, setNotifyType] = useState<number>(0);
    const [sender, setSender] = useState<number>(0);
    const socket = useContext(WebsocketContext);
    const [showNotification, setShowNotification] = useState(false);


    useEffect(() => {
        if (props.type === 'info') {
            setInfo(<ProfileBox type={props.type}/>)
        } else if  (props.type === 'friends') {
             setInfo(<Friends type={props.type}/>)
        } else if (props.type === 'score')
            setInfo(<ScoreList type={props.type}/>)
    
}, [props.type])


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
      {showNotification && (
        <Notify message={notifyMSG} type={notifyType} senderId={sender} onClose={handleCloseNotification} />
      )}
    <div className="mainpage">
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
            <img src={domo} className="profilepic" alt="profilepic" />
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
                    <p className="boxtitle"> Friends </p>
                </div>
                    <Friends type="info"/>
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