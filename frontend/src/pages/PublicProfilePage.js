import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaLock } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import ChallengeCarousel from "../components/ChallengeCarousel";
import "../styles/AccountPage.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function PublicProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  
  const [user, setUser] = useState(null);
  const [challenges, setChallenges] = useState({ creados: [], enProgreso: [], completados: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    // Si es el usuario actual, redirigir a su perfil privado
    if (userId === authUser?._id && authUser) {
      navigate("/account");
      return;
    }

    const fetchUserProfile = async () => {
      try {
        // Pasar el usuario actual para que el backend respete privacidad
        const currentUserId = authUser?._id || "";
        const response = await fetch(
          `${API_URL}/api/users/profile/${userId}?currentUserId=${currentUserId}`
        );
        
        if (response.ok) {
          const data = await response.json();
          setUser(data);
          
          // Si el perfil es privado, indicarlo
          if (data.isPrivate) {
            setIsPrivate(true);
          }
        } else {
          setError("Usuario no encontrado");
        }
      } catch (err) {
        console.error("Error al cargar perfil público:", err);
        setError("Error al cargar el perfil");
      } finally {
        setLoading(false);
      }
    };

    if (userId && userId !== authUser?._id) {
      fetchUserProfile();
    }
  }, [userId, authUser, navigate]);

  useEffect(() => {
    document.title = user ? `${user.nombre} ${user.apellido} – DayDare` : "Perfil – DayDare";
  }, [user]);

  useEffect(() => {
    // Solo cargar retos si el perfil no es privado
    if (!isPrivate && userId) {
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
        } catch (err) {
          console.error("Error al cargar retos:", err);
        }
      };

      fetchUserChallenges();
    }
  }, [isPrivate, userId]);

  if (loading) {
    return (
      <div className="account-container">
        <p>Cargando perfil...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="account-container">
        <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: "2rem" }}>
          <FaArrowLeft style={{ marginRight: "0.5rem" }} />
          Volver
        </button>
        <div style={{ textAlign: "center", color: "#e74c3c" }}>
          <p>{error || "Usuario no encontrado"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="account-container">
      <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: "2rem" }}>
        <FaArrowLeft style={{ marginRight: "0.5rem" }} />
        Volver
      </button>

      {/* Encabezado de perfil */}
      <div className="public-profile-card">
        <div className="public-profile-avatar-wrap">
          {user.fotoPerfil ? (
            <img
              src={user.fotoPerfil}
              alt={`${user.nombre} ${user.apellido}`}
              className="public-profile-avatar"
            />
          ) : (
            <div className="public-profile-avatar-placeholder">
              {user.nombre?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <h1 className="public-profile-name">{user.nombre} {user.apellido}</h1>
        {user.bio && <p className="public-profile-bio">{user.bio}</p>}
        {user.nacionalidad && (
          <p className="public-profile-meta">🌍 {user.nacionalidad}</p>
        )}
      </div>

      {/* Si el perfil es privado */}
      {isPrivate ? (
        <div className="public-profile-private-box">
          <FaLock className="public-profile-lock-icon" />
          <h3>Este perfil es privado</h3>
          <p>
            El propietario de esta cuenta ha hecho su perfil privado.
            Ningún usuario puede ver su perfil completo ni la información de sus retos.
          </p>
        </div>
      ) : (
        <>
          {/* Mostrar retos solo si es público */}
          {challenges.creados.length > 0 && (
            <section style={{ marginBottom: "3rem" }}>
              <h3>Retos Creados</h3>
              <ChallengeCarousel challenges={challenges.creados} />
            </section>
          )}

          {challenges.enProgreso.length > 0 && (
            <section style={{ marginBottom: "3rem" }}>
              <h3>Retos en Progreso</h3>
              <ChallengeCarousel challenges={challenges.enProgreso} />
            </section>
          )}

          {challenges.completados.length > 0 && (
            <section style={{ marginBottom: "3rem" }}>
              <h3>Retos Completados</h3>
              <ChallengeCarousel challenges={challenges.completados} />
            </section>
          )}

          {
            challenges.creados.length === 0 &&
            challenges.enProgreso.length === 0 &&
            challenges.completados.length === 0 && (
              <p style={{ textAlign: "center", color: "#999" }}>
                Este usuario aún no tiene retos.
              </p>
            )
          }
        </>
      )}
    </div>
  );
}

export default PublicProfilePage;
