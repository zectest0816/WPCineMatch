import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  fetchMovies,
  fetchGenres,
  fetchMovieDetails,
  fetchMovieTrailer,
  IMAGE_BASE_URL,
} from "./api";
import Navbar from "./Navbar";
import "./styles/search.js";
import HeartButton from './components/HeartButton';
import WatchLaterButton from './components/WatchLaterButton';
import styled from "styled-components";
import { API_BASE_URL } from './config';

const TopButtonsWrapper = styled.div`
  position: absolute;
  bottom: 120px;
  left:  -1%;
  display: flex;
  align-items: flex-end;
  padding: 8px;
  z-index: 2;
`;

const Search = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const queryFromURL = queryParams.get("query") || "";
  const userEmail = localStorage.getItem("userEmail") || "guest@example.com";

  const [query, setQuery] = useState(queryFromURL);
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedRating, setSelectedRating] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerUrl, setTrailerUrl] = useState("");
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [favoriteMovieIds, setFavoriteMovieIds] = useState([]);
  const [watchLaterMovieIds, setWatchLaterMovieIds] = useState([]);

  useEffect(() => {
    const fetchGenresData = async () => {
      const genresData = await fetchGenres();
      setGenres(genresData);
    };
    fetchGenresData();
  }, []);

  useEffect(() => {
    if (query) handleSearch();
  }, [query, selectedGenre, selectedYear, selectedRating]);

  const handleSearch = async () => {
    const moviesData = await fetchMovies(
      query,
      selectedGenre,
      selectedYear,
      selectedRating
    );
    setMovies(moviesData);
  };

  const handleMovieClick = async (movie) => {
    const details = await fetchMovieDetails(movie.id);
    const trailer = await fetchMovieTrailer(movie.id);
    const response = await fetch(`http://localhost:3001/comments/${movie.id}`);
    const commentsData = await response.json();

    setSelectedMovie(details);
    setTrailerUrl(trailer);
    setComments(commentsData);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const userEmail = localStorage.getItem("userEmail") || "guest@example.com";

    const response = await fetch("http://localhost:3001/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        movieId: selectedMovie.id,
        user: userEmail,
        text: commentText,
      }),
    });

    const newComment = await response.json();
    setComments([newComment, ...comments]);
    setCommentText("");
  };

  const closeModal = () => {
    setSelectedMovie(null);
    setTrailerUrl("");
  };

  // Fetch Favorites/Watch Later Data
  useEffect(() => {
    const fetchUserLists = async () => {
      try {
        const email = localStorage.getItem("userEmail");
        if (!email) return;

        // Fetch favorites
        const favResponse = await fetch(`${API_BASE_URL}/api/favourite/list/${email}`);
        const favData = await favResponse.json();
        setFavoriteMovieIds(favData.map(item => item.movieId));

        // Fetch watch later
        const wlResponse = await fetch(`${API_BASE_URL}/api/watchlater/list/${email}`);
        const wlData = await wlResponse.json();
        setWatchLaterMovieIds(wlData.map(item => item.movieId));
      } catch (error) {
        console.error("Error fetching lists:", error);
      }
    };
    fetchUserLists();
  }, []);

  const toggleFavorite = async (movie, event) => {
    if (event) event.stopPropagation();
    try {
      const userId = localStorage.getItem("userEmail");
      if (!userId) {
        alert("Please log in to modify Favourite list.");
        return;
      }

      const isAdded = favoriteMovieIds.includes(movie.id);

      if (!isAdded) {
        // Optimistic update
        setFavoriteMovieIds(prev => [...prev, movie.id]);

        await fetch(`${API_BASE_URL}/api/favourite/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            movieId: movie.id,
            title: movie.title,
            poster_path: movie.poster_path || "",
          }),
        });
      } else {
        // Optimistic update
        setFavoriteMovieIds(prev => prev.filter(id => id !== movie.id));

        await fetch(`${API_BASE_URL}/api/favourite/${movie.id}?userId=${userId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" }
        });
      }
    } catch (error) {
      console.error("Favourite toggle error:", error);
      // Rollback
      const email = localStorage.getItem("userEmail");
      if (email) {
        const favResponse = await fetch(`${API_BASE_URL}/api/favourite/list/${email}`);
        const favData = await favResponse.json();
        setFavoriteMovieIds(favData.map(item => item.movieId));
      }
      alert("Failed to update Favorites. Please try again.");
    }
  };

  const toggleWatchLater = async (movie, event) => {
    if (event) event.stopPropagation();
    try {
      const userId = localStorage.getItem("userEmail");
      if (!userId) {
        alert("Please log in to modify Watch Later list.");
        return;
      }

      const isAdded = watchLaterMovieIds.includes(movie.id);

      if (!isAdded) {
        // Optimistic update
        setWatchLaterMovieIds(prev => [...prev, movie.id]);

        await fetch(`${API_BASE_URL}/api/watchlater/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userId,
            movieId: movie.id,
            title: movie.title,
            poster_path: movie.poster_path || "",
          }),
        });
      } else {
        // Optimistic update
        setWatchLaterMovieIds(prev => prev.filter(id => id !== movie.id));

        await fetch(`${API_BASE_URL}/api/watchlater/${movie.id}?userId=${userId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" }
        });
      }
    } catch (error) {
      console.error("Error updating watch later:", error);
      // Rollback
      const email = localStorage.getItem("userEmail");
      if (email) {
        const wlResponse = await fetch(`${API_BASE_URL}/api/watchlater/list/${email}`);
        const wlData = await wlResponse.json();
        setWatchLaterMovieIds(wlData.map(item => item.movieId));
      }
      alert("Failed to update Watch Later. Please try again.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="search-wrapper">
        <div className="filter-bar">
          <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}>
            <option value="">All Genres</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>{genre.name}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          />
          <input
            type="number"
            placeholder="Rating ≥"
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value)}
            min="0"
            max="10"
          />
        </div>

        <div className="movie-grid">
          {movies.length > 0 ? (
            movies.map((movie) => (
              <div key={movie.id} className="movie-card" onClick={() => handleMovieClick(movie)}>
                <img
                  src={movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : "https://via.placeholder.com/300x400?text=No+Image"}
                  alt={movie.title}
                />
                <div className="movie-title">{movie.title}</div>
              </div>
            ))
          ) : (
            <p className="no-results">No movies found.</p>
          )}
        </div>

        {selectedMovie && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="close-button" onClick={closeModal}>✖</button>
              <div className="modal-body">
                <img
                  src={selectedMovie.poster_path ? `${IMAGE_BASE_URL}${selectedMovie.poster_path}` : "https://via.placeholder.com/300x400?text=No+Image"}
                  alt={selectedMovie.title}
                  className="modal-poster"
                />
                <div className="modal-info">
                  <h2>{selectedMovie.title}</h2>
                  <p>{selectedMovie.overview}</p>
                  {trailerUrl && (
                    <div className="trailer">
                      <iframe
                        width="100%"
                        height="300"
                        src={`https://www.youtube.com/embed/${trailerUrl}`}
                        frameBorder="0"
                        allowFullScreen
                        title="Trailer"
                      ></iframe>
                    </div>
                  )}
                  <div className="top-buttons-wrapper">
                    <HeartButton
                      $isAdded={favoriteMovieIds.includes(selectedMovie.id)}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(selectedMovie, e);
                      }}
                      title={favoriteMovieIds.includes(selectedMovie.id) ? "Remove from Favorites" : "Add to Favorites"}
                      style={{ marginBottom: '3.5px' }}
                      color={favoriteMovieIds.includes(selectedMovie.id) ? "red" : "white"}
                    >
                      {favoriteMovieIds.includes(selectedMovie.id) ? '❤️' : '🤍'}
                    </HeartButton>
                    <WatchLaterButton
                      $isAdded={watchLaterMovieIds.includes(selectedMovie.id)}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWatchLater(selectedMovie, e);
                      }}
                      title={watchLaterMovieIds.includes(selectedMovie.id) ? "Remove from Watch Later" : "Add to Watch Later"}
                      color={watchLaterMovieIds.includes(selectedMovie.id) ? "yellow" : "white"}
                    >
                      {watchLaterMovieIds.includes(selectedMovie.id) ? '★' : '☆'}
                    </WatchLaterButton>
                  </div>
                  <div className="comment-section mt-4">
                    <h4 className="text-light mb-3">Comments</h4>
                    <form onSubmit={handleCommentSubmit} className="mb-4">
                      <div className="input-group">
                        <textarea
                          className="form-control bg-dark text-light border-secondary"
                          rows="2"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Write your comment..."
                          style={{ resize: "none" }}
                        ></textarea>
                        <button className="btn btn-danger" type="submit">
                          <i className="bi bi-send"></i> Send
                        </button>
                      </div>
                    </form>
                    <div className="comment-list overflow-auto" style={{ maxHeight: "300px" }}>
                      {comments.length > 0 ? (
                        comments.map((comment, idx) => (
                          <div
                            key={idx}
                            className="d-flex mb-3 p-3 rounded"
                            style={{
                              backgroundColor: "#1f1f1f",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
                            }}
                          >
                            <div
                              className="flex-shrink-0 bg-danger text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                              style={{
                                width: "45px",
                                height: "45px",
                                fontSize: "1.1rem",
                                fontWeight: "600",
                              }}
                            >
                              {comment.user.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <strong style={{ color: "#e5e5e5" }}>{comment.user}</strong>
                                <small className="text-muted">
                                  {new Date(comment.createdAt).toLocaleString()}
                                </small>
                              </div>
                              <p className="mb-0 text-light">{comment.text}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted">No comments yet. Be the first!</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Search;