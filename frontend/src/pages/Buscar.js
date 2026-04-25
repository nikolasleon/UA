import "./Buscar.css";
import { FaSearch, FaTimes } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Leer query params
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function Buscar() {
  const query = useQuery();
  const navigate = useNavigate();

  const urlSearch = query.get("query") || "";

  const [search, setSearch] = useState(urlSearch);
  const [categoria, setCategoria] = useState("");
  const [nivel, setNivel] = useState("");

  const [retos, setRetos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar retos desde MongoDB
  useEffect(() => {
    const cargarRetos = async () => {
      try {
        const res = await fetch(`${API_URL}/api/challenges`);
        const data = await res.json();

      if (Array.isArray(data)) {
        setRetos(data);
      } else {
        setRetos([]);
        console.error("La API no devolvió un array:", data);
      }
      } catch (error) {
        console.error("Error cargando retos:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarRetos();
  }, []);

  // Filtrado
const retosFiltrados = Array.isArray(retos)
  ? retos.filter((reto) => {
      const coincideTexto =
        reto.titulo.toLowerCase().includes(search.toLowerCase()) ||
        reto.descripcion.toLowerCase().includes(search.toLowerCase());

      const coincideCategoria = categoria
        ? reto.categoria.toLowerCase() === categoria.toLowerCase()
        : true;

      const coincideNivel = nivel
        ? reto.dificultad.toLowerCase() === nivel.toLowerCase()
        : true;

      return coincideTexto && coincideCategoria && coincideNivel;
    })
  : [];

  const irADetalle = (id) => {
    navigate(`/challenges/${id}`);
  };

  return (
    <div className="page">
      {/* BUSCADOR */}
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

            <FaTimes
              className="icon-right"
              onClick={() => setSearch("")}
            />
          </div>

          <h3 className="filters-title">Filtros rápidos</h3>

          <div className="filters">
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              <option value="">Categorías</option>
              <option value="general">General</option>
              <option value="fuerza">Fuerza</option>
              <option value="cardio">Cardio</option>
              <option value="aire libre">Aire libre</option>
              <option value="yoga">Yoga</option>
            </select>

            <select
              value={nivel}
              onChange={(e) => setNivel(e.target.value)}
            >
              <option value="">Nivel</option>
              <option value="fácil">Fácil</option>
              <option value="medio">Medio</option>
              <option value="difícil">Difícil</option>
            </select>
          </div>
        </div>
      </section>

      {/* RESULTADOS */}
      <h2 className="popular-title">RETOS POPULARES</h2>

      <div className="cards-container">
        {loading ? (
          <p style={{ textAlign: "center" }}>Cargando retos...</p>
        ) : retosFiltrados.length > 0 ? (
          retosFiltrados.map((reto) => (
            <div
              className="card"
              key={reto._id}
              onClick={() => irADetalle(reto._id)}
              style={{ cursor: "pointer" }}
            >
              <img
                src={
                  reto.imagenDesafio ||
                  "https://via.placeholder.com/400x250?text=Reto"
                }
                alt={reto.titulo}
              />

              <div className="card-info">
                <h3>{reto.titulo}</h3>
                <p>{reto.descripcion}</p>

                <div className="tags">
                  <span>{reto.categoria}</span>
                  <span>{reto.dificultad}</span>
                  <span>{reto.participantes} participantes</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center" }}>
            No se encontraron retos.
          </p>
        )}
      </div>
    </div>
  );
}

export default Buscar;