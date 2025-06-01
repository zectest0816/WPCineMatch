const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:5000/api"; // fallback for local dev

console.log("TMDB API_KEY:", API_KEY);
console.log("Backend API_URL:", API_BASE_URL);

export async function fetchGenres() {
  const res = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`);
  const data = await res.json();
  return data.genres || [];
}

export async function fetchMovies(query = "", genre = "", year = "", sortBy = "", rating = "") {
  let url = "";
  const params = new URLSearchParams({ api_key: API_KEY });

  if (query) {
    url = `${BASE_URL}/search/movie`;
    params.append("query", query);
  } else {
    url = `${BASE_URL}/discover/movie`;
    if (genre) params.append("with_genres", genre);
    if (year) params.append("primary_release_year", year);
    if (sortBy) params.append("sort_by", sortBy);
    if (rating) params.append("vote_average.gte", rating);
  }

  const response = await fetch(`${url}?${params.toString()}`);
  const data = await response.json();
  let results = data.results || [];

  if (query) {
    if (genre) {
      results = results.filter((movie) =>
        movie.genre_ids.includes(parseInt(genre))
      );
    }
    if (year) {
      results = results.filter((movie) => movie.release_date?.startsWith(year));
    }
    if (sortBy && typeof sortBy === "string" && sortBy.includes(".")) {
      const [field, order] = sortBy.split(".");
      results.sort((a, b) =>
        order === "desc" ? b[field] - a[field] : a[field] - b[field]
      );
    }

    if (rating) {
      results = results.filter((movie) => movie.vote_average >= parseFloat(rating));
    }
  }

  return results;
}

export async function fetchMovieDetails(movieId) {
  const response = await fetch(
    `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`
  );
  return await response.json();
}

export async function fetchMovieTrailer(movieId) {
  const response = await fetch(
    `${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`
  );
  const data = await response.json();
  return data.results?.[0]?.key || null;
}

export async function fetchMoviesByGenre(genreId) {
  const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.results;
}

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error: ${response.status}`);
  }
  return response.json();
};

export const authApi = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },
};

export const userApi = {
  getUserById: async (_id) => {
    const response = await fetch(`${API_BASE_URL}/users/${_id}`);
    return handleResponse(response);
  },

  getUserProfile: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`);
    return handleResponse(response);
  },

  updateProfile: async (userId, userData) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  changePassword: async (userId, passwordData) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/password`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(passwordData),
    });
    return handleResponse(response);
  },

  deleteAccount: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "DELETE",
    });
    return handleResponse(response);
  },
};

export const userMovieApi = {
  addToFavorites: async (userId, movieId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/favorites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movieId }),
    });
    return handleResponse(response);
  },

  removeFromFavorites: async (userId, movieId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/favorites/${movieId}`, {
      method: "DELETE",
    });
    return handleResponse(response);
  },

  getFavorites: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/favorites`);
    return handleResponse(response);
  },

  addToWatchlist: async (userId, movieId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/watchlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movieId }),
    });
    return handleResponse(response);
  },

  removeFromWatchlist: async (userId, movieId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/watchlist/${movieId}`, {
      method: "DELETE",
    });
    return handleResponse(response);
  },

  getWatchlist: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/watchlist`);
    return handleResponse(response);
  },

  addToWatchHistory: async (userId, movieId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/history`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movieId }),
    });
    return handleResponse(response);
  },

  getWatchHistory: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/history`);
    return handleResponse(response);
  },
};

export const commentApi = {
  getComments: async (movieId) => {
    const response = await fetch(`${API_BASE_URL}/comments/${movieId}`);
    return handleResponse(response);
  },

  addComment: async (movieId, user, text) => {
    const response = await fetch(`${API_BASE_URL}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movieId, user, text }),
    });
    return handleResponse(response);
  },
};

export { IMAGE_BASE_URL };
