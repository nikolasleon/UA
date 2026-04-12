import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChallengeCarousel from "../components/ChallengeCarousel";
import Alert from "../components/Alert";
import "../styles/AccountPage.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function AccountPage() {
  const [user, setUser] = useState(null);
  const [challenges, setChallenges] = useState({ creados: [], enProgreso: [], completados: [] });
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ message: "", type: "success" });
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId") || "69dbce705178f132188226ac";

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users/profile/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        // Guardar datos en localStorage para acceso rápido
        localStorage.setItem("userId", userId);
        localStorage.setItem("userName", data.nombre || "");
        localStorage.setItem("userLastName", data.apellido || "");
        localStorage.setItem("userEmail", data.email || "");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };

  const fetchUserChallenges = async () => {
    try {
      const res1 = await fetch(`${API_URL}/api/challenges/user/${userId}?estado=creados`);
      const res2 = await fetch(`${API_URL}/api/challenges/user/${userId}?estado=enProgreso`);
      const res3 = await fetch(`${API_URL}/api/challenges/user/${userId}?estado=completados`);
      if (res1.ok && res2.ok && res3.ok) {
        setChallenges({
          creados: await res1.json(),
          enProgreso: await res2.json(),
          completados: await res3.json(),
        });
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching challenges:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchUserChallenges();
  }, [userId]);

  useEffect(() => {
    console.log("Retos del perfil:", {
      creados: challenges.creados.length,
      enProgreso: challenges.enProgreso.length,
      completados: challenges.completados.length,
      creadosData: challenges.creados,
      enProgresoData: challenges.enProgreso,
      completadosData: challenges.completados,
    });
  }, [challenges]);

  const handleEditProfile = () => {
    navigate("/settings");
  };

  const handleCreateChallenge = () => {
    navigate("/create-challenge");
  };

  const handleViewChallenge = (challengeId) => {
    navigate(`/challenge/${challengeId}`);
  };

  const handleDeleteChallenge = async (challengeId) => {
    try {
      const response = await fetch(`${API_URL}/api/challenges/${challengeId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error al eliminar");

      setChallenges((prev) => ({
        ...prev,
        creados: prev.creados.filter((c) => c._id !== challengeId),
      }));

      setAlert({ message: "✓ Reto eliminado correctamente", type: "success" });
    } catch (error) {
      console.error("Error:", error);
      setAlert({ message: "✕ Error al eliminar el reto", type: "error" });
    }
  };

  if (loading || !user) {
    return <div className="account-container"><p>Cargando...</p></div>;
  }

  return (
    <div className="account-container">
      <Alert 
        message={alert.message} 
        type={alert.type} 
        onClose={() => setAlert({ message: "", type: "success" })}
      />

      {/* Header del Perfil */}
      <div className="profile-header">
        <div className="profile-card">
          <div className="profile-top">
            {user.fotoPerfil && (
              <img
                src={user.fotoPerfil}
                alt={`Foto de perfil de ${user.nombre}`}
                className="profile-avatar"
              />
            )}
            <div className="profile-info">
              <h1 className="profile-name">
                {user.nombre} {user.apellido}
              </h1>
              <p className="profile-email">{user.email}</p>
              {user.bio && <p className="profile-bio">{user.bio}</p>}
            </div>
          </div>

          <button
            onClick={handleEditProfile}
            className="btn btn-primary btn-edit-profile"
            aria-label="Editar perfil"
          >
            Editar Perfil
          </button>
        </div>
      </div>

      {/* Métricas */}
      <div className="metrics-grid" role="region" aria-label="Estadísticas del usuario">
        <div className="metric-card">
          <div className="metric-value">{user.estilo?.retosCompletados || 0}</div>
          <div className="metric-label">Retos Completados</div>
        </div>

        <div className="metric-card">
          <div className="metric-value">{user.estilo?.retosCreados || 0}</div>
          <div className="metric-label">Retos Creados</div>
        </div>

        <div className="metric-card">
          <div className="metric-value">{user.estilo?.retosEnProgreso || 0}</div>
          <div className="metric-label">En Progreso</div>
        </div>
      </div>

      {/* Carruseles de Retos */}
      <ChallengeCarousel
        title="Retos Completados"
        challenges={challenges.completados}
        onViewDetails={handleViewChallenge}
        onViewAll={() => navigate("/my-challenges/completados")}
      />

      <ChallengeCarousel
        title="Retos Creados"
        challenges={challenges.creados}
        onDelete={handleDeleteChallenge}
        onViewDetails={handleViewChallenge}
        onViewAll={() => navigate("/my-challenges/creados")}
      >
        <button
          onClick={handleCreateChallenge}
          className="btn btn-success"
          aria-label="Crear nuevo reto"
        >
          + Crear Reto
        </button>
      </ChallengeCarousel>

      <ChallengeCarousel
        title="Retos en Progreso"
        challenges={challenges.enProgreso}
        onViewDetails={handleViewChallenge}
        onViewAll={() => navigate("/my-challenges/en-progreso")}
      />
    </div>
  );
}

export default AccountPage;
