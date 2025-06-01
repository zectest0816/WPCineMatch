import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Bookmark from "./Bookmark";
import Favourite from "./FavouriteList";
import Home from "./Home";
import Landing from "./Landing";
import Login from "./Login";
import Search from "./Search";
import Profile from "./profile";
import Signup from "./Signup";
import "./styles/font.css";
import Trending from "./trending";
import WatchLater from "./WatchLaterList";
import { AuthProvider } from "./AuthContext";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  const [count, setCount] = useState(0);

  return (
    <AuthProvider>
      <BrowserRouter>
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
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
