const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

// ✅ NEW: Fetch all genres
export async function fetchGenres() {
  const res = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`);
  const data = await res.json();
  return data.genres || [];
}

export async function fetchMovies(query = "", genre = "", year = "", sortBy = "") {
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
    if (sortBy) {
      const [field, order] = sortBy.split(".");
      results.sort((a, b) =>
        order === "desc" ? b[field] - a[field] : a[field] - b[field]
      );
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

export { IMAGE_BASE_URL };
