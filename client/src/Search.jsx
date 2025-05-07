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
