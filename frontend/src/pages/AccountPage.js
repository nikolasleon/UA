import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaStar, FaSearch, FaTimes, FaArrowUp, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import ChallengeCarousel from "../components/ChallengeCarousel";
import Alert from "../components/Alert";
import MediaCollage from "../components/MediaCollage";
import "../styles/AccountPage.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function AccountPage() {
  const { user: authUser, updateUser } = useAuth();
  const [user, setUser] = useState(null);
  const [challenges, setChallenges] = useState({ creados: [], enProgreso: [], completados: [] });
  const [comments, setComments] = useState([]);
  const [searchComment, setSearchComment] = useState("");
  const [filteredRating, setFilteredRating] = useState("");
  const [dateFrom, setDateFrom] = useState(""); // "YYYY-MM-DD"
  const [dateTo, setDateTo] = useState(""); // "YYYY-MM-DD"
  const [activeTab, setActiveTab] = useState("retos");
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [expandedGallery, setExpandedGallery] = useState(null); // {images: [], currentIndex: 0}
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ message: "", type: "success" });
  const navigate = useNavigate();

  // Refs para scroll a secciones
  const completadosRef = useRef(null);
  const creadosRef = useRef(null);
  const enProgresoRef = useRef(null);

  const userId = authUser?._id;

  const fetchUserData = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/users/profile/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        updateUser({
          nombre: data.nombre || "",
          apellido: data.apellido || "",
          email: data.email || "",
          fotoPerfil: data.fotoPerfil || "",
        });
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  }, [userId, updateUser]);

  const fetchUserChallenges = useCallback(async () => {
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
  }, [userId]);

  const fetchUserComments = useCallback(async () => {
    try {
      console.log(`Fetching comments for user: ${userId}`);
      const response = await fetch(`${API_URL}/api/users/${userId}/comments`);
      console.log(`Response status: ${response.status}`);
      if (response.ok) {
        const data = await response.json();
        console.log("Comments data:", data);
        // Filtrar comentarios que tengan descripción o imagen (los que realmente tengan contenido)
        const validComments = data.filter(c => c.descripcionEnvio || c.imagenEnvio);
        console.log("Valid comments:", validComments);
        setComments(validComments.slice(0, 5));
      } else {
        console.error("Error response:", response.statusText);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
      // Si hay error, dejar comments vacío
      setComments([]);
    }
  }, [userId]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Solo hacer fetch si hay userId y usuario autenticado
    if (!userId) {
      console.log("No hay userId, no se hace fetch");
      setLoading(false);
      return;
    }
    
    fetchUserData();
    fetchUserChallenges();
    fetchUserComments();
  }, [userId, fetchUserData, fetchUserChallenges, fetchUserComments]);

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

  // Scroll to top button handler
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollToTop(true);
      } else {
        setShowScrollToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const openGallery = (images, startIndex = 0) => {
    setExpandedGallery({
      images: images,
      currentIndex: startIndex
    });
  };

  const closeGallery = () => {
    setExpandedGallery(null);
  };

  const nextImage = () => {
    if (!expandedGallery) return;
    setExpandedGallery({
      ...expandedGallery,
      currentIndex: (expandedGallery.currentIndex + 1) % expandedGallery.images.length
    });
  };

  const prevImage = () => {
    if (!expandedGallery) return;
    setExpandedGallery({
      ...expandedGallery,
      currentIndex: (expandedGallery.currentIndex - 1 + expandedGallery.images.length) % expandedGallery.images.length
    });
  };

  const handleEditProfile = () => {
    navigate("/settings");
  };

  const handleCreateChallenge = () => {
    navigate("/create-challenge");
  };

  const handleViewChallenge = (challengeId) => {
    navigate(`/challenge/${challengeId}`);
  };

  const scrollToSection = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const getFilteredComments = () => {
    return comments.filter((comment) => {
      // Filtro de búsqueda por texto (solo en descripcionEnvio)
      const searchLower = searchComment.toLowerCase();
      const matchesSearch = comment.descripcionEnvio?.toLowerCase().includes(searchLower);

      // Filtro de valoración
      const matchesRating =
        filteredRating === "" || comment.valoracion?.toString() === filteredRating;

      // Filtro de fecha
      let matchesDate = true;
      if (dateFrom || dateTo) {
        const commentDate = new Date(comment.fechaEnvio);
        if (dateFrom) {
          const fromDate = new Date(dateFrom);
          if (commentDate < fromDate) matchesDate = false;
        }
        if (dateTo) {
          const toDate = new Date(dateTo);
          // Ajustar toDate al final del día
          toDate.setHours(23, 59, 59, 999);
          if (commentDate > toDate) matchesDate = false;
        }
      }

      return matchesSearch && matchesRating && matchesDate;
    });
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

      {/* Tabs de contenido */}
      <div className="tabs-container" role="tablist" aria-label="Vistas de contenido">
        <button
          onClick={() => setActiveTab("retos")}
          className={`tab-button ${activeTab === "retos" ? "active" : ""}`}
          role="tab"
          aria-selected={activeTab === "retos"}
          aria-label="Ver retos"
        >
          Mis Retos
        </button>
        <button
          onClick={() => setActiveTab("comentarios")}
          className={`tab-button ${activeTab === "comentarios" ? "active" : ""}`}
          role="tab"
          aria-selected={activeTab === "comentarios"}
          aria-label="Ver comentarios"
        >
          Últimos Comentarios
        </button>
      </div>

      {/* Contenido de tabs */}
      {activeTab === "retos" ? (
        <div className="tab-content">
          {/* Métricas - Solo en pestaña de Retos */}
          <div className="metrics-grid" role="region" aria-label="Estadísticas del usuario">
            <button
              onClick={() => scrollToSection(completadosRef)}
              className="metric-card"
              aria-label={`${challenges.completados.length} retos completados, haz clic para ver`}
            >
              <div className="metric-value">{challenges.completados.length}</div>
              <div className="metric-label">Retos Completados</div>
            </button>

            <button
              onClick={() => scrollToSection(creadosRef)}
              className="metric-card"
              aria-label={`${challenges.creados.length} retos creados, haz clic para ver`}
            >
              <div className="metric-value">{challenges.creados.length}</div>
              <div className="metric-label">Retos Creados</div>
            </button>

            <button
              onClick={() => scrollToSection(enProgresoRef)}
              className="metric-card"
              aria-label={`${challenges.enProgreso.length} retos en progreso, haz clic para ver`}
            >
              <div className="metric-value">{challenges.enProgreso.length}</div>
              <div className="metric-label">En Progreso</div>
            </button>
          </div>

          {/* Carruseles de Retos */}
          <div ref={completadosRef}>
            <ChallengeCarousel
              title="Retos Completados"
              challenges={challenges.completados}
              onViewDetails={handleViewChallenge}
              onViewAll={() => navigate("/my-challenges/completados")}
            />
          </div>

          <div ref={creadosRef}>
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
                <FaPlus style={{ marginRight: "0.5rem" }} />
                Crear Reto
              </button>
            </ChallengeCarousel>
          </div>

          <div ref={enProgresoRef}>
            <ChallengeCarousel
              title="Retos en Progreso"
              challenges={challenges.enProgreso}
              onViewDetails={handleViewChallenge}
              onViewAll={() => navigate("/my-challenges/en-progreso")}
            />
          </div>
        </div>
      ) : (
        <div className="tab-content">
          <div className="comments-section">
            <h2>Últimos Comentarios</h2>

            {/* Filtros de comentarios */}
            {comments.length > 0 && (
              <div className="comments-filters">
                <div className="search-bar-filters">
                  <FaSearch style={{ position: "absolute", left: "1rem", color: "#007bff" }} />
                  <input
                    type="text"
                    placeholder="Buscar en comentarios..."
                    value={searchComment}
                    onChange={(e) => setSearchComment(e.target.value)}
                    className="search-input"
                  />
                  {searchComment && (
                    <FaTimes
                      onClick={() => setSearchComment("")}
                      style={{ position: "absolute", right: "1rem", cursor: "pointer", color: "#999" }}
                    />
                  )}
                </div>

                <div className="filter-group">
                  <label className="filter-label">Valoración:</label>
                  <select
                    value={filteredRating}
                    onChange={(e) => setFilteredRating(e.target.value)}
                    className="filter-select"
                    aria-label="Filtrar por valoración"
                  >
                    <option value="">Todas las valoraciones</option>
                    <option value="5">★★★★★ 5 estrellas</option>
                    <option value="4">★★★★ 4 estrellas</option>
                    <option value="3">★★★ 3 estrellas</option>
                    <option value="2">★★ 2 estrellas</option>
                    <option value="1">★ 1 estrella</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label className="filter-label">Fecha:</label>
                  <div className="date-filters">
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="date-input"
                      aria-label="Fecha desde"
                    />
                    <span className="date-separator">-</span>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="date-input"
                      aria-label="Fecha hasta"
                    />
                    {(dateFrom || dateTo) && (
                      <button
                        onClick={() => {
                          setDateFrom("");
                          setDateTo("");
                        }}
                        className="btn-clear-dates"
                        aria-label="Limpiar filtro de fechas"
                      >
                        Limpiar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {getFilteredComments().length > 0 ? (
              <div className="comments-grid">
                {getFilteredComments().map((comment, index) => (
                  <div 
                    key={index} 
                    className="comment-card"
                    onClick={() => comment.desafioId && handleViewChallenge(comment.desafioId._id)}
                    style={{ cursor: comment.desafioId ? 'pointer' : 'default' }}
                  >
                    {comment.imagenEnvio || (comment.imagenesEnvio && comment.imagenesEnvio.length > 0) ? (
                      <div className="comment-image-wrapper" onClick={(e) => e.stopPropagation()}>
                        <MediaCollage 
                          images={comment.imagenesEnvio && comment.imagenesEnvio.length > 0 ? comment.imagenesEnvio : [comment.imagenEnvio]}
                          onImageClick={(index) => openGallery(comment.imagenesEnvio && comment.imagenesEnvio.length > 0 ? comment.imagenesEnvio : [comment.imagenEnvio], index)}
                        />
                      </div>
                    ) : null}
                    <div className="comment-content">
                      <p className="comment-date">
                        {new Date(comment.fechaEnvio).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <div className="comment-rating">
                        {comment.valoracion && (
                          <div className="rating-stars">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                size={16}
                                color={i < comment.valoracion ? "#FFD700" : "#e0e0e0"}
                              />
                            ))}
                          </div>
                        )}
                        <span className="rating-value">
                          {comment.valoracion ? `${comment.valoracion}/5` : "Sin valorar"}
                        </span>
                      </div>
                      {comment.descripcionEnvio && (
                        <div className="comment-user-section">
                          <p className="comment-description">{comment.descripcionEnvio}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-comments">
                {comments.length > 0 ? "No hay comentarios que coincidan con los filtros" : "Aún no has enviado comentarios en retos completados"}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Modal Galería de Imágenes con Navegación */}
      {expandedGallery && (
        <div 
          className="gallery-modal-enhanced"
          onClick={closeGallery}
        >
          <button
            onClick={closeGallery}
            className="gallery-close-btn-enhanced"
            aria-label="Cerrar galería"
          >
            <FaTimes size={24} />
          </button>

          <div className="gallery-modal-enhanced-content" onClick={(e) => e.stopPropagation()}>

            {/* Botón anterior */}
            <button
              onClick={prevImage}
              className="gallery-nav-btn prev"
              disabled={expandedGallery.images.length <= 1}
              aria-label="Imagen anterior"
            >
              <FaChevronLeft size={24} />
            </button>

            {/* Imagen actual */}
            <img 
              src={expandedGallery.images[expandedGallery.currentIndex]} 
              alt={`Imagen ${expandedGallery.currentIndex + 1}`}
              className="gallery-enhanced-image"
            />

            {/* Botón siguiente */}
            <button
              onClick={nextImage}
              className="gallery-nav-btn next"
              disabled={expandedGallery.images.length <= 1}
              aria-label="Imagen siguiente"
            >
              <FaChevronRight size={24} />
            </button>

            {/* Contador */}
            {expandedGallery.images.length > 1 && (
              <div className="gallery-counter">
                {expandedGallery.currentIndex + 1} / {expandedGallery.images.length}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Botón flotante para volver arriba */}
      {showScrollToTop && (
        <button
          onClick={scrollToTop}
          className="scroll-to-top-btn"
          aria-label="Volver al inicio"
          title="Volver al inicio"
        >
          <FaArrowUp size={20} />
        </button>
      )}
    </div>
  );
}

export default AccountPage;
