// homeStyles.js
const style = document.createElement("style");
style.innerHTML = `
.movie-row-wrapper {
  position: relative;
  margin-bottom: 30px;
}

.movie-row {
  display: flex;
  overflow-x: auto;
  scroll-behavior: smooth;
  gap: 10px;
  padding: 10px 0;
}

.movie-row::-webkit-scrollbar {
  display: none;
}

.movie-poster {
  height: 200px;
  border-radius: 10px;
  transition: transform 0.3s;
  cursor: pointer;
}

.movie-poster:hover {
  transform: scale(1.08);
}

.scroll-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 2rem;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  color: white;
  z-index: 2;
  padding: 5px 10px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s;
}

.movie-row-wrapper:hover .scroll-button {
  opacity: 1;
}

.scroll-button.left {
  left: 0;
}

.scroll-button.right {
  right: 0;
}

  body {
    font-family: 'Roboto', sans-serif;
    background-color: #000;
  }

  .hero-banner {
    position: relative;
    height: 80vh;
    background-size: cover;
    background-position: center;
    color: white;
  }

  .hero-overlay {
    position: absolute;
    bottom: 20%;
    left: 5%;
    max-width: 600px;
  }

  .hero-title {
    font-size: 3rem;
    font-weight: bold;
  }

  .hero-rank {
    margin-top: 1rem;
    font-size: 1.2rem;
    color: red;
    font-weight: 600;
  }

  .hero-description {
    margin: 1rem 0;
    font-size: 1rem;
    line-height: 1.5;
  }

  .hero-buttons {
    display: flex;
    gap: 1rem;
  }

  .hero-btn {
    background-color: rgba(51, 51, 51, 0.7);
    border: none;
    color: white;
    padding: 0.8rem 1.5rem;
    border-radius: 5px;
    font-size: 1rem;
    cursor: pointer;
  }

  .hero-btn.play {
    background-color: white;
    color: black;
    font-weight: bold;
  }

  .hero-btn.info:hover {
    background-color: rgba(109, 109, 110, 0.7);
  }

  .movie-row {
    display: flex;
    overflow-x: auto;
    gap: 1rem;
    padding-bottom: 1rem;
  }

  .movie-thumbnail {
    max-height: 250px;
    border-radius: 10px;
    transition: transform 0.3s;
    cursor: pointer;
  }

  .movie-thumbnail:hover {
    transform: scale(1.05);
  }

  h3 {
    color: #fff;
    font-weight: bold;
  }
`;
document.head.appendChild(style);
