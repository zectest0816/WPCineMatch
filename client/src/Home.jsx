import Navbar from "./Navbar";
import React, { useEffect, useState } from "react";
import {
  fetchMoviesByGenre,
  fetchMovieDetails,
  fetchMovieTrailer,
  IMAGE_BASE_URL,
} from "./api.js";
import "./styles/home.js";
import { useNavigate } from "react-router-dom";
import styled from 'styled-components';
import { API_BASE_URL } from './config';

// Styled Components
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

const MovieWrapper = styled.div`
  position: relative;
  border-radius: 10px;
  overflow: hidden;
`;



const MovieContainer = styled.div`
  position: relative;
  margin: 8px;
`;

const genres = [
  { id: 28, name: "Action" },
  { id: 35, name: "Comedy" },
  { id: 27, name: "Horror" },
  { id: 10749, name: "Romance" },
  { id: 16, name: "Animation" },
];

const ActionButton = styled.button`
  padding: 10px 20px;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
`;

// Update the HeartButton styled component
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
      opacity: 1;
    }
  }
`;

// Update the WatchLaterButton styled component
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
      opacity: 1;
    }
  }
`;

const MoviePoster = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
`;

const Home = () => {
  const [genreMovies, setGenreMovies] = useState({});
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState("");
  const [watchLaterMovieIds, setWatchLaterMovieIds] = useState([]);
  const [favouriteMovieIds, setFavouriteIds] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadAllGenres = async () => {
      const all = {};
      for (let genre of genres) {
        all[genre.name] = await fetchMoviesByGenre(genre.id);
      }
      setGenreMovies(all);
    };
    loadAllGenres();
  }, []);

  async function showMovieDetails(movieId) {
    const movie = await fetchMovieDetails(movieId);
    const trailer = await fetchMovieTrailer(movieId);
    setSelectedMovie(movie);
    setTrailerKey(trailer || "");
  }
  

  // Favourite functionality
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
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
  }, []);

  // Watch Later functionality
  const toggleWatchLater = async (movie, event) => {
    event.stopPropagation();
    try {
      const userId = localStorage.getItem("userEmail");
      if (!userId) {
        alert("Please log in to modify Watch Later list.");
        return;
      }

      const isAdded = watchLaterMovieIds.includes(movie.id);

      if (isAdded) {
        const response = await fetch(`${API_BASE_URL}/api/watchlater/${movie.id}?userId=${userId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" }
        });
        if (!response.ok) throw new Error("Failed to remove movie");
        const updated = watchLaterMovieIds.filter(id => id !== movie.id);
        setWatchLaterMovieIds(updated);
      } else {
        const response = await fetch(`${API_BASE_URL}/api/watchlater/add`, {
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
        const updated = [...watchLaterMovieIds, movie.id];
        setWatchLaterMovieIds(updated);
      }
    } catch (err) {
      console.error("Watch Later toggle error:", err);
      alert("Connection error. Please check your network and try again.");
    }
  };

  useEffect(() => {
    const fetchWatchLater = async () => {
      const userId = localStorage.getItem("userEmail");
      if (!userId) return;

      try {
        const response = await fetch(`${API_BASE_URL}/api/watchlater/list/${userId}`);
        if (!response.ok) throw new Error("Failed to fetch watch later");
        const data = await response.json();
        const ids = data.map((item) => item.movieId);
        setWatchLaterMovieIds(ids);
      } catch (error) {
        console.error("Fetch watch later error:", error);
      }
    };
    fetchWatchLater();
  }, []);

  const featuredMovie = genreMovies["Action"]?.[0];

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

      {/* Hero Banner */}
      {featuredMovie && (
        <div
          className="hero-banner"
          style={{
            backgroundImage: `url(${IMAGE_BASE_URL}${featuredMovie.backdrop_path})`,
          }}
        >
          <div className="hero-overlay">
            <h2 className="hero-title">{featuredMovie.title}</h2>
            <p className="hero-rank">🔥 Trending Now</p>
            <p className="hero-description">{featuredMovie.overview}</p>
            <div className="hero-buttons">
              <button
                className="hero-btn play"
                onClick={() => showMovieDetails(featuredMovie.id)}
              >
                ▶ Play
              </button>
              <button
                className="hero-btn info"
                onClick={() => showMovieDetails(featuredMovie.id)}
              >
                ℹ More Info
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Movie List */}
      <div className="container mt-5">
        {Object.entries(genreMovies).map(([genre, movies]) => (
          <div key={genre} className="mb-4">
            <h3 className="text-white mb-3">{genre} Movies</h3>
            <div className="movie-row">
              {movies.map((movie) => (
                <MovieContainer key={movie.id}>
                  <img
                    className="movie-thumbnail"
                    src={
                      movie.poster_path
                        ? `${IMAGE_BASE_URL}${movie.poster_path}`
                        : "https://via.placeholder.com/300x400?text=No+Image"
                    }
                    alt={movie.title}
                    onClick={() => showMovieDetails(movie.id)}
                  />
                </MovieContainer>
              ))}
            </div>
          </div>
        ))}
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
                  <div style={{ position: 'absolute', top: '10px', left: '10px', right: '10px', display: 'flex', justifyContent: 'space-between' }}>
                    <HeartButton 
                      $isAdded={favouriteMovieIds.includes(selectedMovie.id)}
                      onClick={(e) => toggleFavourite(selectedMovie, e)}
                    >
                      {favouriteMovieIds.includes(selectedMovie.id) ? "❤️" : "🤍"}
                    </HeartButton>
                    <WatchLaterButton
                      $isAdded={watchLaterMovieIds.includes(selectedMovie.id)}
                      onClick={(e) => toggleWatchLater(selectedMovie, e)}
                    >
                      {watchLaterMovieIds.includes(selectedMovie.id) ? "★" : "☆"}
                    </WatchLaterButton>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <p>{selectedMovie.overview}</p>
                  <div className="movie-details-grid">
                    <p><strong>Release Date:</strong> {selectedMovie.release_date}</p>
                    <p><strong>Rating:</strong> {selectedMovie.vote_average}/10</p>
                    <p><strong>Runtime:</strong> {selectedMovie.runtime} mins</p>
                    <p><strong>Genres:</strong> {selectedMovie.genres?.map(g => g.name).join(', ')}</p>
                  </div>
                  <div className="mt-3">
                    {trailerKey ? (
                      <iframe
                        width="100%"
                        height="300"
                        src={`https://www.youtube.com/embed/${trailerKey}`}
                        frameBorder="0"
                        allowFullScreen
                        title="Trailer"
                      ></iframe>
                    ) : (
                      <p>No trailer available.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;