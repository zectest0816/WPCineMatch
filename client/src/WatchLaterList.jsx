import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  fetchMovies,
  fetchMovieDetails,
  fetchMovieTrailer,
  IMAGE_BASE_URL,
} from "./api.js";

// Styled Components (reused from Home)
const MovieCard = styled.div`
  cursor: pointer;
  border-radius: 10px;
  overflow: hidden;
  transition: transform 0.3s ease;
  background-color: #141414;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);

  &:hover {
    transform: scale(1.08);
  }
`;

const MoviePoster = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
`;

const MovieTitleOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px;
  background: linear-gradient(to top, rgba(20, 20, 20, 0.9), rgba(20, 20, 20, 0));
  color: white;
  font-weight: bold;
  font-size: 1rem;
`;

const MovieWrapper = styled.div`
  position: relative;
  border-radius: 10px;
  overflow: hidden;
`;

const StyledInput = styled.input`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  width: 100%;
`;

const StyledSelect = styled.select`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  color: white;
  font-size: 1.5rem;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  text-align: center;
  line-height: 32px;
  cursor: pointer;
  z-index: 2;

  &:hover {
    background: rgba(255, 0, 0, 0.8);
  }
`;


const WatchLaterList = () => {
  const [watchLater, setWatchLater] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("");
  const [year, setYear] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [trailerKey, setTrailerKey] = useState("");

  const email = localStorage.getItem("userEmail");

  useEffect(() => {
    if (!email) return;
    
    fetch(`http://localhost:3001/api/watchlater/list/${email}`)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch watch later");
        return response.json();
      })
      .then((data) => setWatchLater(data))
      .catch((error) => console.error("Error fetching watch later:", error));
  }, [email]);

  const handleRemoveWatchLater = (movieId) => {
    if (!email) {
      alert("You must be logged in to modify Watch Later list.");
      return;
    }

    fetch(`http://localhost:3001/api/watchlater/${movieId}?userId=${email}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
      })
      .then(() => {
        setWatchLater((prev) => prev.filter((item) => item.movieId !== movieId));
      })
      .catch((error) => console.error("Error removing watch later:", error));
  };

  async function showMovieDetails(movieId) {
    const movie = await fetchMovieDetails(movieId);
    const trailer = await fetchMovieTrailer(movieId);
    setSelectedMovie(movie);
    setTrailerKey(trailer || "");
  }

  return (
    <>
      {/* Navbar and Filters (same structure as FavouriteList.jsx) */}
      
      {/* Movie Results */}
      <div className="container">
        <div className="row g-4">
          {watchLater.length === 0 ? (
            <p className="text-white">You have no watch later movies yet.</p>
          ) : (
            watchLater.map((movie) => {
              const posterUrl = movie.poster_path
                ? `${IMAGE_BASE_URL}${movie.poster_path}`
                : "https://via.placeholder.com/300x400?text=No+Image";

              return (
                <div key={movie._id} className="col-6 col-sm-4 col-md-3">
                  <MovieCard onClick={() => showMovieDetails(movie.movieId)}>
                    <MovieWrapper>
                      <RemoveButton onClick={() => handleRemoveWatchLater(movie.movieId)}>
                        −
                      </RemoveButton>
                      <MoviePoster src={posterUrl} alt={movie.title} />
                      <MovieTitleOverlay>{movie.title}</MovieTitleOverlay>
                    </MovieWrapper>
                  </MovieCard>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal (same as FavouriteList.jsx) */}
    </>
  );
};

export default WatchLaterList;