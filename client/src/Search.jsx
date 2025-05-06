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

  const [query, setQuery] = useState(queryFromURL);
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedRating, setSelectedRating] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerUrl, setTrailerUrl] = useState("");

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
    setSelectedMovie(details);
    setTrailerUrl(trailer);
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
