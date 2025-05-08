import React, { useEffect, useState } from "react";
import { fetchGenres, fetchMovieDetails, fetchMovies, fetchMovieTrailer, IMAGE_BASE_URL } from "./api";
import Navbar from "./Navbar";

const Trending = () => {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [minRating, setMinRating] = useState("");
  const [loading, setLoading] = useState(false);
  // New state variables for movie details functionality
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState("");

  useEffect(() => {
    const loadInitialData = async () => {
      const genreList = await fetchGenres();
      setGenres(genreList);
      applyFilters();
    };

    loadInitialData();
  }, []);

  const applyFilters = async () => {
    setLoading(true);
    const allMovies = await fetchMovies("", selectedGenre, "", "popularity.desc");
  
    const filtered = allMovies.filter((movie) => {
      const movieYear = movie.release_date?.split("-")[0];
      const matchesYear = releaseYear ? movieYear === releaseYear : true;
      const matchesRating = minRating ? movie.vote_average >= parseFloat(minRating) : true;
      return matchesYear && matchesRating;
    });
  
    setMovies(filtered.slice(0, 10));
    setLoading(false);
  };
  
  // New function to show movie details
  const showMovieDetails = async (movieId) => {
    const movie = await fetchMovieDetails(movieId);
    const trailer = await fetchMovieTrailer(movieId);
    setSelectedMovie(movie);
    setTrailerKey(trailer || "");
  };

  return (
    <div style={{ backgroundColor: "#121212", minHeight: "100vh", color: "#fff" }}>
      <Navbar />

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

        {/* Filter bar - centered */}
        <div style={{ 
          display: "flex", 
          flexWrap: "wrap", 
          gap: "10px", 
          marginBottom: "30px",
          justifyContent: "center", // Center horizontally
          maxWidth: "800px", // Optional: limit max width
          margin: "0 auto 30px auto" // Center the container itself
        }}>
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
              outline: "none"
            }}
          >
            <option value="">All Genres</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>{genre.name}</option>
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
              outline: "none"
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
              outline: "none"
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
              width: "180px"
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
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "20px",
              maxWidth: "1200px",
              margin: "0 auto"
            }}
          >
            {movies.map((movie) => (
              <div
                key={movie.id}
                style={{
                  backgroundColor: "#1e1e1e",
                  borderRadius: "12px",
                  padding: "10px",
                  textAlign: "center",
                  color: "#fff",
                  transition: "transform 0.2s",
                  cursor: "pointer",
                  width: "220px", // Fixed width
                  height: "480px", // Increased height to accommodate all content
                  display: "flex",
                  flexDirection: "column"
                }}
                onClick={() => showMovieDetails(movie.id)}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <img
                  src={`${IMAGE_BASE_URL}${movie.poster_path}`}
                  alt={movie.title}
                  style={{
                    width: "200px",
                    height: "300px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    alignSelf: "center"
                  }}
                />
                <h3 style={{ 
                  color: "red",
                  fontSize: "18px",
                  marginTop: "10px",
                  minHeight: "50px", // Minimum height for title
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: "2",
                  WebkitBoxOrient: "vertical"
                }}>
                  {movie.title}
                </h3>
                <p style={{
                  margin: "8px 0",
                  fontSize: "16px"
                }}>
                  {movie.release_date?.split("-")[0] || "N/A"} · ⭐{" "}
                  {movie.vote_average.toFixed(1)}
                </p>
                <p style={{ 
                  fontSize: "14px",
                  marginTop: "5px",
                  marginBottom: "5px",
                  flex: "1", // Take remaining space
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: "3", // Allow up to 3 lines
                  WebkitBoxOrient: "vertical"
                }}>
                  {movie.genre_ids
                    .map((id) => genres.find((g) => g.id === id)?.name || "Unknown")
                    .join(", ")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Movie Details Modal - add this from Home.jsx */}
      {selectedMovie && (
        <div className="modal fade show" style={{ display: "block" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content bg-dark text-white">
              <div className="modal-header border-secondary">
                <h5 className="modal-title">{selectedMovie.title}</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedMovie(null)} // Close modal
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
                  <div className="mt-3">
                    {trailerKey ? (
                      <iframe
                        width="100%"
                        height="300"
                        src={`https://www.youtube.com/embed/${trailerKey}`}
                        frameBorder="0"
                        allowFullScreen
                        title="Trailer"
                      ></iframe>
                    ) : (
                      <p>No trailer available.</p>
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