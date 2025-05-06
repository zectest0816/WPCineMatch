import 'bootstrap/dist/css/bootstrap.min.css';
import Signup from './Signup';
import Login from './Login';
import Home from './Home';
import Favourite from './FavouriteList';
import WatchLater from './WatchLaterList';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/register" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/favourite" element={<Favourite />} />
          <Route path="/watchlater" element={<WatchLater />} />
        </Routes>
    </BrowserRouter>
  );
}

export default App;
