import React, { useState, useEffect } from "react";
import "../../style/Profile.css";
import "../../style/twoFA.css";
import icon from "../../img/buttoncomp.png";
import logo from "../../img/logo42.png";
import { useAuth } from "../auth/AuthProvider";
import { Logout } from "./../auth/Logout";
import { useNavigate } from "react-router-dom";
import api from "../../services/AxiosInstance";
import "../../../src/style/Home.css";
import champi from "../../img/champi.png";
import foldergreen from "../../img/foldergreen.png";
import folderblue from "../../img/folderblue.png";
import folderpink from "../../img/folderpink.png";
import folderyellow from "../../img/folderyellow.png";
import folderwhite from "../../img/folderwhite.png";
import folderviolet from "../../img/folderviolet.png";
import folderred from "../../img/folderred.png";
import nav from "../../img/buttoncomp.png";
import Notify from "../../services/Notify";

export const UserSetting: React.FC = () => {
  const [newUsername, setNewUsername] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newMail, setNewMail] = useState("");
  const [newPicture, setNewPicture] = useState<File | null>(null);
  let [ImgUrl, setImgUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLocal, setIsLocal] = useState<Boolean>(false);
  const [is2FA, set2FA] = useState<Boolean>(false);
  const { user, setUser } = useAuth();
  const [showNotification, setShowNotification] = useState(false);
  const [notifyMSG, setNotifyMSG] = useState<string>("");
  const [notifyType, setNotifyType] = useState<number>(0);
  const [sender, setSender] = useState<number>(0);
  const [changes, setChanges] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    displayPic();
    checkLocal();
    check2FA();
  }, []);

  const check2FA = async () => {
    const userID = user?.id;
    try {
      const res = await fetch(
        `http://${window.location.hostname}:3000/auth/checkIs2FA`,
        { method: "GET", credentials: "include" }
      );
      if (res.ok) {
        set2FA(false);
      }
      if (res.status === 418) {
        set2FA(true);
      }
    } catch (error) {
      throw error;
    }
  };

  const checkLocal = async () => {
    const userId = user?.id;

    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/users/${userId}/isloc`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (response.ok) {
        const data: string = await response.text();
        if (data === "true") {
          setIsLocal(true);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = user?.id;
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/users/update-username`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: newUsername }),
          credentials: "include",
        }
      );
      if (response.ok) {
        setShowNotification(true);
        setNotifyMSG("Username successfully updated !");
        setNotifyType(2);
        // alert("Nom d'utilisateur mis à jour avec succès !");
        //window.location.reload();
      } else {
        setShowNotification(true);
        setNotifyMSG("An error happened while updating username");
        setNotifyType(3);
        // alert(
        //   "Une erreur s'est produite lors de la mise à jour du nom d'utilisateur."
        // );
      }
    } catch (error) {
      //console.error("Erreur:", error);
    }
  };

  const handleSubmitPass = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = user?.id;
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/users/update-pass`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password: newPass }),
          credentials: "include",
        }
      );
      if (response.ok) {
        setShowNotification(true);
        setNotifyMSG("Password successfully updated !");
        setNotifyType(2);
        // alert("Password mis à jour avec succès !");
        //window.location.reload();
      } else {
        setShowNotification(true);
        setNotifyMSG("An error happened while updating password");
        setNotifyType(3);
        // alert("Une erreur s'est produite lors de la mise à jour du password.");
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleSubmitMail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/users/update-mail`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: newMail }),
          credentials: "include",
        }
      );
      if (response.ok) {
        setShowNotification(true);
        setNotifyMSG("Mail successfully updated !");
        setNotifyType(2);
        // alert("mail mis à jour avec succès !");
        //window.location.reload();
      } else {
        setShowNotification(true);
        setNotifyMSG("An error happened while updating email address");
        setNotifyType(3);
        // alert("Une erreur s'est produite lors de la mise à jour du mail.");
      }
    } catch (error) {
      //console.error("Erreur:", error);
    }
  };

  const displayPic = async () => {
    const userId = user?.id;
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
          setImgUrl(pictureURL);
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
              setImgUrl(absoluteURL);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (file) {
      console.log(file.type);
      setNewPicture(file);
    }
  };

  const changePic = async () => {
    if (newPicture) {
      const blob = new Blob([newPicture], { type: newPicture.type });
      const formData = new FormData();

      formData.append("userpic", blob, newPicture.name);

      //console.log(formData);

      try {
        const response = await fetch(
          `http://${window.location.hostname}:3000/users/update-avatar`,
          {
            method: "POST",
            body: formData,
            credentials: "include",
          }
        );
        if (response.ok) {
          const result = await response.json();
          setImgUrl(result.pictureURL);
          alert("profil picture mise à jour avec succès !");
          displayPic();
        } else {
          const backError = await response.json();
          setError(backError.message);
          alert(backError.message);
        }
      } catch (error) {
        if (error instanceof Response) {
          const backError = await error.json();
          setError(backError.message);
          alert(backError.message);
        }
      }
    }
  };

  const randomPic = async () => {
    const id = Math.floor(Math.random() * 151) + 1;
    let newPokeImg;
    try {
      await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`, {
        method: "GET",
      })
        .then((res) => res.json())
        .then((resData) => {
          newPokeImg = resData.sprites.other.home.front_default;
        })
        .catch(() => (newPokeImg = champi.toString()));

      const response = await fetch(
        `http://${window.location.hostname}:3000/users/pokePic`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pictureURL: newPokeImg,
          }),
          credentials: "include",
        }
      );
      
      if (response.ok) {
        setShowNotification(true);
        setNotifyMSG("You successfully changed your avatar!");
        setNotifyType(2);
      } else {
        setShowNotification(true);
        setNotifyMSG("Something went wrong !");
        setNotifyType(3);
      }
      displayPic();
    } catch (err) {}
  };

  const navigateToProfPage = () => {
    navigate(`/users/profile/${user?.id}`);
  };

  const navigateToChat = () => {
    navigate("/chat");
  };

  const navToGamePage = () => {
    navigate("/gamePage");
  };

  const navigateToFriends = () => {
    navigate("/friends");
  };

  const navigateToSettings = () => {
    navigate("/settings");
  };
  const navigateToHome = () => {
    navigate("/");
  };
  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  const twoFADisable = async (context: any) => {
    try {
      const res = await api.get("/auth/2FAdisable");
      context.setUser(res.data);
      if (res.data.log2FA) {
        setShowNotification(true);
        setNotifyMSG(
          "You successfully disabled the two factor authentication!"
        );
        setNotifyType(2);
        set2FA(false);
      } else {
        setShowNotification(true);
        setNotifyMSG(
          "You can't disable something that wasn't enabled, weirdoo !!!"
        );
        setNotifyType(3);
      }
    } catch (error) {}
  };

  const twoFAEnable = async (navigate: any, user: any) => {
    if (user.loginLoc === true) {
      setShowNotification(true);
      setNotifyMSG("You can't enable 2FA with this type of account !");
      setNotifyType(3);
      return;
    }
   
    else {
      setShowNotification(true);
      setNotifyMSG(
        "Are you ready to save the QR code you will be provided in the next page ?"
      );
      setNotifyType(4);
      setSender(sender);
    }
  };

  return (
    <>
      {showNotification && (
        <Notify
          message={notifyMSG}
          type={notifyType}
          senderId={sender}
          onClose={handleCloseNotification}
        />
      )}
      <header>
        <div>
          <img src={nav} alt="Menu 1" />
        </div>
        <h1>TRANSCENDENCE</h1>
      </header>

      <div className="flex-bg">
        <main>
          <div className="fullpage">
            <div className="navbarbox">
              <img src={icon} alt="icon" />
              <h1> SETTINGS </h1>
            </div>
            <div className="threerow">
              <div className="boxrowsettings">
                <div className="navbarsmallbox">
                  {isLocal === false ? (
                    <p className="boxtitle"> CHANGE USERNAME </p>
                  ) : (
                    <p className="boxtitle"> CHANGE INFOS </p>
                  )}
                </div>

                <div className="changesett">
                  <form className="formsettings" onSubmit={handleSubmit}>
                    <label className="labelcss">
                      <input
                        // className="inputcss"
                        type="text"
                        value={newUsername}
                        minLength={3}
                        maxLength={10}
                        required={true}
                        placeholder="type new username"
                        onChange={(e) => setNewUsername(e.target.value)}
                      />
                    </label>
                    <button className="buttonsettings" type="submit">
                      update
                    </button>
                  </form>

                  {isLocal === true && (
                    <>
                      <form
                        className="formsettings"
                        onSubmit={handleSubmitPass}
                      >
                        <label className="labelcss">
                          <input
                            // className="inputcss"
                            type="password"
                            value={newPass}
                            minLength={8}
                            required={true}
                            placeholder="type new password"
                            onChange={(e) => setNewPass(e.target.value)}
                          />
                        </label>
                        <button className="buttonsettings" type="submit">
                          update
                        </button>
                      </form>
                      <div>
                        <form
                          className="formsettings"
                          onSubmit={handleSubmitMail}
                        >
                          <label className="labelcss">
                            <input
                              // className="inputcss"
                              type="email"
                              value={newMail}
                              placeholder="type new mail"
                              required={true}
                              onChange={(e) => setNewMail(e.target.value)}
                            />
                          </label>
                          <button className="buttonsettings" type="submit">
                            update
                          </button>
                        </form>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="boxrowsettings">
                <div className="navbarsmallbox">
                  <p className="boxtitle"> CHANGE AVATAR </p>
                </div>
                <div className="changesett">
                  <img src={ImgUrl} alt="user avatar"></img>
                  <div className="avatardiv">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <button className="buttonsettings" onClick={changePic}>
                      Upload
                    </button>
                  </div>
                  <div>
                    <button
                      className="buttonsettings"
                      onClick={() => {
                        randomPic();
                        setShowNotification(true);
                        setNotifyMSG("You successfully changed your avatar!");
                        setNotifyType(2);
                        setChanges(changes + 1);
                        setTimeout(() => {
                          displayPic();
                        }, 300);
                      }}
                      disabled={changes === 1}
                    >
                      Generate new avatar
                    </button>
                  </div>
                </div>
              </div>

              {/* troisieme */}
              <div className="boxrowsettings">
                <div className="navbarsmallbox">
                  <p className="boxtitle"> 2FAC AUTH </p>
                </div>
                <div className="changesett">
                  <div className="twoFA">
                    {is2FA != true && (
                      <button
                        className="acceptbutton"
                        onClick={() => twoFAEnable(navigate, user)}
                      >
                        enable
                      </button>
                    )}
                    <button
                      className="deletebutton"
                      onClick={() => twoFADisable({ user, setUser })}
                    >
                      disable
                    </button>
                  </div>
                </div>
                <div className="footersmallbox">
                  <br></br>
                </div>
              </div>
            </div>
          </div>
        </main>

        <nav>
          <ul>
            <li className="menu-item">
              <a onClick={navigateToHome}>
                <img src={folderviolet} alt="Menu 3" />
                <p>Home</p>
              </a>
            </li>
            <li className="menu-item">
              <a onClick={() => navToGamePage()}>
                <img src={folderblue} alt="Menu 3" />
                <p>Game</p>
              </a>
            </li>
            <li className="menu-item">
              <a onClick={navigateToProfPage}>
                <img src={folderpink} alt="Menu 3" />
                <p>Profile</p>
              </a>
            </li>
            <li className="menu-item">
              <a onClick={navigateToSettings}>
                <img src={foldergreen} alt="Menu 3" />
                <p>Settings</p>
              </a>
            </li>
            <li className="menu-item">
              <a onClick={navigateToFriends}>
                <img src={folderwhite} alt="Menu 3" />
                <p>Friends</p>
              </a>
            </li>
            <li className="menu-item">
              <a onClick={navigateToChat}>
                <img src={folderred} alt="Menu 3" />
                <p>Chat</p>
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <footer className="footersettings">
        <button className="logoutBtn" onClick={() => Logout({ user, setUser })}>
          LOG OUT{" "}
        </button>
        <img src={logo} className="logo" alt="icon" />
      </footer>
    </>
  );
};

export default UserSetting;
