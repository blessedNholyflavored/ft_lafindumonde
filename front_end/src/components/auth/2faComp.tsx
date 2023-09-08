import React from 'react';
//import { Alert } from 'react-native';
import "./../../App.css";
import "./../../style/Profile.css";
import "./../../style/Login.css";
//import { useAuth } from "./AuthProvider";
import api from '../../AxiosInstance';
import { useNavigation } from 'react-router-dom';

export async function twoFAEnable(navigate: any) {
	if (window.confirm("Are you ready to save your unique QR code ?")){
		try {
			const res = await api.get('/auth/2FAenable');	
			// console.log(res.data.code);
			return navigate(`/totpSave?qrCodeImg=${encodeURIComponent(res.data.code)}`)
		} catch (error) {
			console.log('Error while 2fa-ing : ', error);
		}
	}
}

export async function twoFADisable(context: any) {
    try {
    	const res = await api.get('/auth/2FAdisable');
		context.setUser(res.data);
    } catch (error) {
        console.log('Error while de-2fa-ing : ', error);
    }
}