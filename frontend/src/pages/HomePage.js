import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChallengeCard from "../components/ChallengeCard";
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
        setPopularChallenges(
          dataPopulares.map(c => ({ ...c, valoracionPromedio: c.valoracionPromedio || 0 }))
        );

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

  const renderDailyButton = () => {
    switch (dailyStatus) {
      case "COMPLETADO":
        return <button className="accept-challenge-btn">¡RETO COMPLETADO!</button>;
      case "SUBIR":
        return (
          <button className="accept-challenge-btn" onClick={() => handleViewDetails(dailyChallenge._id)}>
            SUBIR RESPUESTA
          </button>
        );
      case "UNIRSE":
      default:
        return (
          <button className="accept-challenge-btn" onClick={() => handleViewDetails(dailyChallenge._id)}>
            ¡ACEPTAR RETO!
          </button>
        );
    }
  };

  return (
    <div className="homepage-wrapper">
      <main className="homepage-main">

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
              <div className="daily-white-card">
                <div className="daily-card-header">
                  <h2 className="challenge-title">{dailyChallenge.titulo}</h2>
                  <span className="participants-badge">
                    <strong>{dailyChallenge.participantes || 0}</strong> personas participando
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
              </div>

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
                      <div key={index} className="challenger-card-item">
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
                      </div>
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
