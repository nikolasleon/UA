import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header"; // Asegúrate de que la ruta sea correcta[cite: 6]
import ChallengeCard from "../components/ChallengeCard"; 
import MediaCollage from "../components/MediaCollage";
import "../styles/HomePage.css"; 

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function HomePage() {
  const [popularChallenges, setPopularChallenges] = useState([]);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [challengersImages, setChallengersImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState("");
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

  // 2. Carga de datos desde la Base de Datos[cite: 2, 3]
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
        
      } catch (error) {
        console.error("Error al conectar con el backend:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleViewDetails = (id) => {
    navigate(`/reto/${id}`); // Redirige a la página de detalle que configuramos
  };

  return (
    <div className="homepage-wrapper">

      <main className="homepage-main">
        {/* SECCIÓN RETO DIARIO - Diseño Responsive[cite: 1] */}
        <section className="daily-challenge-box">
          <h1 className="main-title">RETO DIARIO</h1>

          <div className="daily-banner">
            <div className="daily-banner-header">
              <h2>{dailyChallenge?.titulo || "CARGANDO RETO..."}</h2>
              <span className="participants-count">
                {dailyChallenge?.participantes || 0} personas participando
              </span>
            </div>

            <div className="daily-banner-content">
              {dailyChallenge?.imagenDesafio && (
                <img 
                  src={dailyChallenge.imagenDesafio} 
                  alt="Ilustración del reto" 
                  className="banner-image"
                />
              )}
            </div>
          </div>

          {/* Temporizador y Acción */}
          <div className="daily-actions">
            <div className="timer-container">
              <span className="timer-label">TIEMPO RESTANTE</span>
              <span className="timer-clock">{timeLeft || "00h 00m 00s"}</span>
            </div>
            
            <button 
              className="accept-btn"
              onClick={() => dailyChallenge && handleViewDetails(dailyChallenge._id)}
            >
              ¡ACEPTAR RETO!
            </button>
          </div>

          {/* Galería de Challengers[cite: 1] */}
          <div className="challengers-container">
            <h3>CHALLENGERS</h3>
            {challengersImages.length > 0 ? (
              <MediaCollage images={challengersImages} />
            ) : (
              <p className="no-challengers">¡Sé el primero en participar!</p>
            )}
          </div>
        </section>

        {/* SECCIÓN POPULARES - Grid de Tarjetas[cite: 1] */}
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
