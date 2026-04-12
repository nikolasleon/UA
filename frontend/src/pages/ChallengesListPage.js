import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ChallengeCard from "../components/ChallengeCard";
import Alert from "../components/Alert";
import "../styles/ChallengesListPage.css";

function ChallengesListPage() {
  const { tipo } = useParams(); // "completados", "creados", "en-progreso"
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ message: "", type: "success" });
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId") || "69dbce705178f132188226ac";

  const tipoMap = {
    "completados": "completados",
    "creados": "creados",
    "en-progreso": "enProgreso",
  };

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        setLoading(true);
        const estadoParam = tipoMap[tipo] || "creados";
        
        const response = await fetch(
          `http://localhost:5000/api/challenges/user/${userId}?estado=${estadoParam}`
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

  const handleEditChallenge = (challengeId) => {
    navigate(`/edit-challenge/${challengeId}`);
  };

  const handleDeleteChallenge = async (challengeId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/challenges/${challengeId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error al eliminar");

      setChallenges((prev) => prev.filter((c) => c._id !== challengeId));
      setAlert({ message: "✓ Reto eliminado correctamente", type: "success" });
    } catch (error) {
      console.error("Error:", error);
      setAlert({ message: "✕ Error al eliminar el reto", type: "error" });
    }
  };

  const handleViewChallenge = (challengeId) => {
    navigate(`/challenge/${challengeId}`);
  };

  if (loading) {
    return <div className="challenges-list-container"><p>Cargando...</p></div>;
  }

  const tipoLabel = {
    "completados": "Retos Completados",
    "creados": "Mis Retos",
    "en-progreso": "Retos en Progreso",
  };

  return (
    <div className="challenges-list-container">
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

      {challenges.length === 0 ? (
        <p className="empty-message">No hay retos en esta categoría</p>
      ) : (
        <div className="challenges-grid" role="region" aria-label={tipoLabel[tipo]}>
          {challenges.map((challenge) => (
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
