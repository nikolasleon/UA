import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaSearch, FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import ChallengeCarousel from "../components/ChallengeCarousel";
import Alert from "../components/Alert";
import ResponseCard from "../components/ResponseCard";
import GalleryModal from "../components/GalleryModal";
import Breadcrumb from "../components/Breadcrumb";
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
    if (!userId) return;

    try {
      const response = await fetch(
        `${API_URL}/api/users/profile/${userId}?currentUserId=${userId}`
      );
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
      console.error(err);
    }
  }, [userId, updateUser]);

  const fetchUserChallenges = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

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
      console.error(err);
      setLoading(false);
    }
  }, [userId]);

  const fetchUserComments = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(`${API_URL}/api/users/${userId}/comments`);
      if (response.ok) {
        const data = await response.json();
        const validComments = data.filter(c => c.titulo || c.descripcionEnvio || c.imagenEnvio || c.multimediaEnvio?.length > 0);
        setComments(validComments.slice(0, 5));
      }
    } catch (err) {
      console.error(err);
      // Si hay error, dejar comments vacío
      setComments([]);
    }
  }, [userId]);

  useEffect(() => {
    document.title = user ? `${user.nombre} – DayDare` : "Mi perfil – DayDare";
  }, [user]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Solo hacer fetch si hay userId y usuario autenticado
    if (!userId) {
      setLoading(false);
      return;
    }
    
    fetchUserData();
    fetchUserChallenges();
    fetchUserComments();
  }, [userId, fetchUserData, fetchUserChallenges, fetchUserComments]);

  const openGallery = (items, startIndex = 0) => {
    // items puede ser array de URLs o array de {tipo,url}
    setExpandedGallery({
      images: items,
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
    navigate("/crear-reto");
  };

  const handleViewChallenge = (challengeId) => {
    navigate(`/reto/${challengeId}`);
  };

  const scrollToSection = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const getFilteredComments = () => {
    return comments.filter((comment) => {
      const searchLower = searchComment.toLowerCase();
      const searchableText = [
        comment.titulo,
        comment.descripcionEnvio,
        comment.desafioId?.titulo,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesSearch = searchableText.includes(searchLower);

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

  const handleDeleteResponse = async (challengeId) => {
    try {
      const res = await fetch(`${API_URL}/api/challenges/${challengeId}/respuesta/${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al borrar");
      setChallenges(prev => ({
        ...prev,
        completados: prev.completados.filter(c => c._id !== challengeId),
      }));
      setAlert({ message: "Respuesta borrada correctamente", type: "success" });
    } catch {
      setAlert({ message: "✕ Error al borrar la respuesta", type: "error" });
    }
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

      setAlert({ message: "Reto eliminado correctamente", type: "success" });
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
      <Breadcrumb items={[{ label: "Inicio", to: "/" }, { label: "Mi perfil" }]} />
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
              onDeleteResponse={handleDeleteResponse}
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
                  <FaSearch className="comments-search-icon" />
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
                      className="comments-clear-icon"
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
                  <ResponseCard
                    key={comment._id || index}
                    response={{
                      ...comment,
                      isOwn: true,
                    }}
                    userInfo={user}
                    challengeTitle={comment.desafioId?.titulo}
                    showChallengeTitle
                    onOpenChallenge={comment.desafioId ? () => handleViewChallenge(comment.desafioId._id) : null}
                    onMediaImageClick={openGallery}
                  />
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
        <GalleryModal
          items={expandedGallery.images}
          currentIndex={expandedGallery.currentIndex}
          onClose={closeGallery}
          onNext={nextImage}
          onPrev={prevImage}
        />
      )}

    </div>
  );
}

export default AccountPage;
