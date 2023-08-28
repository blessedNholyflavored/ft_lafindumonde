import React from 'react';
import "./../../App.css";
import "./../../style/Profile.css";
import "./Login.css";
import { useAuth } from "./AuthProvider";
import api from '../../AxiosInstance';

//const { user, setUser } = useAuth();

   export async function twoFAEnable() {
        try {
            //mettre ici bonne route finale 
            const res = await api.get('/auth/2FAenable');
        } catch (error) {
            console.log('Error while 2fa-ing : ', error);
        }
    }

    export async function twoFADisable() {
        try {
            const res = await api.get('/auth/2FAdisable');
        } catch (error) {
            console.log('Error while de-2fa-ing : ', error);
        }
    }