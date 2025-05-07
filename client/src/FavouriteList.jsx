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

const FavouriteList = () => {
  const [favouriteMovies, setFavouriteMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState("");
  const [groupedMovies, setGroupedMovies] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [watchLaterIds, setWatchLaterIds] = useState([]);
  const navigate = useNavigate();
  const email = localStorage.getItem("userEmail");

  const toggleWatchLater = async (movie, event) => {
    event.stopPropagation();
    try {
      const userId = localStorage.getItem("userEmail");
      if (!userId) {
        alert("Please log in to modify Watch Later list.");
        return;
      }

      const isAdded = watchLaterIds.includes(movie.id);

      if (isAdded) {
        const response = await fetch(`${API_BASE_URL}/api/watchlater/${movie.id}?userId=${userId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) throw new Error("Failed to remove movie from Watch Later");
        const updated = watchLaterIds.filter(id => id !== movie.id);
        setWatchLaterIds(updated);
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

        if (!response.ok) throw new Error("Failed to add movie to Watch Later");
        const updated = [...watchLaterIds, movie.id];
        setWatchLaterIds(updated);
      }
    } catch (err) {
      console.error("Watch Later toggle error:", err);
      alert("Connection error. Please check your network and try again.");
    }
  };

  const toggleFavourite = async (movie, event) => {
    event.stopPropagation();
    try {
      const userId = localStorage.getItem("userEmail");
      if (!userId) {
        alert("Please log in to modify Favourite list.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/favourite/${movie.id}?userId=${userId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) throw new Error("Failed to remove movie");
      setFavouriteMovies(prev => prev.filter(m => m.id !== movie.id));
      setGroupedMovies(groupByGenre(favouriteMovies.filter(m => m.id !== movie.id)));
      setSelectedMovie(null); // Close modal after removal
    } catch (error) {
      console.error("Error removing favourite:", error);
    }
  };

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
    const fetchFavouriteMovies = async () => {
      if (!email) return;

      try {
        const response = await fetch(
          `http://localhost:3001/api/favourite/list/${email}`
        );
        if (!response.ok) throw new Error("Failed to fetch favourites");
        const favouriteData = await response.json();

        // Fetch complete movie details for each favourite item
        const moviesWithDetails = await Promise.all(
          favouriteData.map(async (item) => {
            const details = await fetchMovieDetails(item.movieId);
            return {
              ...item,
              ...details,
              genres: details.genres || [],
            };
          })
        );

        setFavouriteMovies(moviesWithDetails);
        setGroupedMovies(groupByGenre(moviesWithDetails));
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchFavouriteMovies();
  }, [email]);

  useEffect(() => {
    const fetchWatchLaterMovies = async () => {
      if (!email) return;
      try {
        const response = await fetch(
          `http://localhost:3001/api/watchlater/list/${email}`
        );
        if (!response.ok) throw new Error("Failed to fetch watch later");
        const watchLaterData = await response.json();
        const ids = watchLaterData.map((item) => item.movieId);
        setWatchLaterIds(ids);
      } catch (error) {
        console.error("Error fetching watch later IDs:", error);
      }
    };

    fetchWatchLaterMovies();
  }, [email]);

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
              ❤️ My Favourites
            </h1>
          </div>
        </div>
      </div>

      <div className="container mt-5">
        {favouriteMovies.length === 0 ? (
          <p className="text-white text-center">Your favourite list is empty</p>
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
                      $isAdded={favouriteMovies.some(item => item.id === selectedMovie.id)}
                      onClick={(e) => toggleFavourite(selectedMovie, e)}
                      title={favouriteMovies.some(item => item.id === selectedMovie.id) ? "Remove from Favorites" : "Add to Favorites"}
                    >
                      {favouriteMovies.some(item => item.id === selectedMovie.id) ? "❤️" : "🤍"}
                    </HeartButton>
                    <WatchLaterButton
                      $isAdded={watchLaterIds.includes(selectedMovie.id)}
                      onClick={(e) => toggleWatchLater(selectedMovie, e)}
                      title={watchLaterIds.includes(selectedMovie.id) ? "Remove from Watch Later" : "Add to Watch Later"}
                      style={{ marginTop: '8px' }}
                    >
                      {watchLaterIds.includes(selectedMovie.id) ? "★" : "☆"}
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

export default FavouriteList;

