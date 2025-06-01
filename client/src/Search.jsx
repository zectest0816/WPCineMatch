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
import HeartButton from './components/HeartButton';
import WatchLaterButton from './components/WatchLaterButton';
import { API_BASE_URL } from './config';

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
  const [rating, setRating] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerUrl, setTrailerUrl] = useState("");
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [favoriteMovieIds, setFavoriteMovieIds] = useState([]);
  const [watchLaterMovieIds, setWatchLaterMovieIds] = useState([]);
  const [sortOption, setSortOption] = useState("");
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);

useEffect(() => {
  const fetchData = async () => {
    if (!query.trim()) {
      setMovies([]); // or show trending/popular by default
      return;
    }

    let results = await fetchMovies(query, selectedGenre || null, selectedYear || null);

    // Apply sorting if needed
    switch (sortOption) {
      case "ratingDesc":
        results.sort((a, b) => b.vote_average - a.vote_average);
        break;
      case "ratingAsc":
        results.sort((a, b) => a.vote_average - b.vote_average);
        break;
      case "releaseDesc":
        results.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
        break;
      case "releaseAsc":
        results.sort((a, b) => new Date(a.release_date) - new Date(b.release_date));
        break;
    }

    setMovies(results);
  };

  fetchData();
}, [query, selectedGenre, selectedYear, sortOption]);

useEffect(() => {
  const loadGenres = async () => {
    try {
      const genreList = await fetchGenres();  // your API helper to get genres
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
    const response = await fetch(`http://localhost:3001/comments/${movie.id}`);
    const commentsData = await response.json();

    setSelectedMovie(details);
    setTrailerUrl(trailer);
    setComments(commentsData);
  };

  
useEffect(() => {
  setQuery(queryFromURL); // sync state when URL changes
}, [queryFromURL]);

useEffect(() => {
  if (!query) return;

const fetchResults = async () => {
      // Your API call here
      const response = await fetch(`https://api.example.com/search?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      setResults(data.results || []);
    };

    fetchResults();
  }, [query]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const response = await fetch("http://localhost:3001/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

  // Fetch favorite and watch later data
  useEffect(() => {
    const fetchUserLists = async () => {
      try {
        const email = localStorage.getItem("userEmail");
        if (!email) return;

        const favResponse = await fetch(`${API_BASE_URL}/api/favourite/list/${email}`);
        const favData = await favResponse.json();
        setFavoriteMovieIds(favData.map(item => item.movieId));

        const wlResponse = await fetch(`${API_BASE_URL}/api/watchlater/list/${email}`);
        const wlData = await wlResponse.json();
        setWatchLaterMovieIds(wlData.map(item => item.movieId));
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
        setFavoriteMovieIds(prev => prev.filter(id => id !== movie.id));
        await fetch(`${API_BASE_URL}/api/favourite/${movie.id}?userId=${userId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
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
        setWatchLaterMovieIds(prev => [...prev, movie.id]);
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
        setWatchLaterMovieIds(prev => prev.filter(id => id !== movie.id));
        await fetch(`${API_BASE_URL}/api/watchlater/${movie.id}?userId=${userId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
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
        style={{ width: "100px" }}
      />
      

      <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
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
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 180px))", // fixed width columns
        justifyContent: "center", // center the grid if fewer items
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
              src={movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : "https://via.placeholder.com/300x400?text=No+Image"}
              alt={movie.title}
              style={{
                width: "180px",
                height: "270px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
            <div className="movie-title" style={{ marginTop: "0.5rem", textAlign: "center" }}>{movie.title}</div>
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
          <button className="close-button" onClick={closeModal}>✖</button>
          <div className="modal-body">
            <div className="poster-section">
              <div className="poster-wrapper">
                <img
                  src={selectedMovie.poster_path ? `${IMAGE_BASE_URL}${selectedMovie.poster_path}` : "https://via.placeholder.com/300x400?text=No+Image"}
                  alt={selectedMovie.title}
                  className="modal-poster"
                />
                <div className="top-buttons-wrapper">
                  <HeartButton
                    $isAdded={favoriteMovieIds.includes(selectedMovie.id)}
                    onClick={(e) => toggleFavorite(selectedMovie, e)}
                    title={favoriteMovieIds.includes(selectedMovie.id) ? "Remove from Favorites" : "Add to Favorites"}
                    color={favoriteMovieIds.includes(selectedMovie.id) ? "red" : "white"}
                  >
                    {favoriteMovieIds.includes(selectedMovie.id) ? '❤️' : '🤍'}
                  </HeartButton>
                  <WatchLaterButton
                    $isAdded={watchLaterMovieIds.includes(selectedMovie.id)}
                    onClick={(e) => toggleWatchLater(selectedMovie, e)}
                    title={watchLaterMovieIds.includes(selectedMovie.id) ? "Remove from Watch Later" : "Add to Watch Later"}
                    color={watchLaterMovieIds.includes(selectedMovie.id) ? "yellow" : "white"}
                  >
                    {watchLaterMovieIds.includes(selectedMovie.id) ? '★' : '☆'}
                  </WatchLaterButton>
                </div>
              </div>
            </div>
            <div className="modal-info">
              <h2>{selectedMovie.title}</h2>
              <p>{selectedMovie.overview}</p>
              <p><strong>Release Date:</strong> {selectedMovie.release_date || 'N/A'}</p>
              <p><strong>Runtime:</strong> {selectedMovie.runtime ? `${selectedMovie.runtime} min` : 'N/A'}</p>
              <p><strong>Rating:</strong> {selectedMovie.vote_average ? `${selectedMovie.vote_average}/10` : 'N/A'}</p>

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
                      <div key={idx} className="d-flex mb-3 p-3 rounded" style={{ backgroundColor: "#1f1f1f", boxShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
                        <div className="flex-shrink-0 bg-danger text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: "45px", height: "45px", fontSize: "1.1rem", fontWeight: "600" }}>
                          {comment.user.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <strong style={{ color: "#e5e5e5" }}>{comment.user}</strong>
                            <small className="text-muted">{new Date(comment.createdAt).toLocaleString()}</small>
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
  </>
);
};

export default Search;
