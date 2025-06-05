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
  width: 150px; // Fixed width
`;

const MovieCard = styled.div`
  cursor: pointer;
  border-radius: 10px;
  overflow: hidden;
  transition: transform 0.3s ease;
  background-color: #141414;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
  height: 225px; // Fixed height to maintain aspect ratio
  width: 150px; // Fixed width

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
  const [currentSort, setCurrentSort] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
      setSelectedMovie(null);
    } catch (error) {
      console.error("Error removing favourite:", error);
    }
  };

  const groupByGenre = (movies) => {
    const grouped = {};
    movies.forEach((movie) => {
      if (Array.isArray(movie.genres) && movie.genres.length > 0) {
          movie.genres.forEach((genre) => {
              const genreName = genre.name;
              if (!grouped[genreName]) grouped[genreName] = [];
              grouped[genreName].push(movie);
          });
      } else {
          if (!grouped["No Genre"]) grouped["No Genre"] = [];
          grouped["No Genre"].push(movie);
      }
    });
    return grouped;
  };


  useEffect(() => {
    const fetchFavouriteMovies = async () => {
      if (!email) return;
      setIsLoading(true);

      try {
        const response = await fetch(
          `http://localhost:3001/api/favourite/list/${email}`
        );
        if (!response.ok) throw new Error("Failed to fetch favourites");
        const favouriteData = await response.json();

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
      }finally {
        setIsLoading(false);
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
  const searchInFavourites = async (userId, query) => {
    if (!userId) {
        alert("You must be logged in to search your favourites.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/favourite/list/${userId}`);
        if (!response.ok) throw new Error("Failed to fetch favourites");
        
        const favouriteData = await response.json();
        
        const filteredMovies = favouriteMovies.filter(movie => 
            movie.title.toLowerCase().includes(query.toLowerCase())
        );
        
        setFavouriteMovies(filteredMovies);
        setGroupedMovies(groupByGenre(filteredMovies));
        setSearchQuery(query);
    } catch (error) {
        console.error("Search error:", error);
        alert("Failed to search favourites.");
    }
};

  const sortFavourites = async (userId, sortBy) => {
      if (!userId) {
          alert("You must be logged in to sort your favourites.");
          return;
      }

      try {
          const response = await fetch(`${API_BASE_URL}/api/favourite/list/${userId}`);
          if (!response.ok) throw new Error("Failed to fetch favourites");
          
          let favouriteData = await response.json();
          
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

        let sortedMovies = [...moviesWithDetails];
        switch (sortBy) {
            case 'rating':
                sortedMovies.sort((a, b) => b.vote_average - a.vote_average);
                break;
            case 'releaseDate':
                sortedMovies.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
                break;
            case 'title':
                sortedMovies.sort((a, b) => a.title.localeCompare(b.title));
                break;
            default:
                break;
        }

        setFavouriteMovies(sortedMovies);
        setGroupedMovies(groupByGenre(sortedMovies));
    } catch (error) {
        console.error("Sorting error:", error);
        alert("Failed to sort favourites.");
    }
};
     
     const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      applySort(currentSort, favouriteMovies);
      return;
    }

    const filteredMovies = favouriteMovies.filter(movie => 
      movie.title.toLowerCase().includes(query.toLowerCase())
    );
    
    applySort(currentSort, filteredMovies);
  };

  const applySort = (sortBy, moviesToSort = favouriteMovies) => {
    setCurrentSort(sortBy);
    
    let sortedMovies = [...moviesToSort];
    
    switch (sortBy) {
      case 'rating':
        sortedMovies.sort((a, b) => b.vote_average - a.vote_average);
        break;
      case 'releaseDate':
        sortedMovies.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
        break;
      case 'title':
        sortedMovies.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    setGroupedMovies(groupByGenre(sortedMovies));
  };

  const handleSort = (sortBy) => {
    const moviesToSort = searchQuery 
      ? favouriteMovies.filter(movie => 
          movie.title.toLowerCase().includes(searchQuery.toLowerCase()))
      : [...favouriteMovies];
    
    applySort(sortBy, moviesToSort);
  };

  const fetchFavouriteMovies = async () => {
    if (!email) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/favourite/list/${email}`);
      if (!response.ok) throw new Error("Failed to fetch favourites");
      const favouriteData = await response.json();

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
    } finally {
      setIsLoading(false);
    }
  };

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

      <div className="container mb-4 bg-black rounded p-4">
      <div className="row justify-content-center">
        <div className="col-md-7 d-flex justify-content-center mb-2">
          <div className="input-group w-100">
            <input
              type="text"
              className="form-control bg-dark text-white border-secondary"
              placeholder="Search in your favourites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
            />
            <button 
              className="btn btn-outline-danger" 
              onClick={() => handleSearch(searchQuery)}
            >
              Search
            </button>
          </div>
        </div>
        <div className="col-md-2 d-flex mb-2">
          <select 
            className="form-select bg-dark text-white border-secondary"
            value={currentSort}
            onChange={(e) => handleSort(e.target.value)}
          >
            <option value="">Sort by...</option>
            <option value="rating">Rating</option>
            <option value="releaseDate">Release Date</option>
            <option value="title">Title</option>
          </select>
        </div>
      </div>
    </div>

      <div className="container mt-5">
      {favouriteMovies.length === 0 ? (
        <p className="text-white text-center">Your favourite list is empty</p>
      ) : (
        Object.entries(groupedMovies).map(([genre, movies]) => (
          <GenreGroup key={genre}>
            <h3 className="text-white mb-3">{genre}</h3>
            <div className="movie-row d-flex flex-wrap">
              {movies.map((movie) => (
                <MovieContainer key={movie.id} className="mb-4 mx-2">
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
                  <p>
                    <strong>Genres:</strong> {selectedMovie.genres?.map(g => g.name).join(', ') || 'N/A'}
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
