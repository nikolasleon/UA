import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Para obtener el usuario actual
import Header from "../components/Header";
import MediaCollage from "../components/MediaCollage";
import "../styles/ChallengePage.css";

function ChallengePage() {
  const { id } = useParams(); // Obtiene el ID de la URL
  const { user } = useAuth(); // Usuario logueado para participar[cite: 6]
  const [challenge, setChallenge] = useState(null);
  const [participantes, setParticipantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("llegada");

  // Definir la URL base de tu API
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    const fetchChallengeData = async () => {
      try {
        setLoading(true);
        // 1. Obtener detalles del reto desde GET /api/challenges/:id
        const resChallenge = await fetch(`${API_URL}/challenges/${id}`);
        const dataChallenge = await resChallenge.json();
        setChallenge(dataChallenge);

        // 2. Simulamos u obtenemos los participantes (basado en UserChallenge)
        // Nota: En tu backend podrías crear un endpoint específico para esto
        const resParticipantes = await fetch(`${API_URL}/challenges/${id}/participantes`);
        if (resParticipantes.ok) {
          const dataParticipantes = await resParticipantes.json();
          setParticipantes(dataParticipantes.participantes);
        }
      } catch (err) {
        console.error("Error al cargar datos del reto:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChallengeData();
  }, [id, API_URL]);

  const handleJoinChallenge = async () => {
    if (!user) {
      alert("Debes iniciar sesión para participar.");
      return;
    }

    try {
      // POST /api/challenges/:id/participar
      const response = await fetch(`${API_URL}/challenges/${id}/participar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioId: user._id,
          imagenEnvio: "url_de_la_imagen_subida", // Aquí iría la lógica de subida de archivos
          descripcionEnvio: "¡Reto aceptado!",
        }),
      });

      if (response.ok) {
        alert("¡Te has unido al reto con éxito!");
        // Opcional: recargar participantes
      }
    } catch (err) {
      console.error("Error al participar:", err);
    }
  };

  if (loading) return <div className="loading-state">Cargando reto...</div>;
  if (!challenge) return <div className="error-state">Reto no encontrado.</div>;

  return (
    <div className="challenge-page">

      <main className="challenge-container">
        {/* Banner dinámico con título del backend */}
        <div className="challenge-hero-banner">
          <h1>{challenge.titulo.toUpperCase()}</h1>
        </div>

        <div className="challenge-grid-layout">
          {/* Lado Izquierdo: Información del Reto */}
          <div className="challenge-main-col">
            <section className="challenge-detail-box">
              <div className="challenge-rating-badge">
                <span className="rating-score">
                  {challenge.valoracionPromedio?.toFixed(1) || "0.0"}
                </span>
                <span className="rating-stars">{"★".repeat(Math.round(challenge.valoracionPromedio || 0))}</span>
              </div>

              <div className="challenge-media-container">
                {/* MediaCollage recibe un array de imágenes */}
                <MediaCollage images={challenge.imagenDesafio ? [challenge.imagenDesafio] : []} />
              </div>

              <p className="challenge-popular-tag">
                {challenge.participantes > 10 ? "¡Reto muy popular!" : "Reto nuevo"}
              </p>

              <div className="challenge-description-box">
                <p>{challenge.descripcion}</p>
              </div>

              <div className="challenge-actions">
                <div className="challenge-tags">
                  <span className="tag">{challenge.categoria}</span>
                  <span className="tag">{challenge.dificultad}</span>
                </div>
                
                <button className="join-btn" onClick={handleJoinChallenge}>
                  ¡UNIRME AL RETO!
                </button>
              </div>
            </section>
          </div>

          {/* Lado Derecho: Comunidad (Rankings y Challengers) */}
          <aside className="challenge-side-col">
            <section className="rankings-section">
              <div className="rankings-header"><h2>RANKINGS</h2></div>
              <div className="rankings-tabs">
                <button 
                  className={activeTab === "llegada" ? "active" : ""} 
                  onClick={() => setActiveTab("llegada")}
                >
                  Orden de llegada
                </button>
                <button 
                  className={activeTab === "favoritos" ? "active" : ""} 
                  onClick={() => setActiveTab("favoritos")}
                >
                  Favoritos
                </button>
              </div>
              <ul className="rankings-list">
                {participantes.length > 0 ? (
                  participantes.map((p, index) => (
                    <li key={index}>
                      <span>{p.usuario?.nombre || "Usuario"}</span>
                      <span className="rankings-dot">•</span>
                    </li>
                  ))
                ) : (
                  <li className="no-data">Sé el primero en llegar</li>
                )}
              </ul>
            </section>

            <section className="challengers-section">
              <div className="challengers-header"><h2>CHALLENGERS</h2></div>
              <div className="challengers-feed">
                {participantes.length > 0 ? (
                  participantes.slice(0, 3).map((p, index) => (
                    <div key={index} className="challenger-post">
                      <img 
                        src={p.usuario?.fotoPerfil || "https://via.placeholder.com/60"} 
                        alt="avatar" 
                        className="challenger-img" 
                      />
                      <div className="challenger-info">
                        <h4>{p.usuario?.nombre} - <span className="post-highlight">¡Lo logró!</span></h4>
                        <p>{p.descripcionEnvio || "¡He completado el desafío!"}</p>
                        <button className="like-btn">👍 {p.likes || 0}</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-data-padding">Aún no hay publicaciones.</p>
                )}
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default ChallengePage;