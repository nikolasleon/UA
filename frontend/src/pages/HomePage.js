import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import ChallengeCard from "../components/ChallengeCard";
import Alert from "../components/Alert";
import { useAuth } from "../context/AuthContext";
import "../styles/HomePage.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function HomePage() {
  const [popularChallenges, setPopularChallenges] = useState([]);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [challengersImages, setChallengersImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState("");
  const [dailyStatus, setDailyStatus] = useState("INVITADO");
  const [isJoining, setIsJoining] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "success" });
  const { user } = useAuth();
  const navigate = useNavigate();

  // Temporizador hasta medianoche
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight - now;
      const h = Math.floor((diff / 3600000) % 24).toString().padStart(2, "0");
      const m = Math.floor((diff / 60000) % 60).toString().padStart(2, "0");
      const s = Math.floor((diff / 1000) % 60).toString().padStart(2, "0");
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  // Carga de datos (único effect)
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [resPopulares, resDaily] = await Promise.all([
          fetch(`${API_URL}/api/challenges`),
          fetch(`${API_URL}/api/challenges/daily`),
        ]);

        const dataPopulares = await resPopulares.json();
        const sortedChallenges = dataPopulares
          .map(c => ({ 
            ...c, 
            valoracionPromedio: c.valoracionPromedio || 0,
            participantes: c.participantes || 0 
          }))
          .sort((a, b) => {
            // Primero comparamos por número de participantes
            if (b.participantes !== a.participantes) {
              return b.participantes - a.participantes;
            }
            // Si tienen los mismos participantes, ordenamos por valoración
            return b.valoracionPromedio - a.valoracionPromedio;
          });

        setPopularChallenges(sortedChallenges);

        const dataDaily = await resDaily.json();
        if (dataDaily.reto) {
          setDailyChallenge(dataDaily.reto);
          setChallengersImages(dataDaily.imagenesParticipantes || []);

          if (user?._id) {
            const estadoRes = await fetch(
              `${API_URL}/api/challenges/${dataDaily.reto._id}/estado/${user._id}`
            );
            const dataEstado = await estadoRes.json();
            if (dataEstado.estado === "no_unido") setDailyStatus("UNIRSE");
            else if (dataEstado.estado === "pendiente") setDailyStatus("SUBIR");
            else setDailyStatus("COMPLETADO");
          } else {
            setDailyStatus("INVITADO");
          }
        } else {
          setDailyChallenge(null);
        }
      } catch (error) {
        console.error("Error al conectar con el backend:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleViewDetails = (id) => navigate(`/reto/${id}`);

  const handleAcceptDaily = async () => {
    if (!user) {
      setAlert({ message: "Debes iniciar sesión para aceptar el reto", type: "error" });
      return;
    }
    setIsJoining(true);
    try {
      const response = await fetch(`${API_URL}/api/challenges/${dailyChallenge._id}/participar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId: user._id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Error al unirse al reto");
      setDailyStatus("SUBIR");
      setAlert({ message: "¡Te has unido al reto diario!", type: "success" });
    } catch (err) {
      setAlert({ message: err.message || "Error al unirse al reto", type: "error" });
    } finally {
      setIsJoining(false);
    }
  };

  const renderDailyButton = () => {
    const isOwner = user && dailyChallenge &&
      String(user._id) === String(dailyChallenge.creadorId?._id || dailyChallenge.creadorId);
    if (isOwner) return null;

    switch (dailyStatus) {
      case "COMPLETADO":
        return <button className="accept-challenge-btn" disabled>¡RETO COMPLETADO!</button>;
      case "SUBIR":
        return (
          <button className="accept-challenge-btn" onClick={() => navigate(`/reto/${dailyChallenge._id}/responder`)}>
            SUBIR RESPUESTA
          </button>
        );
      case "UNIRSE":
        return (
          <button className="accept-challenge-btn" onClick={handleAcceptDaily} disabled={isJoining}>
            {isJoining ? "Uniéndose..." : "¡ACEPTAR RETO!"}
          </button>
        );
      default:
        return (
          <button className="accept-challenge-btn" onClick={() => handleViewDetails(dailyChallenge._id)}>
            VER RETO
          </button>
        );
    }
  };

  return (
    <div className="homepage-wrapper">
      <main className="homepage-main">

        <section className="hero-section">
          <h1 className="hero-title">¿Te atreves?</h1>
          <p className="hero-subtitle">
            Pon a prueba tu valentía — o la de tus amigos, o tus enemigos — con retos nuevos cada día.
            Supéralos, demuéstralo y gana fama eterna… o al menos unos likes.
          </p>
          {!user && (
            <p className="hero-cta-text">
              <Link to="/login" className="hero-link">Inicia sesión</Link> para crear retos, gestionar tus respuestas y dejar tu huella en la comunidad.
            </p>
          )}
        </section>

        <section className="daily-challenge-box">
          <h1 className="main-title">RETO DIARIO</h1>
          {loading ? (
            <div className="daily-white-card">
              <p className="no-challengers">Cargando reto diario...</p>
            </div>
          ) : !dailyChallenge ? (
            <div className="daily-white-card">
              <p className="no-challengers">No hay reto diario disponible por el momento.</p>
            </div>
          ) : (
            <>
              <Link to={`/reto/${dailyChallenge._id}`} className="daily-white-card daily-card-link">
                <div className="daily-card-header">
                  <h2 className="challenge-title">{dailyChallenge.titulo}</h2>
                  <span className="participants-badge">
                    <strong>{dailyChallenge.participantes || 0}</strong> {dailyChallenge.participantes === 1 ? "persona" : "personas"} participando
                  </span>
                </div>

                <hr className="header-divider" />

                <div className="daily-card-body">
                  {dailyChallenge.imagenDesafio ? (
                    <img
                      src={dailyChallenge.imagenDesafio}
                      alt={dailyChallenge.titulo}
                      className="challenge-main-image"
                    />
                  ) : (
                    <div className="image-placeholder">Sin imagen de reto</div>
                  )}
                </div>
              </Link>

              <div className="daily-actions-row">
                <div className="timer-box">
                  <span className="timer-tag">TIEMPO RESTANTE</span>
                  <span className="timer-val">{timeLeft || "00h 00m 00s"}</span>
                </div>
                {renderDailyButton()}
              </div>

              <hr className="section-divider" />

              <div className="challengers-section">
                <h3 className="challengers-title">CHALLENGERS</h3>
                <div className="challengers-mockup-grid">
                  {challengersImages.length > 0 ? (
                    challengersImages.map((p, index) => (
                      <Link
                        key={index}
                        to={p.usuarioId ? `/profile/${p.usuarioId}` : "#"}
                        className="challenger-card-item"
                        style={{ textDecoration: "none" }}
                      >
                        <div className="challenger-photo-container">
                          {p.fotoPerfil ? (
                            <img src={p.fotoPerfil} alt={p.usuario} />
                          ) : (
                            <div className="challenger-photo-placeholder">
                              {p.usuario.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <p className="challenger-name-tag">{p.usuario}</p>
                      </Link>
                    ))
                  ) : (
                    <p className="no-challengers">¡Sé el primero en participar!</p>
                  )}
                </div>
              </div>
            </>
          )}
        </section>

        <section className="popular-section">
          <div className="popular-header-bar">
            <h2>RETOS MÁS POPULARES</h2>
          </div>

          <div className="challenges-grid">
            {loading ? (
              <div className="loading-spinner">Cargando retos...</div>
            ) : popularChallenges.length > 0 ? (
              popularChallenges.map((challenge) => (
                <ChallengeCard
                  key={challenge._id}
                  challenge={challenge}
                  onViewDetails={handleViewDetails}
                />
              ))
            ) : (
              <p>No hay retos disponibles.</p>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}

export default HomePage;
