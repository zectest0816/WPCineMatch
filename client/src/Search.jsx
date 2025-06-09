import { createContext, useState, useEffect, useContext } from "react";

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
import HeartButton from "./components/HeartButton";
import WatchLaterButton from "./components/WatchLaterButton";
import { API_BASE_URL } from "./config";

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [query, setQuery] = useState("");
  return (
    <SearchContext.Provider value={{ query, setQuery }}>
      {children}
    </SearchContext.Provider>
  );
};

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
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerUrl, setTrailerUrl] = useState("");
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null); // Tracks which comment's menu is open
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");
  const [rating, setRating] = useState(0);
  const [editRating, setEditRating] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [favoriteMovieIds, setFavoriteMovieIds] = useState([]);
  const [watchLaterMovieIds, setWatchLaterMovieIds] = useState([]);
  const [sortOption, setSortOption] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const userId = localStorage.getItem("userEmail");

  useEffect(() => {
    const fetchData = async () => {
      if (!query.trim()) {
        setMovies([]); // or show trending/popular by default
        return;
      }

      let results = await fetchMovies(
        query,
        selectedGenre || null,
        selectedYear || null
      );

      // Apply sorting if needed
      switch (sortOption) {
        case "ratingDesc":
          results.sort((a, b) => b.vote_average - a.vote_average);
          break;
        case "ratingAsc":
          results.sort((a, b) => a.vote_average - b.vote_average);
          break;
        case "releaseDesc":
          results.sort(
            (a, b) => new Date(b.release_date) - new Date(a.release_date)
          );
          break;
        case "releaseAsc":
          results.sort(
            (a, b) => new Date(a.release_date) - new Date(b.release_date)
          );
          break;
      }

      setMovies(results);
    };

    fetchData();
  }, [query, selectedGenre, selectedYear, sortOption]);

  useEffect(() => {
    const loadGenres = async () => {
      try {
        const genreList = await fetchGenres(); // your API helper to get genres
        setGenres(genreList);
      } catch (error) {
        console.error("Failed to load genres:", error);
      }
    };

    loadGenres();
  }, []);

  const handleMovieClick = async (movie) => {
    const details = await fetchMovieDetails(movie.id);
    const trailer = await fetchMovieTrailer(movie.id);

    setSelectedMovie(details);
    setTrailerUrl(trailer);
    fetchComments(movie.id);
  };

  useEffect(() => {
    setQuery(queryFromURL); // sync state when URL changes
  }, [queryFromURL]);

  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      // Your API call here
      const response = await fetch(
        `https://api.example.com/search?query=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setResults(data.results || []);
    };

    fetchResults();
  }, [query]);

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

  const fetchComments = async (movieId) => {
    try {
      const response = await fetch(`http://localhost:3001/comments/${movieId}`);
      const commentsData = await response.json();
      setComments(commentsData);
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

  const closeModal = () => {
    setSelectedMovie(null);
    setTrailerUrl("");
  };

  // Fetch favorite and watch later data
  useEffect(() => {
    const fetchUserLists = async () => {
      try {
        const email = localStorage.getItem("userEmail");
        if (!email) return;

        const favResponse = await fetch(
          `${API_BASE_URL}/api/favourite/list/${email}`
        );
        const favData = await favResponse.json();
        setFavoriteMovieIds(favData.map((item) => item.movieId));

        const wlResponse = await fetch(
          `${API_BASE_URL}/api/watchlater/list/${email}`
        );
        const wlData = await wlResponse.json();
        setWatchLaterMovieIds(wlData.map((item) => item.movieId));
      } catch (error) {
        console.error("Error fetching user lists:", error);
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
        setFavoriteMovieIds((prev) => [...prev, movie.id]);
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
        setFavoriteMovieIds((prev) => prev.filter((id) => id !== movie.id));
        await fetch(
          `${API_BASE_URL}/api/favourite/${movie.id}?userId=${userId}`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    } catch (error) {
      console.error("Favorite toggle error:", error);
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
        setWatchLaterMovieIds((prev) => [...prev, movie.id]);
        await fetch(`${API_BASE_URL}/api/watchlater/add`, {
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
        setWatchLaterMovieIds((prev) => prev.filter((id) => id !== movie.id));
        await fetch(
          `${API_BASE_URL}/api/watchlater/${movie.id}?userId=${userId}`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    } catch (error) {
      console.error("Watch Later toggle error:", error);
      alert("Failed to update Watch Later. Please try again.");
    }
  };

  return (
    <>
      <Navbar onSearch={setQuery} />
      <div className="search-wrapper" style={{ padding: "1rem" }}>
        {/* Filter bar at the top */}
        <div
          className="filter-bar"
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            padding: "1rem",
            borderBottom: "1px solid #ccc",
            alignItems: "center",
          }}
        >
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
          >
            <option value="">All Genres</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            style={{ width: "100px" }}
          />

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="">Sort By</option>
            <option value="ratingDesc">Rating: High to Low</option>
            <option value="ratingAsc">Rating: Low to High</option>
            <option value="releaseDesc">Release Date: Newest</option>
            <option value="releaseAsc">Release Date: Oldest</option>
          </select>
        </div>

        {/* Movie grid with fixed card size */}
        <div
          className="movie-grid"
          style={{
            padding: "1rem",
            display: "grid",
            gap: "1.5rem",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 180px))",
            justifyContent: "center",
          }}
        >
          {movies.length > 0 ? (
            movies.map((movie) => (
              <div
                key={movie.id}
                className="movie-card"
                onClick={() => handleMovieClick(movie)}
                style={{ width: "180px", cursor: "pointer" }}
              >
                <img
                  src={
                    movie.poster_path
                      ? `${IMAGE_BASE_URL}${movie.poster_path}`
                      : "https://via.placeholder.com/300x400?text=No+Image"
                  }
                  alt={movie.title}
                  style={{
                    width: "180px",
                    height: "270px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
                <div
                  className="movie-title"
                  style={{ marginTop: "0.5rem", textAlign: "center" }}
                >
                  {movie.title}
                </div>
              </div>
            ))
          ) : (
            <p className="no-results">No movies found.</p>
          )}
        </div>
      </div>

      {selectedMovie && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closeModal}>
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
                      $isAdded={favoriteMovieIds.includes(selectedMovie.id)}
                      onClick={(e) => toggleFavorite(selectedMovie, e)}
                      title={
                        favoriteMovieIds.includes(selectedMovie.id)
                          ? "Remove from Favorites"
                          : "Add to Favorites"
                      }
                      color={
                        favoriteMovieIds.includes(selectedMovie.id)
                          ? "red"
                          : "white"
                      }
                    >
                      {favoriteMovieIds.includes(selectedMovie.id)
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
                      color={
                        watchLaterMovieIds.includes(selectedMovie.id)
                          ? "yellow"
                          : "white"
                      }
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
                <p>
                  <strong>Release Date:</strong>{" "}
                  {selectedMovie.release_date || "N/A"}
                </p>
                <p>
                  <strong>Runtime:</strong>{" "}
                  {selectedMovie.runtime
                    ? `${selectedMovie.runtime} min`
                    : "N/A"}
                </p>
                <p>
                  <strong>Rating:</strong>{" "}
                  {selectedMovie.vote_average
                    ? `${selectedMovie.vote_average}/10`
                    : "N/A"}
                </p>

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
                          className={`bi bi-star${
                            star <= rating ? "-fill" : ""
                          }`}
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
                            <div
                              className="d-flex justify-content-between align-items-center mb-1"
                              style={{ paddingRight: "20px" }}
                            >
                              <strong style={{ color: "#e5e5e5" }}>
                                {comment.user}
                              </strong>
                              <small
                                style={{ color: "white", fontSize: "0.75rem" }}
                              >
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
                                      className={`bi bi-star${
                                        star <= editRating ? "-fill" : ""
                                      }`}
                                      style={{
                                        cursor: "pointer",
                                        fontSize: "1.3rem",
                                      }}
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
                                      className={`bi bi-star${
                                        star <= comment.rating ? "-fill" : ""
                                      }`}
                                      style={{
                                        color: "#f5c518",
                                        marginRight: "2px",
                                      }}
                                    ></i>
                                  ))}
                                </div>

                                {/* Comment text */}
                                <p className="mb-0 text-light">
                                  {comment.text}
                                </p>
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
                                    onClick={() =>
                                      handleEditClick(comment._id, comment.text)
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
                      <p className="text-muted">
                        No comments yet. Be the first!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <footer className="landing-footer">
        <p>&copy; {new Date().getFullYear()} CineMatch. All rights reserved.</p>
        <div className="footer-links"></div>
      </footer>
    </>
  );
};

export default Search;
