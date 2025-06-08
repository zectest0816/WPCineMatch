import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./styles/landing.css";
import bgImage from "./assets/198b2f01e73b905772279616eccc7c65.jpg";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const Landing = () => {
  const navigate = useNavigate();
  const [topMovies, setTopMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const suggestedRef = useRef();
  const [isVisible, setIsVisible] = useState(false);

  // Scroll reveal effect for Suggested Picks
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setIsVisible(true),
      { threshold: 0.2 }
    );

    if (suggestedRef.current) observer.observe(suggestedRef.current);

    return () =>
      suggestedRef.current && observer.unobserve(suggestedRef.current);
  }, []);

  // Fetch top-rated movies
  useEffect(() => {
    fetch(
      `https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}&language=en-US&page=1`
    )
      .then((res) => res.json())
      .then((data) => {
        setTopMovies(data.results.slice(0, 10));
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching top-rated movies:", error);
        setLoading(false);
      });
  }, []);

  return (
    <motion.div
      className="landing-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* HERO SECTION */}
      <div
        className="landing-hero"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="overlay" />
        <motion.nav
          className="nav-bar"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h2 className="brand">🎬 CineMatch</h2>
          <motion.button
            className="btn-signin"
            whileHover={{ scale: 1.1 }}
            onClick={() => navigate("/login")}
          >
            Sign In
          </motion.button>
        </motion.nav>

        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="headline">Unlimited Movies, TV Shows & More</h1>
          <p className="subheadline">Stream anywhere. Cancel anytime.</p>
          <motion.button
            className="btn-get-started"
            whileHover={{ scale: 1.1 }}
            onClick={() => navigate("/login")}
          >
            Get Started
          </motion.button>
        </motion.div>
      </div>

      {/* SUGGESTED PICKS */}
      <motion.div
        ref={suggestedRef}
        className={`suggested-section ${isVisible ? "visible" : ""}`}
      >
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          Suggested Picks
        </motion.h2>
        <div className="carousel">
          {loading ? (
            <p className="loading-text">Loading movies...</p>
          ) : (
            topMovies.map((movie) => (
              <motion.div
                key={movie.id}
                className="movie-item"
                whileHover={{ scale: 1.1 }}
              >
                <img
                  src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                  alt={movie.title}
                />
                <p className="movie-title">{movie.title}</p>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* FOOTER */}
      <footer className="landing-footer">
        <p>&copy; {new Date().getFullYear()} CineMatch. All rights reserved.</p>
        <div className="footer-links"></div>
      </footer>
    </motion.div>
  );
};

export default Landing;
