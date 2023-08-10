import { useAuth } from "./AuthProvider";
import axios from './AxiosInstance';

export function  Profile() {
    const { user, setUser } =useAuth();
  
  
    async function logout() {
      try {
        // on appelle la route qui clear cookie ds le back
        const res = await axios.get('/auth/logout');
        // du coup l'user qu'on avait set bah il faut le unset
        setUser(null);
      } catch (error) {
        console.log('Error: ', error);
      }
    }
    return (
      <div className="Salut">
        <h1>{user!.username}</h1>
        <img src={user!.pictureURL} alt="profile picture" />
        <p>{ JSON.stringify(user) }</p>
        <button onClick={logout}>Log Out</button>
      </div>
    );
  };

  export default Profile;