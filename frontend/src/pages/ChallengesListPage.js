import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaSearch, FaTimes } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import ChallengeCard from "../components/ChallengeCard";
import Alert from "../components/Alert";
import Breadcrumb from "../components/Breadcrumb";
import "../styles/ChallengesListPage.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const tipoMap = {
  "completados": "completados",
  "creados": "creados",
  "en-progreso": "enProgreso",
};

function ChallengesListPage() {
  const { user } = useAuth();
  const { tipo } = useParams(); // "completados", "creados", "en-progreso"
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ message: "", type: "success" });
  const navigate = useNavigate();

  // Estados para filtros
  const [search, setSearch] = useState("");
  const [filteredDifficulty, setFilteredDifficulty] = useState("");
  const [filteredDuration, setFilteredDuration] = useState("");

  const userId = user?._id;

  const tipoLabel = {
    "completados": "Retos Completados",
    "creados": "Mis Retos",
    "en-progreso": "Retos en Progreso",
  };

  useEffect(() => {
    document.title = `${tipoLabel[tipo] || "Mis Retos"} – DayDare`;
  }, [tipo]);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        setLoading(true);
        const estadoParam = tipoMap[tipo] || "creados";
        
        const response = await fetch(
          `${API_URL}/api/challenges/user/${userId}?estado=${estadoParam}`
        );
        if (response.ok) {
          const data = await response.json();
          setChallenges(Array.isArray(data) ? data : []);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching challenges:", err);
        setLoading(false);
      }
    };

    fetchChallenges();
  }, [tipo, userId]);

  const handleDeleteChallenge = async (challengeId) => {
    try {
      const response = await fetch(`${API_URL}/api/challenges/${challengeId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error al eliminar");

      setChallenges((prev) => prev.filter((c) => c._id !== challengeId));
      setAlert({ message: "Reto eliminado correctamente", type: "success" });
    } catch (error) {
      console.error("Error:", error);
      setAlert({ message: "✕ Error al eliminar el reto", type: "error" });
    }
  };

  const handleViewChallenge = (challengeId) => {
    navigate(`/challenge/${challengeId}`);
  };

  // Función para filtrar retos
  const getFilteredChallenges = () => {
    return challenges.filter((challenge) => {
      // Filtro por búsqueda de texto
      const matchesSearch = challenge.titulo.toLowerCase().includes(search.toLowerCase());
      
      // Filtro por dificultad
      const matchesDifficulty = filteredDifficulty 
        ? challenge.dificultad.toLowerCase() === filteredDifficulty.toLowerCase()
        : true;
      
      // Filtro por duración (si existe el campo duracion)
      const matchesDuration = filteredDuration
        ? challenge.duracion && challenge.duracion.includes(filteredDuration)
        : true;
      
      return matchesSearch && matchesDifficulty && matchesDuration;
    });
  };

  const filteredChallenges = getFilteredChallenges();

  if (loading) {
    return <div className="challenges-list-container"><p>Cargando...</p></div>;
  }

  return (
    <div className="challenges-list-container">
      <Breadcrumb items={[{ label: "Inicio", to: "/" }, { label: "Mi perfil", to: "/account" }, { label: tipoLabel[tipo] || "Mis Retos" }]} />
      <Alert
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ message: "", type: "success" })}
      />

      <button
        onClick={() => navigate("/account")}
        className="btn-back"
        aria-label="Volver a Mi Cuenta"
      >
        ← Volver
      </button>

      <h1>{tipoLabel[tipo] || "Mis Retos"}</h1>

      {/* Filtros */}
      <div className="filters-section">
        <div className="search-bar-filters">
          <FaSearch className="icon-left" />
          <input
            type="text"
            placeholder="Busca un reto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input-filters"
          />
          {search && (
            <FaTimes
              className="icon-right"
              onClick={() => setSearch("")}
              role="button"
              tabIndex={0}
              aria-label="Limpiar búsqueda"
            />
          )}
        </div>

        <div className="filters-row">
          <select
            value={filteredDifficulty}
            onChange={(e) => setFilteredDifficulty(e.target.value)}
            className="filter-select"
            aria-label="Filtrar por dificultad"
          >
            <option value="">Todas las dificultades</option>
            <option value="fácil">Fácil</option>
            <option value="medio">Medio</option>
            <option value="difícil">Difícil</option>
          </select>

          <select
            value={filteredDuration}
            onChange={(e) => setFilteredDuration(e.target.value)}
            className="filter-select"
            aria-label="Filtrar por duración"
          >
            <option value="">Todas las duraciones</option>
            <option value="5">5 min</option>
            <option value="15">15 min</option>
            <option value="30">30 min</option>
            <option value="7">1-7 días</option>
          </select>
        </div>
      </div>

      {/* Resultado de filtros */}
      {filteredChallenges.length === 0 ? (
        <p className="empty-message">
          {challenges.length === 0 
            ? "No hay retos en esta categoría"
            : "No se encontraron retos que coincidan con tu búsqueda"}
        </p>
      ) : (
        <div className="challenges-grid" role="region" aria-label={tipoLabel[tipo]}>
          {filteredChallenges.map((challenge) => (
            <ChallengeCard
              key={challenge._id}
              challenge={challenge}
              onViewDetails={handleViewChallenge}
              onDelete={tipo === "creados" ? handleDeleteChallenge : null}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ChallengesListPage;
