import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, User } from './../auth/AuthProvider';

//WIP c'est pas encpre appeler parce que j'ai pas encore prep le controller

export const ProtectedChan = ({ children }: {children:any}) => {
  const { user }: { user: User | null } = useAuth();
    console.log('CHILDREN ?', children);
  if (!user) {
    return <Navigate to="/login" />;
  }
  console.log("LE USER EST : ", user);

  try {
    const response = fetch(`http://localhost:3000/chat/recupYourRooms/${user?.id}`, {
      method: 'GET',
      credentials: 'include',
    })
    console.log('response is : ', response);

  } catch (e){
    console.error(e);
  }
  return children ;
};

export default ProtectedChan;