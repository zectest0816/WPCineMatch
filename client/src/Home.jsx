import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  fetchMovieDetails,
  fetchMoviesByGenre,
  fetchMovieTrailer,
  IMAGE_BASE_URL,
} from "./api.js";
import HeartButton from "./components/HeartButton";
import WatchLaterButton from "./components/WatchLaterButton";
import { API_BASE_URL } from "./config";
import Navbar from "./Navbar";
import "./styles/home.js";


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

const Home = () => {
  const [genreMovies, setGenreMovies] = useState({});
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState("");
  const [watchLaterMovieIds, setWatchLaterMovieIds] = useState([]);
  const [favouriteMovieIds, setFavouriteIds] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null); // Tracks which comment's menu is open
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");
  const [rating, setRating] = useState(0);
  const [editRating, setEditRating] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const navigate = useNavigate();
  const [fadeText, setFadeText] = useState(true);
  const [scrollInterval, setScrollInterval] = useState(null);
  const scrollRefs = useRef({});
  const userId = localStorage.getItem("userEmail");

  const fetchComments = async (movieId) => {
    try {
      const response = await fetch(`http://localhost:3001/comments/${movieId}`);
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };

  const toggleMenu = (id) => {
    setActiveMenu(activeMenu === id ? null : id);
  };

  const handleEditClick = (id, text, rating) => {
    setEditingCommentId(id);
    setEditText(text);
    setEditRating(rating);
    setActiveMenu(null);
  };

  const handleEditSave = async (id) => {
    await fetch(`http://localhost:3001/comments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: editText, rating: editRating }),
    });
    setEditingCommentId(null);
    fetchComments(selectedMovie.id);
  };

  const handleDelete = async (id) => {
    await fetch(`http://localhost:3001/comments/${id}`, { method: "DELETE" });
    setActiveMenu(null);
    fetchComments(selectedMovie.id);
  };

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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex(
        (prevIndex) =>
          (prevIndex + 1) % (genreMovies["Action"]?.slice(0, 5).length || 1)
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [genreMovies]);

  const heroMovies = genreMovies["Action"]?.slice(0, 5) || [];
  const featuredMovie = heroMovies[currentHeroIndex];

  async function showMovieDetails(movieId) {
    const movie = await fetchMovieDetails(movieId);
    const trailer = await fetchMovieTrailer(movieId);
    setSelectedMovie(movie);
    setTrailerKey(trailer || "");
    fetchComments(movieId);
  }

  const toggleFavourite = async (movie, event) => {
    event.stopPropagation();
    try {
      const userId = localStorage.getItem("userEmail");
      if (!userId) {
        alert("Please log in to modify your lists.");
        return;
      }

      const isAdded = favouriteMovieIds.includes(movie.id);
      let updatedIds;

      if (isAdded) {
        updatedIds = favouriteMovieIds.filter((id) => id !== movie.id);
        setFavouriteIds(updatedIds);
      } else {
        updatedIds = [...favouriteMovieIds, movie.id];
        setFavouriteIds(updatedIds);
      }

      const endpoint = isAdded
        ? `${API_BASE_URL}/api/favourite/${movie.id}?userId=${userId}`
        : `${API_BASE_URL}/api/favourite/add`;

      const response = await fetch(endpoint, {
        method: isAdded ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: isAdded
          ? null
          : JSON.stringify({
            userId,
            movieId: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
          }),
      });

      if (!response.ok) {
        const favResponse = await fetch(
          `${API_BASE_URL}/api/favourite/list/${userId}`
        );
        const favData = await favResponse.json();
        setFavouriteIds(favData.map((item) => item.movieId));
        throw new Error(`Failed to ${isAdded ? "remove" : "add"} favorite`);
      }
    } catch (err) {
      console.error("Favourite toggle error:", err);
      alert("Operation failed. Please try again.");
    }
  };

  const toggleWatchLater = async (movie, event) => {
    event.stopPropagation();
    try {
      const userId = localStorage.getItem("userEmail");
      if (!userId) {
        alert("Please log in to modify your lists.");
        return;
      }

      const isAdded = watchLaterMovieIds.includes(movie.id);
      let updatedIds;

      if (isAdded) {
        updatedIds = watchLaterMovieIds.filter((id) => id !== movie.id);
        setWatchLaterMovieIds(updatedIds);
      } else {
        updatedIds = [...watchLaterMovieIds, movie.id];
        setWatchLaterMovieIds(updatedIds);
      }

      const endpoint = isAdded
        ? `${API_BASE_URL}/api/watchlater/${movie.id}?userId=${userId}`
        : `${API_BASE_URL}/api/watchlater/add`;

      const response = await fetch(endpoint, {
        method: isAdded ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: isAdded
          ? null
          : JSON.stringify({
            userId,
            movieId: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
          }),
      });

      if (!response.ok) {
        const wlResponse = await fetch(
          `${API_BASE_URL}/api/watchlater/list/${userId}`
        );
        const wlData = await wlResponse.json();
        setWatchLaterMovieIds(wlData.map((item) => item.movieId));
        throw new Error(`Failed to ${isAdded ? "remove" : "add"} watch later`);
      }
    } catch (err) {
      console.error("Watch Later toggle error:", err);
      alert("Operation failed. Please try again.");
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText || rating === 0) {
      setErrorMessage("Please enter a comment and select a rating.");
      setTimeout(() => setErrorMessage(""), 3000);
    }

    try {
      await fetch(`http://localhost:3001/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieId: selectedMovie.id,
          user: userId,
          text: commentText,
          rating,
        }),
      });

      setCommentText("");
      setRating(0);
      fetchComments(selectedMovie.id);
    } catch (error) {
      console.error("Failed to submit comment:", error);
    }
  };

  const startScroll = (genre, direction) => {
    const container = scrollRefs.current[genre];
    const amount = direction === "left" ? -2 : 2;
    const interval = setInterval(() => {
      container.scrollLeft += amount;
    }, 10);
    setScrollInterval(interval);
  };

  const stopScroll = () => clearInterval(scrollInterval);

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem("userEmail");
      if (!userId) return;

      try {
        const favResponse = await fetch(
          `${API_BASE_URL}/api/favourite/list/${userId}`
        );
        const favData = await favResponse.json();
        setFavouriteIds(favData.map((item) => item.movieId));

        const wlResponse = await fetch(
          `${API_BASE_URL}/api/watchlater/list/${userId}`
        );
        const wlData = await wlResponse.json();
        setWatchLaterMovieIds(wlData.map((item) => item.movieId));
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    fetchUserData();
  }, []);

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

      {featuredMovie && (
        <div
          className="hero-banner"
          style={{
            backgroundImage: `url(${IMAGE_BASE_URL}${featuredMovie.backdrop_path})`,
            transition: "background-image 1s ease-in-out",
          }}
        >
          <div className="hero-overlay">
            <h2 className="hero-title">{featuredMovie.title}</h2>
            <p className="hero-rank">🔥 Trending Now</p>
            <p className="hero-description">{featuredMovie.overview}</p>
            <div className="hero-buttons">
              <button
                className="hero-btn play"
                onClick={async () => {
                  const trailer = await fetchMovieTrailer(featuredMovie.id);
                  if (trailer) {
                    window.open(
                      `https://www.youtube.com/watch?v=${trailer}`,
                      "_blank"
                    );
                  } else {
                    alert("Trailer not available.");
                  }
                }}
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

          {/* Dots navigation */}
          <div className="hero-dots">
            {heroMovies.map((_, index) => (
              <span
                key={index}
                className={`dot ${index === currentHeroIndex ? "active" : ""}`}
                onClick={() => setCurrentHeroIndex(index)}
              />
            ))}
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
        <div className="modal-overlay" onClick={() => setSelectedMovie(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-button"
              onClick={() => setSelectedMovie(null)}
            >
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
                      title={
                        favouriteMovieIds.includes(selectedMovie.id)
                          ? "Remove from Favorites"
                          : "Add to Favorites"
                      }
                    >
                      {favouriteMovieIds.includes(selectedMovie.id)
                        ? "❤️"
                        : "🤍"}
                    </HeartButton>
                    <WatchLaterButton
                      $isAdded={watchLaterMovieIds.includes(selectedMovie.id)}
                      onClick={(e) => toggleWatchLater(selectedMovie, e)}
                      title={
                        watchLaterMovieIds.includes(selectedMovie.id)
                          ? "Remove from Watch Later"
                          : "Add to Watch Later"
                      }
                      style={{ marginTop: "8px" }}
                    >
                      {watchLaterMovieIds.includes(selectedMovie.id)
                        ? "★"
                        : "☆"}
                    </WatchLaterButton>
                  </div>
                </div>
              </div>
              <div className="modal-info">
                <h2>{selectedMovie.title}</h2>
                <p>{selectedMovie.overview}</p>
                <div className="movie-details-grid">
                  <p>
                    <strong>Release Date:</strong> {selectedMovie.release_date}
                  </p>
                  <p>
                    <strong>Rating:</strong> {selectedMovie.vote_average}/10
                  </p>
                  <p>
                    <strong>Runtime:</strong> {selectedMovie.runtime} mins
                  </p>
                  <p>
                    <strong>Genres:</strong>{" "}
                    {selectedMovie.genres?.map((g) => g.name).join(", ")}
                  </p>
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
                    ></iframe>
                  </div>
                ) : (
                  <p>No trailer available.</p>
                )}
                <div className="comment-section mt-4">
                  <h4 className="text-light mb-3">Comments</h4>
                  <form onSubmit={handleCommentSubmit} className="mb-4">
                    {errorMessage && (
                      <div
                        className="alert alert-danger"
                        role="alert"
                        style={{ marginBottom: "1rem" }}
                      >
                        {errorMessage}
                      </div>
                    )}

                    <div className="mb-2 text-warning">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <i
                          key={star}
                          className={`bi bi-star${star <= rating ? "-fill" : ""}`}
                          style={{ cursor: "pointer", fontSize: "1.3rem" }}
                          onClick={() => setRating(star)}
                        ></i>
                      ))}
                    </div>
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
                  <div
                    className="comment-list overflow-auto"
                    style={{ maxHeight: "300px" }}
                  >
                    {comments.length > 0 ? (
                      comments.map((comment, idx) => (
                        <div
                          key={idx}
                          className="d-flex mb-3 p-3 rounded position-relative"
                          style={{
                            backgroundColor: "#1f1f1f",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
                          }}
                        >
                          {/* Avatar */}
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

                          {/* Content */}
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-center mb-1" style={{ paddingRight: '20px' }}>
                              <strong style={{ color: "#e5e5e5" }}>{comment.user}</strong>
                              <small style={{ color: 'white', fontSize: '0.75rem' }}>
                                {new Date(comment.createdAt).toLocaleString()}
                              </small>
                            </div>
                            {/* Edit mode or display mode */}
                            {editingCommentId === comment._id ? (
                              <>
                                <input
                                  className="form-control"
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                />
                                <div className="mb-2 text-warning">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <i
                                      key={star}
                                      className={`bi bi-star${star <= editRating ? "-fill" : ""}`}
                                      style={{ cursor: "pointer", fontSize: "1.3rem" }}
                                      onClick={() => setEditRating(star)}
                                    ></i>
                                  ))}
                                </div>
                                <div className="mt-2">
                                  <button
                                    className="btn btn-success btn-sm me-2"
                                    onClick={() => handleEditSave(comment._id)}
                                  >
                                    Save
                                  </button>
                                  <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setEditingCommentId(null)}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </>
                            ) : (
                              <>
                                {/* Rating stars */}
                                <div className="d-flex align-items-center mb-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <i
                                      key={star}
                                      className={`bi bi-star${star <= comment.rating ? "-fill" : ""}`}
                                      style={{ color: "#f5c518", marginRight: "2px" }}
                                    ></i>
                                  ))}
                                </div>

                                {/* Comment text */}
                                <p className="mb-0 text-light">{comment.text}</p>
                              </>
                            )}
                          </div>

                          {/* Three-dot menu button - Only show if the comment belongs to current user */}
                          {comment.user === userId && (
                            <div className="position-absolute top-0 end-0 p-2">
                              <button
                                className="btn btn-sm text-white"
                                onClick={() => toggleMenu(comment._id)}
                                style={{ background: "none", border: "none" }}
                              >
                                &#8942;
                              </button>
                              {activeMenu === comment._id && (
                                <div
                                  className="dropdown-menu show"
                                  style={{
                                    position: "absolute",
                                    right: 0,
                                    top: "100%",
                                    backgroundColor: "#2c2c2c",
                                    border: "1px solid #444",
                                  }}
                                >
                                  <button
                                    className="dropdown-item text-white"
                                    style={{ backgroundColor: "#2c2c2c" }}
                                    onClick={() => handleEditClick(comment._id, comment.text)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="dropdown-item text-danger"
                                    style={{ backgroundColor: "#2c2c2c" }}
                                    onClick={() => handleDelete(comment._id)}
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

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
    </>
  );
};

export default Home;