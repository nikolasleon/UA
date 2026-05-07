import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChallengeCard from "../components/ChallengeCard"; 
import MediaCollage from "../components/MediaCollage";
import { useAuth } from "../context/AuthContext";
import "../styles/HomePage.css"; 

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function HomePage() {
  const [popularChallenges, setPopularChallenges] = useState([]);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [challengersImages, setChallengersImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState("");
  const { user } = useAuth();
  const [dailyStatus, setDailyStatus] = useState("INVITADO");
  const navigate = useNavigate();

  // 1. Lógica del Temporizador Dinámico
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0); // Establece el objetivo a las 00:00:00 del día siguiente

      const diff = midnight - now;

      if (diff > 0) {
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        // Formateo con ceros a la izquierda para mantener la estética
        const hDisplay = hours.toString().padStart(2, "0");
        const mDisplay = minutes.toString().padStart(2, "0");
        const sDisplay = seconds.toString().padStart(2, "0");

        setTimeLeft(`${hDisplay}h ${mDisplay}m ${sDisplay}s`);
      } else {
        setTimeLeft("00h 00m 00s");
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer); // Limpieza para evitar fugas de memoria
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const resPopulares = await fetch(`${API_URL}/api/challenges`);
        const dataPopulares = await resPopulares.json();

        setPopularChallenges(dataPopulares);

        const resDaily = await fetch(`${API_URL}/api/challenges/daily`);
        const dataDaily = await resDaily.json();

        if (dataDaily.reto) {
          setDailyChallenge(dataDaily.reto);
          setChallengersImages(dataDaily.imagenesParticipantes || []);
        }

      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const loadStatus = async () => {
      if (!dailyChallenge || !user?._id) return;

      try {
        const res = await fetch(
          `${API_URL}/api/challenges/${dailyChallenge._id}/estado/${user._id}`
        );
        const data = await res.json();

        const estado = data.estado;

        if (estado === "no_unido") {
          setDailyStatus("UNIRSE");
        } else if (estado === "pendiente") {
          setDailyStatus("SUBIR");
        } else {
          setDailyStatus("COMPLETADO");
        }

      } catch (err) {
        console.error("Error estado:", err);
      }
    };

    loadStatus();
  }, [dailyChallenge, user]);

  // 2. Carga de datos desde la Base de Datos
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Obtener retos populares
        const resPopulares = await fetch(`${API_URL}/api/challenges`);
        const dataPopulares = await resPopulares.json();
        
        const formattedPopulares = dataPopulares.map(c => ({
          ...c,
          valoracionPromedio: c.valoracionPromedio || 0
        }));
        setPopularChallenges(formattedPopulares);

        // Obtener reto diario y fotos de comunidad
        const resDaily = await fetch(`${API_URL}/api/challenges/daily`);
        const dataDaily = await resDaily.json();
        
        if (dataDaily.reto) {
          setDailyChallenge(dataDaily.reto);
          setChallengersImages(dataDaily.imagenesParticipantes || []);
        }

        if (dataDaily.reto && user?._id) {
          try {
            const estadoRes = await fetch(
              `${API_URL}/api/challenges/${dataDaily.reto._id}/estado/${user._id}`
            );
            const dataEstado = await estadoRes.json();

            const estado = dataEstado.estado; // 👈 importante

            if (estado === "no_unido") {
              setDailyStatus("UNIRSE");
            } else if (estado === "pendiente") {
              setDailyStatus("SUBIR");
            } else {
              setDailyStatus("COMPLETADO");
            }

          } catch (err) {
            console.error("Error obteniendo estado diario:", err);
          }
        }
        
      } catch (error) {
        console.error("Error al conectar con el backend:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleViewDetails = (id) => {
    navigate(`/reto/${id}`); 
  };

  const renderDailyButton = () => {
    switch (dailyStatus) {
      case "COMPLETADO":
        return <button className="accept-challenge-btn">¡RETO COMPLETADO!</button>;

      case "SUBIR":
        return (
          <button
            className="accept-challenge-btn"
            onClick={() => handleViewDetails(dailyChallenge._id)}
          >
            SUBIR RESPUESTA
          </button>
        );

      case "UNIRSE":
      default:
        return (
          <button
            className="accept-challenge-btn"
            onClick={() => handleViewDetails(dailyChallenge._id)}
          >
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

          <div className="daily-white-card">
            <div className="daily-card-header">
              <h2 className="challenge-title">{dailyChallenge?.titulo || "CARGANDO..."}</h2>
              <span className="participants-badge">
                <strong>{dailyChallenge?.participantes || 0}</strong> personas participando
              </span>
            </div>
            
            <hr className="header-divider" />

            <div className="daily-card-body">
              {dailyChallenge?.imagenDesafio ? (
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
                    <img src={p.url} alt={`Reto por ${p.usuario}`} />
                  </div>
                  <p className="challenger-name-tag">
                    {p.usuario} - ¡Reto hecho!
                  </p>
                </div>
              ))
            ) : (
              <p className="no-challengers">¡Sé el primero en participar!</p>
            )}
          </div>
        </div>
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
