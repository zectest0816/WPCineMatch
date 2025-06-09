import React, { useEffect, useState } from "react";
import {
  fetchGenres,
  fetchMovieDetails,
  fetchMovies,
  fetchMovieTrailer,
  IMAGE_BASE_URL,
} from "./api";
import Navbar from "./Navbar";
import HeartButton from "./components/HeartButton";
import WatchLaterButton from "./components/WatchLaterButton";
import { API_BASE_URL } from "./config";

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

  useEffect(() => {
    const loadInitialData = async () => {
      const genreList = await fetchGenres();
      setGenres(genreList);
      applyFilters();

      const userId = localStorage.getItem("userEmail");
      if (userId) {
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
      }
    };

    loadInitialData();
  }, []);

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

  const applyFilters = async () => {
    setLoading(true);
    const allMovies = await fetchMovies(
      "",
      selectedGenre,
      "",
      "popularity.desc"
    );

    const filtered = allMovies.filter((movie) => {
      const movieYear = movie.release_date?.split("-")[0];
      const matchesYear = releaseYear ? movieYear === releaseYear : true;
      const matchesRating = minRating
        ? movie.vote_average >= parseFloat(minRating)
        : true;
      return matchesYear && matchesRating;
    });

    setMovies(filtered.slice(0, 10));
    setLoading(false);
  };

  const showMovieDetails = async (movieId) => {
    const movie = await fetchMovieDetails(movieId);
    const trailer = await fetchMovieTrailer(movieId);
    setSelectedMovie(movie);
    setTrailerKey(trailer || "");
  };

  const closeModal = () => {
    setSelectedMovie(null);
  };

  <style>
    {`
  .landing-footer {
    background-color: #111;
    color: #aaa;
    text-align: center;
    padding: 2rem 1rem;
  }

`}
  </style>;

  return (
    <div
      style={{ backgroundColor: "#121212", minHeight: "100vh", color: "#fff" }}
    >
      <Navbar />

      <div
        style={{
          textAlign: "center",
          paddingTop: "80px",
          paddingInline: "20px",
        }}
      >
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
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "20px",
              maxWidth: "1200px",
              margin: "0 auto",
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
                  width: "220px",
                  height: "480px",
                  display: "flex",
                  flexDirection: "column",
                }}
                onClick={() => showMovieDetails(movie.id)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.03)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                <img
                  src={`${IMAGE_BASE_URL}${movie.poster_path}`}
                  alt={movie.title}
                  style={{
                    width: "200px",
                    height: "300px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    alignSelf: "center",
                  }}
                />
                <h3
                  style={{
                    color: "red",
                    fontSize: "18px",
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
                <p
                  style={{
                    margin: "8px 0",
                    fontSize: "16px",
                  }}
                >
                  {movie.release_date?.split("-")[0] || "N/A"} · ⭐{" "}
                  {movie.vote_average.toFixed(1)}
                </p>
                <p
                  style={{
                    fontSize: "14px",
                    marginTop: "5px",
                    marginBottom: "5px",
                    flex: "1",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: "3",
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {movie.genre_ids
                    .map(
                      (id) => genres.find((g) => g.id === id)?.name || "Unknown"
                    )
                    .join(", ")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Movie Details Modal - updated with buttons */}
      {selectedMovie && (
        <div
          className="modal-overlay"
          onClick={closeModal}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.8)",
            zIndex: 1000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#181818",
              borderRadius: "8px",
              width: "80%",
              maxWidth: "900px",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
            }}
          >
            <button
              className="close-button"
              onClick={closeModal}
              style={{
                position: "absolute",
                top: "15px",
                right: "15px",
                background: "none",
                border: "none",
                color: "white",
                fontSize: "24px",
                cursor: "pointer",
                zIndex: 1001,
              }}
            >
              ✖
            </button>

            <div className="modal-body" style={{ padding: "20px" }}>
              <div
                className="poster-section"
                style={{ display: "flex", flexDirection: "row", gap: "20px" }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <div className="poster-wrapper">
                    <img
                      src={
                        selectedMovie.poster_path
                          ? `${IMAGE_BASE_URL}${selectedMovie.poster_path}`
                          : "https://via.placeholder.com/300x400?text=No+Image"
                      }
                      alt={selectedMovie.title}
                      className="modal-poster"
                      style={{
                        width: "300px",
                        height: "400px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                  </div>
                  <div
                    className="top-buttons-wrapper"
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "10px",
                      marginTop: "10px",
                      marginLeft: "-230px",
                    }}
                  >
                    <HeartButton
                      $isAdded={favouriteMovieIds.includes(selectedMovie.id)}
                      onClick={(e) => toggleFavourite(selectedMovie, e)}
                      title={
                        favouriteMovieIds.includes(selectedMovie.id)
                          ? "Remove from Favorites"
                          : "Add to Favorites"
                      }
                      color={
                        favouriteMovieIds.includes(selectedMovie.id)
                          ? "red"
                          : "white"
                      }
                    >
                      {favouriteMovieIds.includes(selectedMovie.id)
                        ? "❤️"
                        : "🤍"}
                    </HeartButton>
                    <WatchLaterButton
                      style={{
                        position: "relative",
                        top: "-14px",
                        left: "-15px",
                      }}
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
                <div className="modal-info" style={{ flex: 1 }}>
                  <h2 style={{ color: "white", marginBottom: "15px" }}>
                    {selectedMovie.title}
                  </h2>
                  <p style={{ color: "white", marginBottom: "15px" }}>
                    {selectedMovie.overview}
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: "10px",
                      marginBottom: "20px",
                    }}
                  >
                    <p style={{ color: "white" }}>
                      <strong>Release Date:</strong>{" "}
                      {selectedMovie.release_date || "N/A"}
                    </p>
                    <p style={{ color: "white" }}>
                      <strong>Rating:</strong>{" "}
                      {selectedMovie.vote_average
                        ? `${selectedMovie.vote_average}/10`
                        : "N/A"}
                    </p>
                    <p style={{ color: "white" }}>
                      <strong>Runtime:</strong>{" "}
                      {selectedMovie.runtime
                        ? `${selectedMovie.runtime} min`
                        : "N/A"}
                    </p>
                    <p style={{ color: "white" }}>
                      <strong>Genres:</strong>{" "}
                      {selectedMovie.genres?.map((g) => g.name).join(", ")}
                    </p>
                  </div>

                  {trailerKey && (
                    <div className="trailer" style={{ marginTop: "20px" }}>
                      <iframe
                        width="100%"
                        height="300"
                        src={`https://www.youtube.com/embed/${trailerKey}`}
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
        </div>
      )}
      <footer className="landing-footer">
        <p>&copy; {new Date().getFullYear()} CineMatch. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Trending;
