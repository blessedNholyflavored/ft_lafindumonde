import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios, { AxiosResponse } from "../../AxiosInstance";
import './Loading.css';
import './../../App.css';
import './../../style/Profile.css';
import { InputTotp } from './InputTotp';

// interface User 
export interface User {
    id: number;
    username: string;
    email: string;
    createdAt: string;
    //hash:string; 
    pictureURL: string;
    enabled2FA: boolean;
    //enlever totpKey
    totpKey: string;
	log2FA: boolean;
}

interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context =  useContext(AuthContext);
    if (!context){
        throw new Error('called to useAuth must be inside an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        axios.get('/auth/me')
            .then((res: AxiosResponse<any, any>) => {
                setUser(res.data);
                setLoading(false);
            })
            .catch((error: any) => {
                console.log('error found in useEffect:', error);
                setLoading(false);
            });
    }, []);
// TODO: faire un joli front pour le loading....
    if (loading) {
        return (
            <div className='loadingPage'>
				<div className="navbarbox navAuth">
    			    <p className="navTitle"> WELCOME, PLAYER </p>
                    <p className="navTitle"> ▷</p>
                </div>
                <div className='loadingBox'>
                    <p> LOADING....</p>
		        </div>
			</div>
        );
    }
	if (user && (user.log2FA === false && user.enabled2FA)){
		return (
			<AuthContext.Provider value={{ user, setUser }}>
				<InputTotp />
        	</AuthContext.Provider>);
	}

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            { children }
        </AuthContext.Provider>
    );
};