const style = document.createElement("style");
style.innerHTML = `
.search-wrapper {
  padding-top: 5rem;
  background-color: #141414;
  color: white;
  min-height: 100vh;
}

.filter-bar {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin: 2rem auto;
  flex-wrap: wrap;
  max-width: 1000px;
}

.filter-bar select,
.filter-bar input {
  padding: 0.6rem;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  background: #222;
  color: white;
  width: 160px;
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1.5rem;
  padding: 0 2rem 3rem;
}

.movie-card {
  cursor: pointer;
  text-align: center;
  transition: transform 0.2s;
}

.movie-card img {
  width: 100%;
  border-radius: 10px;
}

.movie-card:hover {
  transform: scale(1.05);
}

.movie-title {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #ccc;
}

.no-results {
  text-align: center;
  padding: 4rem;
  font-size: 1.2rem;
  color: gray;
}

/* Modal Styles */
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

@media (min-width: 768px) {
  .modal-body {
    flex-direction: row;
  }
}

.modal-body {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  max-height: 80vh;
  overflow: hidden;
}

.modal-poster {
  width: 300px;
  height: auto;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
}

.modal-info {
  flex-grow: 1;
  overflow-y: auto;
  max-height: 100%;
  padding-right: 0.5rem;
}
.modal-info,
.comment-list {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */
}

.modal-info::-webkit-scrollbar,
.comment-list::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge */
}

.trailer {
  margin-top: 1rem;
}

  .landing-footer {
    background-color: #111;
    color: #aaa;
    text-align: center;
    padding: 2rem 1rem;
  }


`;
document.head.appendChild(style);
