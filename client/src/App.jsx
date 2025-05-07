import 'bootstrap/dist/css/bootstrap.min.css';
import Signup from './Signup';
import Login from './Login';
import Home from './Home';
import Favourite from './FavouriteList';
import WatchLater from './WatchLaterList';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Search from "./Search";
import Bookmark from "./Bookmark";
import './styles/font.css';


function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/favourite" element={<Favourite />} />
          <Route path="/watchlater" element={<WatchLater />} />
          <Route path="/bookmark" element={<Bookmark/>} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
    </BrowserRouter>
  );
}

export default App;