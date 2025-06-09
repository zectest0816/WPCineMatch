import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import { Route, Routes } from "react-router-dom";

import { AuthProvider } from "./AuthContext";
import Bookmark from "./Bookmark";
import Favourite from "./FavouriteList";
import Home from "./Home";
import Landing from "./Landing";
import Login from "./Login";
import Profile from "./profile";
import ProtectedRoute from "./ProtectedRoute";
import Search from "./Search";
import Signup from "./Signup";
import "./styles/font.css";
import Trending from "./Trending";
import WatchLater from "./WatchLaterList";
import { AuthProvider } from "./AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import Chatbox from "./components/Chatbox";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <Search />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favourite"
            element={
              <ProtectedRoute>
                <Favourite />
              </ProtectedRoute>
            }
          />
          <Route
            path="/watchlater"
            element={
              <ProtectedRoute>
                <WatchLater />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookmark"
            element={
              <ProtectedRoute>
                <Bookmark />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trending"
            element={
              <ProtectedRoute>
                <Trending />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </>
  );
}

export default App;
