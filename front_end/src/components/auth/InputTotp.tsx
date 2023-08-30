import React, { useState } from 'react';
import './../../App.css';
import './Login.css';
// temporaire le tps d'avoir un vrai qr generator
import qrCode from '../../img/qrCode.png';
import icon from "../../img/buttoncomp.png";
import { useAuth } from './AuthProvider';
import { Navigate } from 'react-router-dom';

export const InputTotp: React.FC = () => {
    const { user } = useAuth();
    const [receivedCode, setReceivedCode ] = useState('');

    const totpSubmit = async(e: React.FormEvent) => {
        e.preventDefault();
        if (user) {
            try{
                await fetch(`http://localhost:3000/auth/submitCode`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({userImput: receivedCode, userID: user.id})
                });
            } catch (error) {
                console.error('Error: ', error);
            }
        }
    }

    if (user && user.enabled2FA){
        return (
            <div className="Login">
                <div className="boxAuth">
                    <div className="navbarbox navAuth">
			            <img src={icon} className="buttonnav" alt="icon" />
    			        <p className="navTitle"> 2FA AUTH </p>
                        <p className="navTitle"> ▷</p>
                    </div>
                    <div className='boxAuthContent'>
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