import React from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Home from "./Home";
import PongGame from "./game/PongGame";
import { UserSetting } from "./components/user/UserSetting";
import "./App.css";
import "./style/Profile.css";
import "./style/twoFA.css";
import { Login } from "./components/auth/Login";
import { LocalLogin } from "./components/auth/LocalLogin";
import { Register } from "./components/auth/Register";
import { Chat } from "./components/chat/Chat";
import { Logout } from "./components/auth/Logout";
import { SaveTotp } from "./components/auth/SaveTotp";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { AuthProvider, useAuth } from "./components/auth/AuthProvider";
import { socket, WebsocketProvider } from "./services/WebsocketContext";
import SuperPong from "./game/SuperPong";
import { Profile } from "./components/user/Profile";
import { FriendsPage } from "./components/friends/friendsPage";
import MiniGame from "./game/SoloPong";
import Classement from "./game/leaderboard";
import AcceptMatch from "./game/acceptMatch";
import GameFriend from "./game/GameFriend";
import GamePage from "./game/gamePage";
import PageNotFound from "./PageNotFound";

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <WebsocketProvider value={socket}>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home socket={socket} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/game/:id"
            element={
              <ProtectedRoute>
                <PongGame />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <UserSetting />
              </ProtectedRoute>
            }
          />
          <Route
            path="/totpSave"
            element={
              <ProtectedRoute>
                <SaveTotp />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/local_login" element={<LocalLogin />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/auth"
            element={
              <ProtectedRoute>
                <AuthTest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/profile/:id"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/priv/:recipient"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/chan/:id"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/friends"
            element={
              <ProtectedRoute>
                <FriendsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/SuperGame/:id"
            element={
              <ProtectedRoute>
                <SuperPong socket={socket} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/solopong"
            element={
              <ProtectedRoute>
                <MiniGame />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <Classement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/acceptMatch/:id"
            element={
              <ProtectedRoute>
                <AcceptMatch />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gameFriend/:id"
            element={
              <ProtectedRoute>
                <GameFriend />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gamePage"
            element={
              <ProtectedRoute>
                <GamePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/404"
            element={
              <ProtectedRoute>
                <PageNotFound />
              </ProtectedRoute>
            }
          />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Navigate to="/404" />
              </ProtectedRoute>
            }
          />
        </Routes>
      </WebsocketProvider>
    </AuthProvider>
  );
};

//TODO: remove this before prod------------------------------------------------
function AuthTest() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const navigateToHome = () => {
    navigate("/");
  };

  return (
    <div className="Salut">
      <h1>{user!.username}</h1>
      <img src={user!.pictureURL} alt="profile pic" />
      <p>{JSON.stringify(user)}</p>
      <button onClick={() => Logout({ user, setUser })}>LOG OUT </button>
      <button onClick={navigateToHome}>HOME</button>
    </div>
  );
}

export default App;
