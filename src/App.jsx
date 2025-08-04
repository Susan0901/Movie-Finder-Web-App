import { useEffect, useState } from "react";
import Search from "./components/Search";
import heroImage from "/hero-img.png";
import { API_BASE_URL, API_OPTIONS } from "./api";
import axios from "axios";
import {
  getTrendingMovies,
  updateSearchCount,
} from "./appwrite";
import { useDebounce } from "react-use";

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [debounceSearchTerm, setDebounceSearchTerm] = useState("");
  const [trendingMovies, setTrendingMovies] = useState([]);

  useDebounce(() => setDebounceSearchTerm(searchTerm), 1000, [searchTerm]);

  const fetchMovies = async (query = "", page = 1) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(
            query
          )}&page=${page}`
        : `${API_BASE_URL}/discover/movie?page=${page}`;
      const response = await axios.get(endpoint, API_OPTIONS);
      if (response.status === 200) {
        const data = response.data;
        setMovieList(data.results || []);
        setTotalPages(data.total_pages || 0);

        if (query && data.results.length > 0) {
          await updateSearchCount(query, data.results[0]);
        }
      } else {
        setErrorMessage("Failed to fetch data");
        setMovieList([]);
        return;
      }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage("Error fetching movies. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchMovies(debounceSearchTerm, currentPage);
  }, [debounceSearchTerm, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debounceSearchTerm]);
  
  useEffect(() => {
    loadTrendingMovies();
  }, []);
  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img src={heroImage} alt="Hero Banner" />
          <h1>
            Find your <span className="text-gradient">Movies</span> you will
            love without hassle.
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>

            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies mt-20">
          <h2>All Movies</h2>
          {isLoading ? (
            <p className="text-white">Loading....</p>
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.length > 0 &&
                movieList.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
            </ul>
          )}
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        </section>

        <div className="pagination flex justify-center items-center mt-10 space-x-5">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className="bg-white px-4 py-1 rounded-md disabled:opacity-50 cursor-poinuter"
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span className="text-white">
            {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            className="bg-white px-4 py-1 rounded-md disabled:opacity-50 cursor-poinuter"
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </main>
  );
};

const MovieCard = ({
  movie: { title, vote_average, poster_path, release_date, original_language },
}) => {
  return (
    <div className="movie-card">
      <img
        src={
          poster_path
            ? `https://image.tmdb.org/t/p/w500/${poster_path}`
            : "no-movie.png"
        }
        alt={title}
      />

      <div className="mt-4">
        <h3>{title}</h3>

        <div className="content">
          <div className="rating">
            <img src="star.png" alt="Star Icon" />
            <p>{vote_average ? vote_average.toFixed(1) : "N/A"}</p>
          </div>

          <span>.</span>
          <p className="lang">{original_language}</p>

          <span>.</span>
          <p className="year">
            {release_date ? release_date.split("-")[0] : "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
