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

const HeartButton = styled.button`
  position: absolute;
  top: 8px;
  left: 8px;
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: ${props => props.$isAdded ? "red" : "white"};
  z-index: 2;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    color: red;
    
    &::before {
      content: "${props => props.$isAdded ? 'Remove from Favourites' : 'Add to Favourites'}";
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
      white-space: nowrap;
      pointer-events: none;
    }
  }
`;

const WatchLaterButton = styled.button`
  position: absolute;
  top: 1px;
  right: 8px;
  background: transparent;
  border: none;
  font-size: 2rem;
  color: ${props => props.$isAdded ? "gold" : "white"};
  z-index: 2;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    color: gold;
    
    &::before {
      content: "Remove from Favorites";
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
      white-space: nowrap;
      pointer-events: none;
    }
  }
`;


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
  background: linear-gradient(to top, rgba(20, 20, 20, 0.9), rgba(20, 20, 20, 0));
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

const FavouriteList = () => {
  const [favourites, setFavourites] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState("");
  const [groupedMovies, setGroupedMovies] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const email = localStorage.getItem("userEmail");

  const FavouriteList = () => {
    // Add trailerKey to existing state
    const [trailerKey, setTrailerKey] = useState("");
  
    // Update showMovieDetails to match WatchLaterList's version
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
  }

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
    const fetchFavourites = async () => {
      if (!email) return;

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

        setFavourites(moviesWithDetails);
        setGroupedMovies(groupByGenre(moviesWithDetails));
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchFavourites();
  }, [email]);

  const handleRemoveFavourite = async (movieId) => {
    if (!email) {
      alert("You must be logged in to modify favorites.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3001/api/favourite/${movieId}?userId=${email}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Failed to remove movie");

      setFavourites((prev) => prev.filter((movie) => movie.id !== movieId));
      setGroupedMovies(groupByGenre(favourites.filter((movie) => movie.id !== movieId)));
    } catch (error) {
      console.error("Error removing favorite:", error);
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

      <div className="container">
      <div className="row">
        <div className="col-12">
        <h1 className="text-center text-white mb-4 fw-bold" style={{ marginTop: '100px' }}>
           ❤️ My Favourite Movies
        </h1>
        </div>
      </div>
    </div>
      

      <div className="container mt-5">
        {favourites.length === 0 ? (
          <p className="text-white text-center">Your favorites list is empty</p>
        ) : (
          Object.entries(groupedMovies).map(([genre, movies]) => (
            <GenreGroup key={genre}>
              <h3 className="text-white mb-3">{genre} Favorites</h3>
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
                      </MovieCard>
                    </MovieContainer>
                  ))}
              </div>
            </GenreGroup>
          ))
        )}
      </div>

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
                <div style={{ position: 'relative' }}>
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
                  <HeartButton
                    $isAdded={true}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFavourite(selectedMovie.id);
                    }}
                  >
                    ❤️
                  </HeartButton>
                  <WatchLaterButton
                    $isAdded={true}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFavourite(selectedMovie.id);
                    }}
                  >
                    ★
                  </WatchLaterButton>
                </div>
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

export default FavouriteList;
         