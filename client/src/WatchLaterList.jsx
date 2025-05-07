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
import WatchLaterButton from './components/WatchLaterButton';
import HeartButton from './components/HeartButton';

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


const GenreGroup = styled.div`
  margin-bottom: 40px;
`;

const TopButtonsWrapper = styled.div`
  position: absolute;
  bottom: -30;
  left: -2.5%;
  display: flex;
  align-items: flex-end;
  padding: 8px;
  z-index: 2;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 3;
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
            {/* Movie Details Modal - Updated to match FavouriteList */}
            {selectedMovie && (
          <div className="modal-overlay" onClick={() => setSelectedMovie(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="close-button" onClick={() => setSelectedMovie(null)}>
                ✖
              </button>
              <div className="modal-body">
                <div className="poster-section">
                  <div className="poster-wrapper">
                    <img
                      src={
                        selectedMovie.poster_path
                          ? `${IMAGE_BASE_URL}${selectedMovie.poster_path}`
                          : "https://via.placeholder.com/300x400?text=No+Image"
                      }
                      alt={selectedMovie.title}
                      className="modal-poster"
                    />
                    <div className="top-buttons-wrapper">
                      <HeartButton
                        $isAdded={favouriteMovieIds.includes(selectedMovie.id)}
                        onClick={(e) => toggleFavourite(selectedMovie, e)}
                        title={favouriteMovieIds.includes(selectedMovie.id) ? "Remove from Favorites" : "Add to Favorites"}
                      >
                        {favouriteMovieIds.includes(selectedMovie.id) ? "❤️" : "🤍"}
                      </HeartButton>
                      <WatchLaterButton
                        $isAdded={watchLater.some(item => item.id === selectedMovie.id)}
                        onClick={(e) => toggleWatchLater(selectedMovie, e)}
                        title={watchLater.some(item => item.id === selectedMovie.id) ? "Remove from Watch Later" : "Add to Watch Later"}
                        style={{ marginTop: '8px' }}
                      >
                        {watchLater.some(item => item.id === selectedMovie.id) ? "★" : "☆"}
                      </WatchLaterButton>
                    </div>
                  </div>
                </div>
                <div className="modal-info">
                  <h2>{selectedMovie.title}</h2>
                  <p>{selectedMovie.overview}</p>
                  <div className="movie-details-grid">
                    <p><strong>Release Date:</strong> {selectedMovie.release_date}</p>
                    <p><strong>Rating:</strong> {selectedMovie.vote_average}/10</p>
                    <p><strong>Runtime:</strong> {selectedMovie.runtime} mins</p>
                    <p><strong>Genres:</strong> {selectedMovie.genres?.map(g => g.name).join(', ')}</p>
                  </div>
                  {trailerKey ? (
                    <div className="trailer">
                      <iframe
                        width="100%"
                        height="300"
                        src={`https://www.youtube.com/embed/${trailerKey}`}
                        frameBorder="0"
                        allowFullScreen
                        title="Trailer"
                      />
                    </div>
                  ) : (
                    <p>No trailer available.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
    </>
  );
};
export default WatchLaterList;

