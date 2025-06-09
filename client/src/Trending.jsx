import { debounce } from "lodash";
import { useCallback, useEffect, useState } from "react";
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

const PageContainer = styled.div`
  background-color: #121212;
  min-height: 100vh;
  color: #fff;
  padding-bottom: 40px;
`;

const Title = styled.h2`
  color: #ffffff;
  font-weight: bold;
  font-size: 2.5rem;
  text-transform: uppercase;
  letterSpacing: 1px;
  text-shadow: 0 0 5px #e50914, 0 0 10px #ff0a16, 0 0 15px #ff4c4c;
  margin-bottom: 40px;
  text-align: center;
`;

const FilterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  max-width: 800px;
  margin: 0 auto 24px auto;
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: center;
  }
`;

const FilterSelect = styled.select`
  padding: 12px 16px;
  border-radius: 24px;
  border: 1px solid #444;
  background-color: #222;
  color: #fff;
  width: 160px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  &:focus {
    border-color: #e50914;
    box-shadow: 0 0 0 3px rgba(229, 9, 20, 0.3);
  }
`;

const FilterInput = styled.input`
  padding: 12px 16px;
  border-radius: 24px;
  border: 1px solid #444;
  background-color: #222;
  color: #fff;
  width: 160px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  &:focus {
    border-color: #e50914;
    box-shadow: 0 0 0 3px rgba(229, 9, 20, 0.3);
  }
`;

const FilterButton = styled.button`
  padding: 12px 24px;
  background-color: #e50914;
  color: #fff;
  border: none;
  border-radius: 24px;
  font-weight: 600;
  cursor: pointer;
  width: 160px;
  transition: background-color 0.2s, outline 0.2s;
  &:hover {
    background-color: #ff1a24;
  }
  &:focus {
    outline: 2px solid #ffffff;
    outline-offset: 2px;
  }
`;


const MovieContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 12px 0;
  padding: 16px;
  background: linear-gradient(145deg, #1e1e1e, #141414);
  border: 1px solid #333;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  cursor: pointer;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.5);
  }
`;

const RankBadge = styled.div`
  background-color: #e50914;
  color: #fff;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  margin-right: 12px;
  flex-shrink: 0;
  @media (max-width: 600px) {
    width: 28px;
    height: 28px;
    font-size: 0.9rem;
  }
`;

const MovieImage = styled.img`
  width: 100px;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 16px;
  @media (max-width: 600px) {
    width: 80px;
    height: 120px;
  }
`;

const MovieInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MovieTitle = styled.h3`
  color: #ffffff;
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MovieDetails = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #d1d1d1;
`;

const Revenue = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #4caf50;
  font-weight: 500;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: #1a1a1a;
  border-radius: 12px;
  max-width: 900px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 20px;
  position: relative;
  .modal-header {
    position: sticky;
    top: 0;
    background-color: #1a1a1a;
    z-index: 10;
    padding: 10px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  @media (max-width: 768px) {
    width: 95%;
    .modal-body {
      flex-direction: column;
    }
    .modal-poster {
      max-width: 100%;
      height: auto;
    }
  }
`;

const CommentList = styled.div`
  max-height: 200px;
  overflow-y: auto;
  margin-top: 16px;
`;

const CommentItem = styled.div`
  display: flex;
  margin-bottom: 16px;
  padding: 16px;
  background-color: #1f1f1f;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  position: relative;
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

  const fetchComments = useCallback(async (movieId) => {
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
  }, []);

  const toggleMenu = useCallback((id) => {
    setActiveMenu(activeMenu === id ? null : id);
  }, [activeMenu]);

  const handleEditClick = useCallback((id, text, rating) => {
    setEditingCommentId(id);
    setEditText(text);
    setEditRating(rating);
    setActiveMenu(null);
  }, []);

  const handleEditSave = useCallback(async (id) => {
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
  }, [editText, editRating, selectedMovie, fetchComments]);

  const handleDelete = useCallback(async (id) => {
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
  }, [selectedMovie, fetchComments]);

  const toggleFavourite = useCallback(async (movie, event) => {
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
  }, [favouriteMovieIds, userId, navigate]);

  const toggleWatchLater = useCallback(async (movie, event) => {
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
  }, [watchLaterMovieIds, userId, navigate]);

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

  const applyFilters = useCallback(async () => {
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
  }, [selectedGenre, releaseYear, minRating]);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      const genreList = await fetchGenres();
      setGenres(genreList);
      await applyFilters();
      setLoading(false);
    };
    loadInitialData();
  }, [applyFilters]);

  useEffect(() => {
    const debouncedApplyFilters = debounce(applyFilters, 500);
    debouncedApplyFilters();
    return () => debouncedApplyFilters.cancel();
  }, [selectedGenre, releaseYear, minRating, applyFilters]);

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
  }, [userId]);

  const formatRevenue = (revenue) => {
    if (!revenue) return "N/A";
    if (revenue >= 1000000000)
      return `$${(revenue / 1000000000).toFixed(1)}B`;
    if (revenue >= 1000000) return `$${(revenue / 1000000).toFixed(1)}M`;
    if (revenue >= 1000) return `$${(revenue / 1000).toFixed(1)}K`;
    return `$${revenue}`;
  };

  const showMovieDetails = useCallback(async (movieId) => {
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
  }, [fetchComments]);

  const averageRating = comments.length
    ? (comments.reduce((sum, c) => sum + c.rating, 0) / comments.length).toFixed(1)
    : "N/A";

  return (
    <PageContainer>
      <Navbar className="navbar navbar-dark bg-black border-bottom border-secondary px-3">
        <a className="navbar-brand fw-bold fs-3 text-danger" href="#">
          🎬 MovieExplorer
        </a>
        <button
          className="btn btn-outline-light ms-auto"
          onClick={() => navigate("/search")}
          aria-label="Search movies"
        >
          🔍 Search
        </button>
      </Navbar>

      <div style={{ paddingTop: "80px", paddingInline: "20px" }}>
        <Title>🔥 Top 10 Trending Movies</Title>

        <FilterContainer>
          <FilterSelect
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            aria-label="Select genre"
          >
            <option value="">All Genres</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </FilterSelect>

          <FilterInput
            type="number"
            placeholder="Release Year"
            value={releaseYear}
            onChange={(e) => setReleaseYear(e.target.value)}
            aria-label="Enter release year"
          />

          <FilterInput
            type="number"
            placeholder="Min Rating"
            step="0.1"
            min="0"
            max="10"
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            aria-label="Enter minimum rating"
          />

          <FilterButton onClick={applyFilters} aria-label="Apply movie filters">
            Apply Filters
          </FilterButton>
        </FilterContainer>

        {loading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              maxWidth: "800px",
              margin: "0 auto",
              padding: "0 10px",
            }}
          >
            {movies.map((movie, index) => (
              <MovieContainer
                key={movie.id}
                onClick={() => showMovieDetails(movie.id)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => e.key === "Enter" && showMovieDetails(movie.id)}
                aria-label={`View details for ${movie.title}, ranked ${index + 1}`}
              >
                <RankBadge aria-hidden="true">{index + 1}</RankBadge>
                <MovieImage
                  src={
                    movie.poster_path
                      ? `${IMAGE_BASE_URL}${movie.poster_path}`
                      : "https://via.placeholder.com/100x150?text=No+Image"
                  }
                  alt={movie.title}
                  loading="lazy"
                />
                <MovieInfo>
                  <MovieTitle>{movie.title}</MovieTitle>
                  <MovieDetails>
                    {movie.release_date?.split("-")[0] || "N/A"} · ⭐{" "}
                    {movie.vote_average?.toFixed(1) || "N/A"}
                  </MovieDetails>
                  <Revenue>💰 {formatRevenue(movie.revenue)}</Revenue>
                </MovieInfo>
              </MovieContainer>
            ))}
          </div>
        )}
      </div>

      {selectedMovie && (
        <ModalOverlay
          onClick={() => {
            setSelectedMovie(null);
            setTrailerKey("");
          }}
          role="dialog"
          aria-labelledby="modal-title"
        >
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 id="modal-title" style={{ fontSize: "2rem", margin: 0 }}>
                {selectedMovie.title}
              </h2>
              <button
                className="close-button"
                onClick={() => {
                  setSelectedMovie(null);
                  setTrailerKey("");
                }}
                aria-label="Close modal"
                style={{
                  background: "none",
                  border: "none",
                  color: "#fff",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                }}
              >
                ✖
              </button>
            </div>
            <div
              className="modal-body"
              style={{ display: "flex", gap: "20px", padding: "20px" }}
            >
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
              <div className="modal-info" style={{ flex: 1 }}>
                <p style={{ color: "#d1d1d1", marginBottom: "16px" }}>
                  {selectedMovie.overview}
                </p>
                <div
                  className="movie-details-grid"
                  style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}
                >
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
                  <p>
                    <strong>Average User Rating:</strong> {averageRating}/5
                  </p>
                </div>
                {trailerKey ? (
                  <div className="trailer" style={{ marginTop: "20px" }}>
                    <iframe
                      width="100%"
                      height="300"
                      src={`https://www.youtube.com/embed/${trailerKey}`}
                      frameBorder="0"
                      allowFullScreen
                      title="Movie Trailer"
                    ></iframe>
                  </div>
                ) : (
                  <div style={{ marginTop: "20px", textAlign: "center" }}>
                    <img
                      src="https://via.placeholder.com/300x200?text=No+Trailer+Available"
                      alt="No trailer available"
                      style={{ maxWidth: "100%", borderRadius: "8px" }}
                    />
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
          </ModalContent>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

export default Trending;