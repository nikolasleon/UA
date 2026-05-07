import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MediaCollage from "../components/MediaCollage";
import "../styles/ChallengePage.css";

function ChallengePage() {
  const { id } = useParams();
  const { user } = useAuth(); 
  const [challenge, setChallenge] = useState(null);
  const [participantes, setParticipantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("llegada");
  
  const [userStatus, setUserStatus] = useState("INVITADO");

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchChallengeData = async () => {
      try {
        setLoading(true);
        // 1. Cargar datos del reto
        const resChallenge = await fetch(`${API_URL}/api/challenges/${id}`);
        const dataChallenge = await resChallenge.json();
        setChallenge(dataChallenge);

        // 2. Cargar participantes
        const resParticipantes = await fetch(`${API_URL}/api/challenges/${id}/participantes`);
        if (resParticipantes.ok) {
          const dataParticipantes = await resParticipantes.json();
          const lista = dataParticipantes.participantes || [];
          setParticipantes(lista);

          const estadoRes = await fetch(`${API_URL}/api/challenges/${id}/estado/${user?._id || ""}`);
          const estado = await estadoRes.json();
          // 3. Determinar el estado del usuario actual respecto al reto
          if (!user) {
            setUserStatus("INVITADO");
          } else {    
            console.log("Estado de participación:", estado);
            if (estado.estado === "no_unido") {
              setUserStatus("UNIRSE");
            } else if (estado.estado === "pendiente") {
              setUserStatus("SUBIR");
            } else {
              setUserStatus("COMPLETADO");
            }
          }
        }
      } catch (err) {
        console.error("Error al cargar datos del reto:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChallengeData();
  }, [id, user, API_URL]);

  const handleAction = async () => {
    if (userStatus === "INVITADO") {
      alert("Debes iniciar sesión para participar.");
      return;
    }

    if (userStatus === "UNIRSE") {
      try {
        const response = await fetch(`${API_URL}/api/challenges/${id}/participar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ usuarioId: user._id }),
        });
        if (response.ok) {
          alert("¡Te has unido al reto!");
          setUserStatus("SUBIR");
        }
      } catch (err) {
        console.error("Error al participar:", err);
      }
    } else if (userStatus === "SUBIR") {

      alert("Redirigiendo a subir tu foto/video...");
    }
  };

  // Función para renderizar el botón dinámico según el mockup
  const renderButton = () => {
    switch (userStatus) {
      case "COMPLETADO":
        return <button className="btn-action btn-completado">¡RETO COMPLETADO!</button>;
      case "SUBIR":
        return <button className="btn-action btn-subir" onClick={handleAction}>SUBIR RESPUESTA</button>;
      case "UNIRSE":
      default:
        return <button className="btn-action btn-unirme" onClick={handleAction}>¡ACEPTAR RETO!</button>;
    }
  };

  if (loading) return <div className="loading-state">Cargando reto...</div>;
  if (!challenge) return <div className="error-state">Reto no encontrado.</div>;

  return (
    <div className="challenge-page-container">
      <div className="challenge-hero-banner">
        <h1>{challenge.titulo?.toUpperCase() || "RETO"}</h1>
      </div>

      <main className="challenge-responsive-grid">
        
        <div className="challenge-info-column">
          <div className="challenge-card-white">
            
            <div className="challenge-rating-badge">
              <span className="rating-score">4/5</span>
              <span className="rating-stars">★★★★☆</span>
            </div>

            <div className="challenge-content-padding">
              <div className="challenge-media-container">
                <MediaCollage images={challenge.imagenDesafio ? [challenge.imagenDesafio] : []} />
              </div>

              <p className="challenge-sub-text">Reto popular</p>

              <div className="challenge-description">
                <p>{challenge.descripcion}</p>
              </div>

              <div className="challenge-footer-actions">
                <div className="challenge-tags">
                  <span className="tag-item">YOGA</span>
                  <span className="tag-item">5 MINUTOS</span>
                  <span className="tag-item">FÁCIL</span>
                </div>
                
                {renderButton()}
              </div>
            </div>
          </div>
        </div>

        <aside className="challenge-community-column">
          
          <section className="community-section">
            <div className="section-header mustard">
              <h2>RANKINGS</h2>
            </div>
            
            <div className="tabs-container pink">
              <button 
                className={`tab ${activeTab === "llegada" ? "active" : ""}`} 
                onClick={() => setActiveTab("llegada")}
              >
                Orden de llegada
              </button>
              <button 
                className={`tab ${activeTab === "favoritos" ? "active" : ""}`} 
                onClick={() => setActiveTab("favoritos")}
              >
                Favoritos
              </button>
            </div>

            <ul className="rankings-list">
              {participantes.length > 0 ? (
                participantes.map((p, index) => (
                  <li key={index} className="ranking-item">
                    <span>{p.usuario?.nombre || "Usuario"}</span>
                    <span className="ranking-arrow">›</span>
                  </li>
                ))
              ) : (
                <li className="no-data-item">Sé el primero en llegar</li>
              )}
            </ul>
          </section>

          <section className="community-section">
            <div className="section-header cyan">
              <h2>CHALLENGERS</h2>
            </div>
            
            <div className="challengers-feed">
              {participantes.filter(p => p.imagenEnvio).length > 0 ? (
                participantes.filter(p => p.imagenEnvio).slice(0, 3).map((p, index) => (
                  <div key={index} className="challenger-card-mini">
                    <img 
                      src={p.usuario?.fotoPerfil || "https://via.placeholder.com/80x100"} 
                      alt="avatar" 
                      className="user-avatar" 
                    />
                    <div className="user-post-content">
                      <h4 className="user-title">{p.usuario?.nombre} - ¡Muy liberador!</h4>
                      <p className="user-comment">{p.descripcionEnvio || "¡He completado el desafío!"}</p>
                      <button className="btn-like">👍</button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-data-padding">Aún no hay publicaciones.</p>
              )}
            </div>
          </section>

        </aside>
      </main>
    </div>
  );
}

export default ChallengePage;