import React from 'react';
import "./../../App.css";
import "./../../style/Profile.css";
import "./Login.css";
//import { useAuth } from "./AuthProvider";
import api from '../../AxiosInstance';
import { useNavigation } from 'react-router-dom';

//const { user, setUser } = useAuth();

//    export async function twoFAEnable() {
//         try {
//             //mettre ici bonne route finale 
//             const res = await api.get('/auth/2FAenable');
//             console.log(res.data.code);
//             return redirect("/totpSave?qrCodeImg=${encodeURIComponent(res.data.code)}")
//         } catch (error) {
//             console.log('Error while 2fa-ing : ', error);
//         }
//     }
	export async function twoFAEnable(navigate: any) {
		try {
			//mettre ici bonne route finale 
			const res = await api.get('/auth/2FAenable');
			console.log(res.data.code);
			return navigate(`/totpSave?qrCodeImg=${encodeURIComponent(res.data.code)}`)
		} catch (error) {
			console.log('Error while 2fa-ing : ', error);
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