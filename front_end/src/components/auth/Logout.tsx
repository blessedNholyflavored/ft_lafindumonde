import api from './../../AxiosInstance';
import './../../App.css';
import './../../style/Logout.css';

export async function Logout(context: any){
	try{
		const res = await api.get('/auth/logout');
		context.setUser(null);
	} catch (error) {
		console.error('Error : ', error);
	}
}