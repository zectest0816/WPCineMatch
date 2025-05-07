import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import {
  fetchMovieDetails,
  fetchMovieTrailer,
  IMAGE_BASE_URL,
} from "./api.js";

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

const RemoveButton = styled.button`
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  color: white;
  font-size: 1.5rem;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  text-align: center;
  line-height: 32px;
  cursor: pointer;
  z-index: 2;

  &:hover {
    background: rgba(255, 0, 0, 0.8);
  }
`;

const GenreGroup = styled.div`
  margin-bottom: 40px;
`;

const genres = [
  { id: 28, name: "Action" },
  { id: 35, name: "Comedy" },
  { id: 27, name: "Horror" },
  { id: 10749, name: "Romance" },
  { id: 16, name: "Animation" },
];

const WatchLaterList = () => {
  const [watchLater, setWatchLater] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState("");
  const [groupedMovies, setGroupedMovies] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const email = localStorage.getItem("userEmail");

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
    const fetchWatchLaterMovies = async () => {
      if (!email) return;

      try {
        const response = await fetch(
          `http://localhost:3001/api/watchlater/list/${email}`
        );
        if (!response.ok) throw new Error("Failed to fetch watch later");
        
        const watchLaterData = await response.json();
        
        // Fetch complete movie details for each watch later item
        const moviesWithDetails = await Promise.all(
          watchLaterData.map(async (item) => {
            const details = await fetchMovieDetails(item.movieId);
            return {
              ...item,
              ...details,
              genres: details.genres || [],
            };
          })
        );

        setWatchLater(moviesWithDetails);
        setGroupedMovies(groupByGenre(moviesWithDetails));
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchWatchLaterMovies();
  }, [email]);

  const handleRemoveWatchLater = async (movieId) => {
    if (!email) {
      alert("You must be logged in to modify Watch Later list.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3001/api/watchlater/${movieId}?userId=${email}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Failed to remove movie");

      setWatchLater((prev) => prev.filter((movie) => movie.id !== movieId));
      setGroupedMovies(groupByGenre(watchLater.filter((movie) => movie.id !== movieId)));
    } catch (error) {
      console.error("Error removing watch later:", error);
    }
  };

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

      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control bg-dark text-light"
              placeholder="Search your watch later..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="container mt-5">
        {watchLater.length === 0 ? (
          <p className="text-white text-center">Your watch later list is empty</p>
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
                        <RemoveButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveWatchLater(movie.id);
                          }}
                        >
                          −
                        </RemoveButton>
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
        <div className="modal fade show" style={{ display: "block" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content bg-dark text-white">
              <div className="modal-header border-secondary">
                <h5 className="modal-title">{selectedMovie.title}</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedMovie(null)}
                ></button>
              </div>
              <div className="modal-body d-flex flex-column flex-md-row gap-3">
                <img
                  src={
                    selectedMovie.poster_path
                      ? `${IMAGE_BASE_URL}${selectedMovie.poster_path}`
                      : "https://via.placeholder.com/300x400?text=No+Image"
                  }
                  className="img-fluid"
                  style={{ maxWidth: "300px", borderRadius: "8px" }}
                  alt="Movie Poster"
                />
                <div>
                  <p>{selectedMovie.overview}</p>
                  <p>
                    <strong>Release Date:</strong> {selectedMovie.release_date}
                  </p>
                  <p>
                    <strong>Rating:</strong> {selectedMovie.vote_average}
                  </p>
                  {trailerKey && (
                    <iframe
                      width="100%"
                      height="300"
                      src={`https://www.youtube.com/embed/${trailerKey}`}
                      frameBorder="0"
                      allowFullScreen
                      title="Trailer"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WatchLaterList;