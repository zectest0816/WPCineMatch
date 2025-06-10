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

.movie-poster:hover {
  transform: scale(1.08);
}

.movie-slider-container {
  position: relative;
  overflow: hidden;
}

.movie-slider {
  display: flex;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 10px 0;
}

.movie-card {
  min-width: 150px;
  margin: 0 8px;
  cursor: pointer;
  position: relative;
}

.scroll-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  font-size: 2rem;
  padding: 10px;
  z-index: 2;
  cursor: pointer;
  transition: background-color 0.3s;
}

.scroll-btn:hover {
  background-color: rgba(255, 255, 255, 0.7);
  color: black;
}

.scroll-btn.left {
  left: 0;
}

.scroll-btn.right {
  right: 0;
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-content {
  background: #1c1c1c;
  padding: 2rem;
  border-radius: 12px;
  max-width: 900px;
  width: 90%;
  position: relative;
  color: white;
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 80vh;
  overflow: hidden;
}

.modal-poster {
  width: 100%;
  max-height: 400px;
  border-radius: 10px;
  object-fit: contain;
}

.modal-info {
  flex-grow: 1;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.movie-details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin: 15px 0;
}

.trailer {
  margin-top: 1rem;
}

.button-container {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  justify-content: space-between;
}

@media (min-width: 768px) {
  .modal-body {
    flex-direction: row;
  }
  .modal-poster {
    width: 300px;
    height: auto;
    margin-right: 20px;
  }
}

.poster-container {
position: relative;
display: inline-block;
}

.card-buttons {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  justify-content: space-between;
  z-index: 1;
}

.card-buttons button {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  padding: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.card-buttons button:hover::before {
  content: attr(title);
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
  opacity: 1;
}
  .poster-wrapper {
  position: relative;
  width: fit-content;
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
    transition: opacity 0.3s ease-in-out;
  }

.hero-dots {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 2;
  cursor: pointer;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.4);
  transition: background-color 0.3s ease;
}

.dot.active {
  background-color: white;
}


  .hero-title {
    font-size: 3rem;
    font-weight: bold;
  }

  .fade-in {
  opacity: 1;
}

.fade-out {
  opacity: 0;
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

  /* Footer */
.landing-footer {
  background-color: #111;
  color: #aaa;
  text-align: center;
  padding: 2rem 1rem;
}
    
`;

document.head.appendChild(style);
