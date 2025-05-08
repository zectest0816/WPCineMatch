import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from "react";
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Bookmark from "./Bookmark";
import Favourite from './FavouriteList';
import Home from './Home';
import Landing from './Landing';
import Login from './Login';
import Search from "./Search";
import Profile from "./profile";
import Signup from './Signup';
import './styles/font.css';
import Trending from "./trending";
import WatchLater from './WatchLaterList';

function App() {
  const [count, setCount] = useState(0);
  
  return (
    <BrowserRouter>
       <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/favourite" element={<Favourite />} />
          <Route path="/watchlater" element={<WatchLater />} />
          <Route path="/bookmark" element={<Bookmark/>} />
          <Route path="/trending" element={<Trending />} />
        </Routes>
    </BrowserRouter>
  );
}

export default App;