import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header"; // Ajusta la ruta según tu estructura
import ChallengeCard from "./ChallengeCard"; 
import MediaCollage from "./MediaCollage";
import "../styles/HomePage.css"; // Estilos personalizados que imiten tu captura

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function HomePage() {
  const [popularChallenges, setPopularChallenges] = useState([]);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [challengersImages, setChallengersImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Obtener todos los retos activos para la sección inferior
        const resPopulares = await fetch(`${API_URL}/challenges`);
        const dataPopulares = await resPopulares.json();
        
        // Aseguramos que valoracionPromedio no rompa el ChallengeCard si viene undefined
        const formattedPopulares = dataPopulares.map(c => ({
          ...c,
          valoracionPromedio: c.valoracionPromedio || 0
        }));
        setPopularChallenges(formattedPopulares);

        // 2. Obtener el reto diario y las imágenes de los participantes
        // Nota: Crearemos este endpoint en el backend más abajo
        const resDaily = await fetch(`${API_URL}/challenges/daily`);
        const dataDaily = await resDaily.json();
        
        setDailyChallenge(dataDaily.reto);
        setChallengersImages(dataDaily.imagenesParticipantes || []);
        
      } catch (error) {
        console.error("Error al conectar con el backend", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleViewDetails = (id) => {
    navigate(`/challenges/${id}`);
  };

  return (
    <div className="homepage-wrapper">
      {/* 1. Header que ya tienes programado */}
      <Header />

      <main className="homepage-main">
        {/* 2. Sección del Reto Diario (Caja verde de tu imagen) */}
        <section className="daily-challenge-box">
          <h1 className="main-title">RETO DIARIO</h1>

          <div className="daily-banner">
            <div className="daily-banner-header">
              <h2>{dailyChallenge?.titulo || "Cargando reto..."}</h2>
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

          {/* Fila de temporizador y botón */}
          <div className="daily-actions">
            <div className="timer-container">
              <span className="timer-label">TIEMPO RESTANTE</span>
              <span className="timer-clock">14h 23m</span> {/* Puedes dinamizar esto con un setInterval */}
            </div>
            
            <button 
              className="accept-btn"
              onClick={() => dailyChallenge && handleViewDetails(dailyChallenge._id)}
            >
              ¡ACEPTAR RETO!
            </button>
          </div>

          {/* 3. Componente MediaCollage usado para los Challengers */}
          <div className="challengers-container">
            <h3>CHALLENGERS</h3>
            {challengersImages.length > 0 ? (
              <MediaCollage 
                images={challengersImages} 
                onImageClick={(index) => console.log(`Click en imagen ${index}`)}
              />
            ) : (
              <p className="no-challengers">¡Sé el primero en participar!</p>
            )}
          </div>
        </section>

        {/* 4. Sección de Retos Populares (Cards inferiores) */}
        <section className="popular-section">
          <div className="popular-header-bar">
            <h2>RETOS MÁS POPULARES</h2>
          </div>

          <div className="challenges-grid">
            {loading ? (
              <p>Cargando retos...</p>
            ) : popularChallenges.length > 0 ? (
              popularChallenges.map((challenge) => (
                <ChallengeCard
                  key={challenge._id}
                  challenge={challenge}
                  onViewDetails={handleViewDetails}
                />
              ))
            ) : (
              <p>No hay retos disponibles en este momento.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default HomePage;
