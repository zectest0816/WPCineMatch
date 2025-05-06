// src/pages/Landing.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./styles/landing.css"; // Make sure this file exists

const Landing = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      className="landing-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <div className="video-background">
        <video autoPlay muted loop className="video-bg">
          <source src="/videos/background.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="overlay" />

        <motion.nav
          className="nav-bar"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="brand">🎬 MovieExplorer</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="btn btn-danger"
            onClick={() => navigate("/login")}
          >
            Sign In
          </motion.button>
        </motion.nav>

        <motion.div
          className="content"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
        >
          <h1>Unlimited Movies, Shows & More</h1>
          <p>Watch anywhere. Cancel anytime.</p>
          <motion.button
            whileHover={{ scale: 1.1 }}
            className="btn btn-danger btn-lg"
            onClick={() => navigate("/login")}
          >
            Get Started
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Landing;
