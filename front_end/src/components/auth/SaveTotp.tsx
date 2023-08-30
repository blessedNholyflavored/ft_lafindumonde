import React, { useState } from 'react';
import './../../App.css';
import './Login.css';
// temporaire le tps d'avoir un vrai qr generator
//import qrCode from '../../img/qrCode.png';
import icon from "../../img/buttoncomp.png";
import { useAuth } from './AuthProvider';
import { Navigate, useLocation } from 'react-router-dom';
import api from '../../AxiosInstance';
//import queryString from 'query-string';

export const SaveTotp: React.FC = () => {
    const { user } = useAuth();
    const [receivedCode, setReceivedCode ] = useState('');
    const location = useLocation();

    console.log("ALLLOALLOO");
    const searchParams = new URLSearchParams(location.search);
    const qrCodeImg = searchParams.get('qrCodeImg');
  //  const qrCodeImg = location.state?.qrCodeImg;

    const totpSubmit = async(e: React.FormEvent) => {
        e.preventDefault();
        if (user) {
            try{
                const response = await api.post('/auth/submitCode', {
                    userInput: receivedCode,
                    userID: user.id,
                });

                if (response.status === 200){
                    console.log('it went well !');
                }
                else {
                    console.error("HnmmmmH,mmmm:", response.data);
                }
            } catch (error) {
                console.error('Error: ', error);
            }
        }
    }

    if (user){
        return (
            <div className="Login">
                <div className="boxAuth">
                    <div className="navbarbox navAuth">
			            <img src={icon} className="buttonnav" alt="icon" />
    			        <p className="navTitle"> 2FA AUTH </p>
                        <p className="navTitle"> ▷</p>
                    </div>
                    <div className='boxAuthContent'>
                        <p>You can use this QR in your favorite TOTP authenticator.</p>
                        {qrCodeImg && <img src={qrCodeImg} alt="qr code" />}
                        <p>Now you can use the input box below to confirm your identity with the code you received :</p>
                        <form className='totpSubmit' onSubmit={totpSubmit}>
                            <label className='totpLabel'>
                                <input
                                    className='totpInput'
                                    type='text'
                                    value={receivedCode}
                                    placeholder='0 0 0 0' 
                                    onChange={(e) => setReceivedCode(e.target.value)}
                                />
                            </label>
                            <button className='totpBtn' type='submit'>Submit</button>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
    return <Navigate to="/" />
}