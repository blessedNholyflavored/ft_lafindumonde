//import { Alert } from 'react-native';
import "./../../App.css";
import "./../../style/Profile.css";
import "./../../style/Login.css";
//import { useAuth } from "./AuthProvider";
import api from '../../AxiosInstance';

export async function twoFAEnable(navigate: any, user: any) {
	if (user.loginLoc === true)
		return (window.alert("Sorry :(( You can't enable 2FA with this type of account !"));
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
		console.log("res.data ?", res.data.log2FA);
		if (res.data.log2FA)
			window.alert("You correctly disabled the two factor authentication ! Welcome to a new unsecured world !!!!");
		else
			window.alert("You can't disable something that wasn't enabled, weirdo !!!")
    } catch (error) {
        console.log('Error while de-2fa-ing : ', error);
    }
}
