import { useEffect, useState } from "react";
import { callApi } from "../api.js";
import { API } from "../apiRoutes.js";

export default function MoviesPage() {
  const [movies, setMovies] = useState([]);
  const [meta, setMeta] = useState({ page: 1, total_pages: 1 });
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError("");
    callApi(API.MOVIE_LIST, { query: { page } })
      .then((res) => {
        setMovies(res.data);
        setMeta(res.meta);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <div className="page-header">
        <h2>Movies</h2>
        <div className="pager">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
          <span>Page {meta.page} of {meta.total_pages}</span>
          <button disabled={page >= meta.total_pages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      </div>

      {error && <div className="message">Error: {error}</div>}
      {loading && <p>Loading...</p>}

      <div className="movie-grid">
        {movies.map((m) => (
          <div className="movie-card" key={m.id}>
            <div className="poster">
              {m.poster && <img src={m.poster} alt="" />}
              <h4>{m.title}</h4>
              <small>{m.release_date}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}