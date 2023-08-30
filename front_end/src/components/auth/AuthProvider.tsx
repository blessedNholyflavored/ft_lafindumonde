import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios, { AxiosResponse } from "../../AxiosInstance";

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

    if (loading) {
        return (
            <div>Loading...</div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            { children }
        </AuthContext.Provider>
    );
};