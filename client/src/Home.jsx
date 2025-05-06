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

// Styled Components
const StyledInput = styled.input`
  padding: 12px;
  border-radius: 30px;
  width: 100%;
  background-color: #141414;
  color: #fff;
  border: 1px solid #444;
  font-size: 1rem;
  &::placeholder {
    color: #aaa;
  }
`;

const StyledSelect = styled.select`
  padding: 12px;
  border-radius: 30px;
  background-color: #141414;
  color: #fff;
  border: 1px solid #444;
  font-size: 1rem;
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

const MovieWrapper = styled.div`
  position: relative;
  border-radius: 10px;
  overflow: hidden;
`;
const genres = [
  { id: 28, name: "Action" },
  { id: 35, name: "Comedy" },
  { id: 27, name: "Horror" },
  { id: 10749, name: "Romance" },
  { id: 16, name: "Animation" },
];

// Add this styled component definition near other styled components
const ActionButton = styled.button`
  padding: 10px 20px;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
`;

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

  &:hover {
    color: red;
  }
`;


const WatchLaterButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: ${props => props.$isAdded ? "gold" : "white"};
  z-index: 2;
  cursor: pointer;

  &:hover {
    color: gold;
  }
`;

const MovieContainer = styled.div`
  position: relative;
  margin: 8px;
`;

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("");
  const [year, setYear] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState("");
  const [genreMovies, setGenreMovies] = useState({});
  const navigate = useNavigate();
  const [watchLaterMovieIds, setWatchLaterMovieIds] = useState([]);
  const [favouriteMovieIds, setFavouriteIds] = useState([]);

  // Fetch movies on filters change
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

  // Show movie details (modal or page)
  async function showMovieDetails(movieId) {
    const movie = await fetchMovieDetails(movieId);
    const trailer = await fetchMovieTrailer(movieId);
    setSelectedMovie(movie);
    setTrailerKey(trailer || "");
  }
  const featuredMovie = genreMovies["Action"]?.[0]; // Featured movie for the banner
  
  // favourite
  const toggleFavourite = async (movie, event) => {
    event.stopPropagation();
    const userId = localStorage.getItem("userEmail");
    if (!userId) {
      alert("Please log in to modify Favourite list.");
      return;
    }
  
    const isAdded = favouriteMovieIds.includes(movie.id);
  
    try {
      if (isAdded) {
        // Remove from favourite
        const response = await fetch(`http://localhost:3001/api/favourite/${movie.id}?userId=${userId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        });
  
        if (!response.ok) throw new Error("Failed to remove movie");
  
        const updated = favouriteMovieIds.filter(id => id !== movie.id);
        setFavouriteIds(updated);
        localStorage.setItem("favouriteMovie", JSON.stringify(updated));
      } else {
        // Add to favourite
        const response = await fetch("http://localhost:3001/api/favourite/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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
        localStorage.setItem("favouriteMovie", JSON.stringify(updated));
      }
    } catch (err) {
      console.error("Favourite toggle error:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  // Fetch initial favorites on mount
    useEffect(() => {
      const userId = localStorage.getItem("userEmail");
      if (!userId) return;

      fetch(`http://localhost:3001/api/favourite/list/${userId}`)
        .then((response) => {
          if (!response.ok) throw new Error("Failed to fetch favorites");
          return response.json();
        })
        .then((data) => {
          const ids = data.map((fav) => fav.movieId);
          setFavouriteIds(ids);
          localStorage.setItem("favouriteMovie", JSON.stringify(ids)); // Optional
        })
        .catch((error) => console.error("Fetch favorites error:", error));
    }, []);


  
  // watch later
  const toggleWatchLater = async (movie, event) => {
    event.stopPropagation();
    const userId = localStorage.getItem("userEmail");
    if (!userId) {
      alert("Please log in to modify Watch Later list.");
      return;
    }
  
    const isAdded = watchLaterMovieIds.includes(movie.id);
  
    try {
      if (isAdded) {
        const response = await fetch(`http://localhost:3001/api/watchlater/${movie.id}?userId=${userId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error("Failed to remove movie");
  
        const updated = watchLaterMovieIds.filter(id => id !== movie.id);
        setWatchLaterMovieIds(updated);
        localStorage.setItem("watchLaterMovies", JSON.stringify(updated));
      } else {
        const response = await fetch("http://localhost:3001/api/watchlater/add", {
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
        localStorage.setItem("watchLaterMovies", JSON.stringify(updated));
      }
    } catch (err) {
      console.error("Watch Later toggle error:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  useEffect(() => {
    const userId = localStorage.getItem("userEmail");
    if (!userId) return;
  
    fetch(`http://localhost:3001/api/watchlater/list/${userId}`)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch watch later");
        return response.json();
      })
      .then((data) => {
        const ids = data.map((item) => item.movieId);
        setWatchLaterMovieIds(ids);
        localStorage.setItem("watchLaterMovies", JSON.stringify(ids));
      })
      .catch((error) => console.error("Fetch watch later error:", error));
  }, []);

  return (
    <>
      {/* Navbar */}

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
              <HeartButton 
                $isAdded={favouriteMovieIds.includes(movie.id)}
                onClick={(e) => toggleFavourite(movie, e)}
              >
                {favouriteMovieIds.includes(movie.id) ? "❤️" : "🤍"}
              </HeartButton>
              <WatchLaterButton
                $isAdded={watchLaterMovieIds.includes(movie.id)}
                onClick={(e) => toggleWatchLater(movie, e)}
              >
                {watchLaterMovieIds.includes(movie.id) ? "★" : "☆"}
              </WatchLaterButton>
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
                  onClick={() => setSelectedMovie(null)} // Close modal
                ></button>
              </div>
              <div className="modal-body d-flex flex-column flex-md-row gap-3">
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
                <div>
                  <p>{selectedMovie.overview}</p>
                  <p>
                    <strong>Release Date:</strong> {selectedMovie.release_date}
                  </p>
                  <p>
                    <strong>Rating:</strong> {selectedMovie.vote_average}
                  </p>
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
