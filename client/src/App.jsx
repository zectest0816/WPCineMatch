import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Home from "./Home";
import Landing from "./Landing"; //
import Login from "./Login";
import Search from "./Search";
import Signup from "./Signup";
import Trending from "./Trending";

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
        <Route path="/trending" element={<Trending />} />
        {/* Add other routes here */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;