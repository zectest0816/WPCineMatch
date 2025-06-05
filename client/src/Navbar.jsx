import React, { useState, use } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaChartBar, FaBookmark, FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import "./styles/navbar.css";

export const SearchProvider = ({ children }) => {
  return (
    <SearchContext.Provider value={{ query, setQuery }}>
      {children}
    </SearchContext.Provider>
  );
};

const Navbar = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");

  const handleSearchSubmit = () => {
    if (searchInput.trim() !== "") {
      navigate(`/search?query=${encodeURIComponent(searchInput)}`);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="navbar">
      <div className="nav-left">
        <h2 className="nav-brand" onClick={() => navigate("/home")}>
          🎬 CineMatch
        </h2>
      </div>

      <div className="nav-center">
        <div className="search-box">
          <FaSearch className="search-icon" onClick={handleSearchSubmit} />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearchSubmit();
              }
            }}
          />
        </div>
      </div>

      <div className="nav-right">
        <FaChartBar
          className="nav-icon"
          title="Trending"
          onClick={() => navigate("/trending")}
        />
        <FaBookmark
          className="nav-icon"
          title="Bookmark"
          onClick={() => navigate("/bookmark")}
        />
        <FaUserCircle
          className="nav-icon profile-icon"
          title="Profile"
          onClick={() => navigate("/profile")}
        />
        <FaSignOutAlt
          className="nav-icon"
          title="Logout"
          onClick={handleLogout}
        />
      </div>
    </div>
  );
};

export default Navbar;
