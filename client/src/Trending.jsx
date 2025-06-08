import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  fetchGenres,
  fetchMovieDetails,
  fetchMovies,
  fetchMovieTrailer,
  IMAGE_BASE_URL,
} from "./api";
import HeartButton from "./components/HeartButton";
import WatchLaterButton from "./components/WatchLaterButton";
import { API_BASE_URL } from "./config";
import Navbar from "./Navbar";

const MovieContainer = styled.div`
  position: relative;
  margin: 8px;
  transition: transform 0.2s;
  cursor: pointer;
  &:hover {
    transform: scale(1.03);
  }
`;

const Trending = () => {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [minRating, setMinRating] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState("");
  const [watchLaterMovieIds, setWatchLaterMovieIds] = useState([]);
  const [favouriteMovieIds, setFavouriteIds] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState(0);
  const [rating, setRating] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const userId = localStorage.getItem("userEmail");

  const fetchComments = async (movieId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/comments/${movieId}`);
      if (!response.ok) throw new Error("Failed to fetch comments");
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      setErrorMessage("Failed to load comments.");
      setTimeout(() => setErrorMessage(""), 3000);
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
    try {
      const response = await fetch(`${API_BASE_URL}/comments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editText, rating: editRating }),
      });
      if (!response.ok) throw new Error("Failed to update comment");
      setEditingCommentId(null);
      fetchComments(selectedMovie.id);
    } catch (error) {
      console.error("Failed to edit comment:", error);
      setErrorMessage("Failed to edit comment.");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/comments/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete comment");
      setActiveMenu(null);
      fetchComments(selectedMovie.id);
    } catch (error) {
      console.error("Failed to delete comment:", error);
      setErrorMessage("Failed to delete comment.");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const toggleFavourite = async (movie, event) => {
    event.stopPropagation();
    if (!userId) {
      navigate("/login");
      return;
    }
    try {
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
      setErrorMessage("Failed to update favorites.");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const toggleWatchLater = async (movie, event) => {
    event.stopPropagation();
    if (!userId) {
      navigate("/login");
      return;
    }
    try {
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
      setErrorMessage("Failed to update watch later list.");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText || rating === 0) {
      setErrorMessage("Please enter a comment and select a rating.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieId: selectedMovie.id,
          user: userId,
          text: commentText,
          rating,
        }),
      });
      if (!response.ok) throw new Error("Failed to submit comment");
      setCommentText("");
      setRating(0);
      fetchComments(selectedMovie.id);
    } catch (error) {
      console.error("Failed to submit comment:", error);
      setErrorMessage("Failed to submit comment.");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      const genreList = await fetchGenres();
      setGenres(genreList);
      await applyFilters();
      setLoading(false);
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
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
        setErrorMessage("Failed to load user data.");
        setTimeout(() => setErrorMessage(""), 3000);
      }
    };
    fetchUserData();
  }, []);

  const applyFilters = async () => {
    setLoading(true);
    try {
      const allMovies = await fetchMovies("", selectedGenre, "", "revenue.desc");
      const filtered = allMovies.filter((movie) => {
        const movieYear = movie.release_date?.split("-")[0];
        const matchesYear = releaseYear ? movieYear === releaseYear : true;
        const matchesRating = minRating
          ? movie.vote_average >= parseFloat(minRating)
          : true;
        return matchesYear && matchesRating;
      });

      const detailedMovies = await Promise.all(
        filtered.slice(0, 10).map(async (movie) => {
          const details = await fetchMovieDetails(movie.id);
          return { ...movie, ...details };
        })
      );

      setMovies(detailedMovies);
    } catch (error) {
      console.error("Failed to apply filters:", error);
      setErrorMessage("Failed to load movies.");
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const formatRevenue = (revenue) => {
    if (!revenue) return "N/A";
    if (revenue >= 1000000000)
      return `$${(revenue / 1000000000).toFixed(1)}B`;
    if (revenue >= 1000000) return `$${(revenue / 1000000).toFixed(1)}M`;
    if (revenue >= 1000) return `$${(revenue / 1000).toFixed(1)}K`;
    return `$${revenue}`;
  };

  const showMovieDetails = async (movieId) => {
    try {
      const movie = await fetchMovieDetails(movieId);
      const trailer = await fetchMovieTrailer(movieId);
      setSelectedMovie(movie);
      setTrailerKey(trailer || "");
      fetchComments(movieId);
    } catch (error) {
      console.error("Failed to load movie details:", error);
      setErrorMessage("Failed to load movie details.");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  return (
    <div style={{ backgroundColor: "#121212", minHeight: "100vh", color: "#fff" }}>
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

      <div style={{ textAlign: "center", paddingTop: "80px", paddingInline: "20px" }}>
        <h2
          style={{
            color: "#ffffff",
            fontWeight: "bold",
            fontSize: "2.5rem",
            textTransform: "uppercase",
            letterSpacing: "1px",
            position: "relative",
            textShadow: "0 0 5px #e50914, 0 0 10px #ff0a16, 0 0 15px #ff4c4c",
          }}
        >
          🔥 Top 10 Trending Movies
        </h2>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            marginBottom: "30px",
            justifyContent: "center",
            maxWidth: "800px",
            margin: "0 auto 30px auto",
          }}
        >
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            style={{
              padding: "10px 15px",
              borderRadius: "20px",
              border: "1px solid #333",
              backgroundColor: "#1e1e1e",
              color: "#fff",
              width: "180px",
              outline: "none",
            }}
          >
            <option value="">All Genres</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Release Year"
            value={releaseYear}
            onChange={(e) => setReleaseYear(e.target.value)}
            style={{
              padding: "10px 15px",
              borderRadius: "20px",
              border: "1px solid #333",
              backgroundColor: "#1e1e1e",
              color: "#fff",
              width: "180px",
              outline: "none",
            }}
          />

          <input
            type="number"
            placeholder="Min Rating"
            step="0.1"
            min="0"
            max="10"
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            style={{
              padding: "10px 15px",
              borderRadius: "20px",
              border: "1px solid #333",
              backgroundColor: "#1e1e1e",
              color: "#fff",
              width: "180px",
              outline: "none",
            }}
          />

          <button
            onClick={applyFilters}
            style={{
              padding: "10px 20px",
              backgroundColor: "#e50914",
              color: "#fff",
              border: "none",
              borderRadius: "20px",
              fontWeight: "bold",
              cursor: "pointer",
              width: "180px",
            }}
          >
            Apply Filters
          </button>
        </div>

        {loading ? (
          <p>Loading movies...</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gridTemplateRows: "repeat(2, auto)",
              gap: "15px",
              maxWidth: "1200px",
              margin: "0 auto",
              padding: "0 10px",
            }}
          >
            {movies.map((movie) => (
              <MovieContainer key={movie.id} onClick={() => showMovieDetails(movie.id)}>
                <img
                  className="movie-thumbnail"
                  src={
                    movie.poster_path
                      ? `${IMAGE_BASE_URL}${movie.poster_path}`
                      : "https://via.placeholder.com/150x225?text=No+Image"
                  }
                  alt={movie.title}
                  style={{
                    width: "200px",
                    height: "300px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
                <div style={{ textAlign: "center", padding: "10px" }}>
                  <h3
                    style={{
                      color: "red",
                      fontSize: "16px",
                      marginTop: "10px",
                      minHeight: "50px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: "2",
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {movie.title}
                  </h3>
                  <p style={{ margin: "8px 0", fontSize: "14px" }}>
                    {movie.release_date?.split("-")[0] || "N/A"} · ⭐{" "}
                    {movie.vote_average?.toFixed(1) || "N/A"}
                  </p>
                  <p style={{ margin: "5px 0", fontSize: "14px", color: "#4caf50" }}>
                    💰 {formatRevenue(movie.revenue)}
                  </p>
                </div>
              </MovieContainer>
            ))}
          </div>
        )}
      </div>

      {selectedMovie && (
        <div
          className="modal-overlay"
          onClick={() => {
            setSelectedMovie(null);
            setTrailerKey("");
          }}
          role="dialog"
          aria-labelledby="modal-title"
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-button"
              onClick={() => {
                setSelectedMovie(null);
                setTrailerKey("");
              }}
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
                    style={{ maxWidth: "300px", borderRadius: "8px" }}
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
                      {favouriteMovieIds.includes(selectedMovie.id) ? "❤️" : "🤍"}
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
                      {watchLaterMovieIds.includes(selectedMovie.id) ? "★" : "☆"}
                    </WatchLaterButton>
                  </div>
                </div>
              </div>
              <div className="modal-info">
                <h2 id="modal-title">{selectedMovie.title}</h2>
                <p>{selectedMovie.overview}</p>
                <div className="movie-details-grid">
                  <p>
                    <strong>Release Date:</strong> {selectedMovie.release_date || "N/A"}
                  </p>
                  <p>
                    <strong>Rating:</strong> {selectedMovie.vote_average?.toFixed(1) || "N/A"}/10
                  </p>
                  <p>
                    <strong>Runtime:</strong> {selectedMovie.runtime || "N/A"} mins
                  </p>
                  <p>
                    <strong>Genres:</strong>{" "}
                    {selectedMovie.genres?.map((g) => g.name).join(", ") || "N/A"}
                  </p>
                  <p>
                    <strong>Revenue:</strong> {formatRevenue(selectedMovie.revenue)}
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
                            <div
                              className="d-flex justify-content-between align-items-center mb-1"
                              style={{ paddingRight: "20px" }}
                            >
                              <strong style={{ color: "#e5e5e5" }}>{comment.user}</strong>
                              <small style={{ color: "white", fontSize: "0.75rem" }}>
                                {new Date(comment.createdAt).toLocaleString()}
                              </small>
                            </div>
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
                                <div className="d-flex align-items-center mb-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <i
                                      key={star}
                                      className={`bi bi-star${star <= comment.rating ? "-fill" : ""}`}
                                      style={{ color: "#f5c518", marginRight: "2px" }}
                                    ></i>
                                  ))}
                                </div>
                                <p className="mb-0 text-light">{comment.text}</p>
                              </>
                            )}
                          </div>
                          {userId && comment.user === userId && (
                            <div className="position-absolute top-0 end-0 p-2">
                              <button
                                className="btn btn-sm text-white"
                                onClick={() => toggleMenu(comment._id)}
                                style={{ background: "none", border: "none" }}
                              >
                                ⋮
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
                                    onClick={() =>
                                      handleEditClick(comment._id, comment.text, comment.rating)
                                    }
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
    </div>
  );
};

export default Trending;