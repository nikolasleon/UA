import "../styles/Buscar.css";
import { FaSearch, FaTimes } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function Buscar() {
  const query = useQuery();
  const navigate = useNavigate();
  const urlSearch = query.get("query") || "";

  const [search, setSearch] = useState(urlSearch);
  const [categoria, setCategoria] = useState("");

  useEffect(() => {
    setSearch(urlSearch);
    setPage(1);
  }, [urlSearch]);
  const [duracion, setDuracion] = useState("");
  const [nivel, setNivel] = useState("");
  const [retos, setRetos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  useEffect(() => {
    document.title = "Buscar retos – DayDare";
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/challenges`)
      .then(r => r.json())
      .then(data => setRetos(Array.isArray(data) ? data : []))
      .catch(() => setRetos([]))
      .finally(() => setLoading(false));
  }, []);

  const retosFiltrados = retos.filter((reto) => {
    const coincideTexto = !search ||
      reto.titulo.toLowerCase().includes(search.toLowerCase()) ||
      reto.descripcion?.toLowerCase().includes(search.toLowerCase());

    const coincideCategoria = !categoria || reto.categoria === categoria;
    const coincideDuracion = !duracion || reto.duracion === duracion;
    const coincideNivel = !nivel || reto.dificultad === nivel;

    return coincideTexto && coincideCategoria && coincideDuracion && coincideNivel;
  });

  const totalPages = Math.ceil(retosFiltrados.length / PER_PAGE);
  const retosPagina = retosFiltrados.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="page">

      <section className="search-block">
        <h1 className="search-title">BUSCA TU RETO</h1>

        <div className="search-container">
          <div className="search-bar">
            <FaSearch className="icon-left" />
            <input
              type="text"
              placeholder="Busca un reto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <FaTimes className="icon-right" onClick={() => setSearch("")} />
            )}
          </div>

          <h3 className="filters-title">Filtros rápidos</h3>

          <div className="filters">
            <select value={categoria} onChange={(e) => { setCategoria(e.target.value); setPage(1); }}>
              <option value="">Categorías</option>
              <option value="fuerza">Fuerza</option>
              <option value="cardio">Cardio</option>
              <option value="aire libre">Aire libre</option>
              <option value="gimnasio">Gimnasio</option>
              <option value="yoga">Yoga</option>
              <option value="general">General</option>
              <option value="equipo">Equipo</option>
              <option value="flexibilidad">Flexibilidad</option>
              <option value="resistencia">Resistencia</option>
              <option value="arte">Arte</option>
              <option value="tecnologia">Tecnologia</option>
              <option value="cocina">Cocina</option>
              <option value="música">Música</option>
            </select>

            <select value={duracion} onChange={(e) => { setDuracion(e.target.value); setPage(1); }}>
              <option value="">Duración</option>
              <option value="5min">5min</option>
              <option value="10min">10min</option>
              <option value="15min">15min</option>
              <option value="20min">20min</option>
              <option value="30min">30min</option>
              <option value="45min">45min</option>
              <option value="1h">1h</option>
              <option value="1h 30min">1h 30min</option>
              <option value="2h">2h</option>
            </select>

            <select value={nivel} onChange={(e) => { setNivel(e.target.value); setPage(1); }}>
              <option value="">Nivel</option>
              <option value="fácil">Fácil</option>
              <option value="medio">Medio</option>
              <option value="intenso">Intenso</option>
            </select>
          </div>
        </div>
      </section>

      <h2 className="popular-title">
        {search || categoria || duracion || nivel ? "RESULTADOS" : "TODOS LOS RETOS"}
      </h2>

      {loading ? (
        <p style={{ textAlign: "center", padding: "2rem" }}>Cargando retos...</p>
      ) : (
        <>
          <div className="cards-container">
            {retosFiltrados.length > 0 ? (
              retosPagina.map((reto) => (
                <div className="card" key={reto._id} onClick={() => navigate(`/reto/${reto._id}`)} style={{ cursor: "pointer" }}>
                  {reto.imagenDesafio ? (
                    <img src={reto.imagenDesafio} alt={reto.titulo} />
                  ) : (
                    <div className="card-no-image">Sin imagen</div>
                  )}
                  <div className="card-info">
                    <h3>{reto.titulo}</h3>
                    <p>{reto.descripcion}</p>
                    <div className="tags">
                      {reto.categoria && <span>{reto.categoria}</span>}
                      {reto.duracion && <span>{reto.duracion}</span>}
                      {reto.dificultad && <span>{reto.dificultad}</span>}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: "center" }}>No se encontraron retos.</p>
            )}
          </div>
          {totalPages > 1 && (
            <div className="pagination">
              <button className="pagination-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>← Anterior</button>
              <span className="pagination-info">{page} / {totalPages}</span>
              <button className="pagination-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>Siguiente →</button>
            </div>
          )}
        </>
      )}

    </div>
  );
}

export default Buscar;
