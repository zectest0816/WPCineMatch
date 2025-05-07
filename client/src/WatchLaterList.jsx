import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import {
  fetchMovieDetails,
  fetchMovieTrailer,
  IMAGE_BASE_URL,
} from "./api.js";
import { API_BASE_URL } from './config';

// Styled Components
const MovieContainer = styled.div`
  position: relative;
  margin: 8px;
`;

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
  background: linear-gradient(
    to top,
    rgba(20, 20, 20, 0.9),
    rgba(20, 20, 20, 0)
  );
  color: white;
  font-weight: bold;
  font-size: 1rem;
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

const GenreGroup = styled.div`
  margin-bottom: 40px;
`;

const genres = [
  { id: 28, name: "Action" },
  { id: 35, name: "Comedy" },
  { id: 27, name: "Horror" },
  { id: 10749, name: "Romance" },
  { id: 16, name: "Animation" },
];
// Reuse button styles from Home.jsx
const HeartButton = styled.button`
  position: absolute;
  top: 8px;
  left: 8px;
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: ${props => props.$isAdded ? "red" : "white"};
  z-index: 2;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    color: red;
    
    &::before {
      content: "${props => props.$isAdded ? 'Remove from Favourites' : 'Add to Favourites'}";
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
      white-space: nowrap;
      pointer-events: none;
    }
  }
`;

const WatchLaterButton = styled.button`
  position: absolute;
  top: 1px;
  right: 8px;
  background: transparent;
  border: none;
  font-size: 2rem;
  color: ${props => props.$isAdded ? "gold" : "white"};
  z-index: 2;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    color: gold;
    
    &::before {
      content: "${props => props.$isAdded ? 'Remove from Watch Later' : 'Add to Watch Later'}";
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
      white-space: nowrap;
      pointer-events: none;
    }
  }
`;

const WatchLaterList = () => {
  const [watchLater, setWatchLater] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState("");
  const [groupedMovies, setGroupedMovies] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [favouriteMovieIds, setFavouriteIds] = useState([]);
  const navigate = useNavigate();
  const email = localStorage.getItem("userEmail");

  // Add favourite functionality
  const toggleFavourite = async (movie, event) => {
    event.stopPropagation();
    try {
      const userId = localStorage.getItem("userEmail");
      if (!userId) {
        alert("Please log in to modify Favourite list.");
        return;
      }

      const isAdded = favouriteMovieIds.includes(movie.id);

      if (isAdded) {
        const response = await fetch(`${API_BASE_URL}/api/favourite/${movie.id}?userId=${userId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) throw new Error("Failed to remove movie");
        const updated = favouriteMovieIds.filter(id => id !== movie.id);
        setFavouriteIds(updated);
      } else {
        const response = await fetch(`${API_BASE_URL}/api/favourite/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            movieId: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
          }),
        });

        if (!response.ok) throw new Error("Failed to add movie");
        const updated = [...favouriteMovieIds, movie.id];
        setFavouriteIds(updated);
      }
    } catch (err) {
      console.error("Favourite toggle error:", err);
      alert("Connection error. Please check your network and try again.");
    }
  };
  const toggleWatchLater = async (movie, event) => {
    event.stopPropagation();
    try {
      const userId = localStorage.getItem("userEmail");
      if (!userId) {
        alert("Please log in to modify Watch Later list.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/watchlater/${movie.id}?userId=${userId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });
      
      if (!response.ok) throw new Error("Failed to remove movie");
      setWatchLater(prev => prev.filter(m => m.id !== movie.id));
      setGroupedMovies(groupByGenre(watchLater.filter(m => m.id !== movie.id)));
      setSelectedMovie(null); // Close modal after removal
    } catch (error) {
      console.error("Error removing watch later:", error);
    }
  };


  // Add fetch favorites
  useEffect(() => {
    const fetchFavorites = async () => {
      const userId = localStorage.getItem("userEmail");
      if (!userId) return;

      try {
        const response = await fetch(`${API_BASE_URL}/api/favourite/list/${userId}`);
        if (!response.ok) throw new Error("Failed to fetch favorites");
        const data = await response.json();
        const ids = data.map((fav) => fav.movieId);
        setFavouriteIds(ids);
      } catch (error) {
        console.error("Fetch favorites error:", error);
      }
    };
    fetchFavorites();
  }, [email]);


  const groupByGenre = (movies) => {
    const grouped = {};
    movies.forEach((movie) => {
      if (movie.genres && Array.isArray(movie.genres)) {
        movie.genres.forEach((genre) => {
          const genreName = genre.name;
          if (!grouped[genreName]) grouped[genreName] = [];
          grouped[genreName].push(movie);
        });
      }
    });
    return grouped;
  };

  useEffect(() => {
    const fetchWatchLaterMovies = async () => {
      if (!email) return;

      try {
        const response = await fetch(
          `http://localhost:3001/api/watchlater/list/${email}`
        );
        if (!response.ok) throw new Error("Failed to fetch watch later");
        
        const watchLaterData = await response.json();
        
        // Fetch complete movie details for each watch later item
        const moviesWithDetails = await Promise.all(
          watchLaterData.map(async (item) => {
            const details = await fetchMovieDetails(item.movieId);
            return {
              ...item,
              ...details,
              genres: details.genres || [],
            };
          })
        );

        setWatchLater(moviesWithDetails);
        setGroupedMovies(groupByGenre(moviesWithDetails));
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchWatchLaterMovies();
  }, [email]);

  const handleRemoveWatchLater = async (movieId) => {
    if (!email) {
      alert("You must be logged in to modify Watch Later list.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3001/api/watchlater/${movieId}?userId=${email}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Failed to remove movie");

      setWatchLater((prev) => prev.filter((movie) => movie.id !== movieId));
      setGroupedMovies(groupByGenre(watchLater.filter((movie) => movie.id !== movieId)));
    } catch (error) {
      console.error("Error removing watch later:", error);
    }
  };

  async function showMovieDetails(movieId) {
    try {
      const movie = await fetchMovieDetails(movieId);
      const trailer = await fetchMovieTrailer(movieId);
      setSelectedMovie(movie);
      setTrailerKey(trailer || "");
    } catch (error) {
      console.error("Error fetching movie details:", error);
    }
  }

  return (
    <>
      <Navbar className="navbar navbar-dark bg-black border-bottom border-secondary px-3">
        <a className="navbar-brand fw-bold fs-3 text-danger" href="#">
          🎬 MovieExplorer
        </a>
        <button
          className="btn btn-outline-light ms-auto"
          onClick={() => navigate("/search")}
        >
          🔍 Search
        </button>
      </Navbar>
  
      <div className="container">
      <div className="row">
        <div className="col-12">
        <h1 className="text-center text-white mb-4 fw-bold" style={{ marginTop: '100px' }}>
        ⌛ Watch Later
        </h1>
        </div>
      </div>
    </div>
    
      <div className="container mt-5">
        {watchLater.length === 0 ? (
          <p className="text-white text-center">Your watch later list is empty</p>
        ) : (
          Object.entries(groupedMovies).map(([genre, movies]) => (
            <GenreGroup key={genre}>
              <h3 className="text-white mb-3">{genre} Movies</h3>
              <div className="movie-row d-flex flex-wrap">
                {movies
                  .filter((movie) =>
                    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((movie) => (
                    <MovieContainer key={movie.id} className="col-6 col-md-3 mb-4">
                      <MovieCard onClick={() => showMovieDetails(movie.id)}>
                        <MoviePoster
                          src={
                            movie.poster_path
                              ? `${IMAGE_BASE_URL}${movie.poster_path}`
                              : "https://via.placeholder.com/300x400?text=No+Image"
                          }
                          alt={movie.title}
                        />
                        <MovieTitleOverlay>{movie.title}</MovieTitleOverlay>
                      </MovieCard>
                    </MovieContainer>
                  ))}
              </div>
            </GenreGroup>
          ))
        )}
      </div>
  
      {/* Movie Details Modal */}
      {selectedMovie && (
        <div className="modal fade show" style={{ display: "block" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content bg-dark text-white">
              <div className="modal-header border-secondary">
                <h5 className="modal-title">{selectedMovie.title}</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedMovie(null)}
                ></button>
              </div>
              <div className="modal-body d-flex flex-column flex-md-row gap-3">
                <div style={{ position: 'relative' }}>
                  <img
                    src={
                      selectedMovie.poster_path
                        ? `${IMAGE_BASE_URL}${selectedMovie.poster_path}`
                        : "https://via.placeholder.com/300x400?text=No+Image"
                    }
                    className="img-fluid"
                    style={{ maxWidth: "300px", borderRadius: "8px" }}
                    alt="Movie Poster"
                  />
                  <HeartButton
                    $isAdded={favouriteMovieIds.includes(selectedMovie.id)}
                    onClick={(e) => toggleFavourite(selectedMovie, e)}
                  >
                    {favouriteMovieIds.includes(selectedMovie.id) ? "❤️" : "🤍"}
                  </HeartButton>
                  <WatchLaterButton
                    $isAdded={true}
                    onClick={(e) => toggleWatchLater(selectedMovie, e)}
                  >
                    ★
                  </WatchLaterButton>
                </div>
                <div>
                  <p>{selectedMovie.overview}</p>
                  <p>
                    <strong>Release Date:</strong> {selectedMovie.release_date}
                  </p>
                  <p>
                    <strong>Rating:</strong> {selectedMovie.vote_average}
                  </p>
                  {trailerKey && (
                    <iframe
                      width="100%"
                      height="300"
                      src={`https://www.youtube.com/embed/${trailerKey}`}
                      frameBorder="0"
                      allowFullScreen
                      title="Trailer"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default WatchLaterList;
