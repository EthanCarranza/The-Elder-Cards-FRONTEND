import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Landing from "./Components/Landing";
import Register from "./Components/Register";
import Login from "./Components/Login";
import Cards from "./Components/Cards";
import CardDetail from "./Components/CardDetail";
import { AuthProvider } from "./contexts/AuthContext";
import { MessageNotificationsProvider } from "./contexts/MessageNotificationsContext";
import { FriendshipNotificationsProvider } from "./contexts/FriendshipNotificationsContext";
import { FriendshipToastProvider } from "./contexts/FriendshipToastContext";
import Factions from "./Components/Factions";
import FactionDetail from "./Components/FactionDetail";
import Bestiary from "./Components/Bestiary";
import Profile from "./Components/Profile";
import Collections from "./Components/Collections";
import CollectionDetail from "./Components/CollectionDetail";
import UserPublicProfile from "./Components/UserPublicProfile";
import Friends from "./Components/Friends";
import Messages from "./Components/Messages";
import FriendshipToastContainer from "./Components/FriendshipToastContainer";
import SocketNotificationListener from "./Components/SocketNotificationListener";
import Rules from "./Components/Rules";
import Terms from "./Components/Terms";
function App() {
  return (
    <AuthProvider>
      <MessageNotificationsProvider>
        <FriendshipNotificationsProvider>
          <FriendshipToastProvider>
            <SocketNotificationListener>
              <Router>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/rules" element={<Rules />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/cards" element={<Cards />} />
                  <Route path="/cards/:id" element={<CardDetail />} />
                  <Route path="/collections" element={<Collections />} />
                  <Route
                    path="/collections/:id"
                    element={<CollectionDetail />}
                  />
                  <Route path="/factions" element={<Factions />} />
                  <Route path="/factions/:id" element={<FactionDetail />} />
                  <Route path="/bestiary" element={<Bestiary />} />
                  <Route path="/friends" element={<Friends />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/messages/:userId" element={<Messages />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route
                    path="/profile/:userId"
                    element={<UserPublicProfile />}
                  />
                  <Route
                    path="/users/:userId"
                    element={<UserPublicProfile />}
                  />
                </Routes>
                <FriendshipToastContainer />
              </Router>
            </SocketNotificationListener>
          </FriendshipToastProvider>
        </FriendshipNotificationsProvider>
      </MessageNotificationsProvider>
    </AuthProvider>
  );
}
export default App;
