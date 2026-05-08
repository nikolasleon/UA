import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Alert from "../components/Alert";
import Modal from "../components/Modal";
import MediaCollage from "../components/MediaCollage";
import ResponseCard from "../components/ResponseCard";
import "../styles/ChallengePage.css";

function ChallengePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [participantes, setParticipantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("llegada");
  const [expandedGallery, setExpandedGallery] = useState(null); // {images: [], currentIndex: 0}
  
  const [userStatus, setUserStatus] = useState("INVITADO");
  const [alert, setAlert] = useState({ message: "", type: "success" });
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
        const userParam = user?._id ? `?userId=${user._id}` : "";
        const resParticipantes = await fetch(`${API_URL}/api/challenges/${id}/participantes${userParam}`);
        if (resParticipantes.ok) {
          const dataParticipantes = await resParticipantes.json();
          const lista = dataParticipantes.participantes || [];
          setParticipantes(lista);

          if (!user) {
            setUserStatus("INVITADO");
          } else {
            const estadoRes = await fetch(`${API_URL}/api/challenges/${id}/estado/${user._id}`);
            const estado = await estadoRes.json();
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
      setAlert({ message: "Debes iniciar sesión para participar.", type: "error" });
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
          setAlert({ message: "¡Te has unido al reto!", type: "success" });
          setUserStatus("SUBIR");
        }
      } catch (err) {
        console.error("Error al participar:", err);
      }
    } else if (userStatus === "SUBIR") {
      navigate(`/reto/${id}/responder`);
    }
  };

  const handleLike = async (participacionId) => {
    if (!user) { setAlert({ message: "Debes iniciar sesión para dar like.", type: "error" }); return; }
    try {
      const res = await fetch(`${API_URL}/api/challenges/${id}/participaciones/${participacionId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId: user._id }),
      });
      if (!res.ok) return;
      const { likes, likedByMe } = await res.json();
      setParticipantes(prev =>
        prev.map(p => p.id === participacionId ? { ...p, likes, likedByMe } : p)
      );
    } catch (err) {
      console.error("Error al dar like:", err);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API_URL}/api/challenges/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      navigate("/account");
    } catch {
      setShowDeleteModal(false);
      setAlert({ message: "Error al borrar el reto", type: "error" });
    }
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

  const isOwner = !!user && !!challenge &&
    String(user._id) === String(challenge.creadorId?._id || challenge.creadorId);

  // Función para renderizar el botón dinámico según el mockup
  const renderButton = () => {
    if (isOwner) return null;
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
      <Alert message={alert.message} type={alert.type} onClose={() => setAlert({ message: "", type: "success" })} />

      {showDeleteModal && (
        <Modal
          title="Borrar reto"
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          confirmText="Borrar"
          isDanger
        >
          ¿Seguro que quieres borrar este reto? Esta acción no se puede deshacer.
        </Modal>
      )}

      <div className="challenge-hero-banner">
        <h1>{challenge.titulo?.toUpperCase() || "RETO"}</h1>
        {isOwner && (
          <div className="challenge-owner-actions">
            <Link to={`/editar-reto/${id}`} className="btn-owner btn-edit">Editar</Link>
            <button onClick={() => setShowDeleteModal(true)} className="btn-owner btn-delete">Borrar</button>
          </div>
        )}
      </div>

      <main className="challenge-responsive-grid">
        
        <div className="challenge-info-column">
          <div className="challenge-card-white">
            
            <div className="challenge-rating-badge">
              <span className="rating-score">{challenge.valoracionPromedio?.toFixed(1) || "—"}/5</span>
              <span className="rating-stars">{"★".repeat(Math.round(challenge.valoracionPromedio || 0))}{"☆".repeat(5 - Math.round(challenge.valoracionPromedio || 0))}</span>
            </div>

            <div className="challenge-content-padding">
              <div className="challenge-media-container">
                <MediaCollage images={challenge.imagenDesafio ? [challenge.imagenDesafio] : []} />
              </div>

              <p className="challenge-sub-text">
                {challenge.participantes || 0} participante{challenge.participantes !== 1 ? "s" : ""}
              </p>

              <div className="challenge-description">
                <p>{challenge.descripcion}</p>
              </div>

              {challenge.multimedia?.length > 0 && (
                <div className="challenge-multimedia">
                  <h3 className="multimedia-title">Contenido multimedia</h3>
                  <div className="multimedia-grid">
                    {challenge.multimedia.map((m, i) => (
                      <div key={i} className="multimedia-media-item">
                        {m.tipo === "imagen" && (
                          <img src={m.url} alt={`multimedia-${i}`} className="multimedia-img" />
                        )}
                        {m.tipo === "video" && (
                          <video src={m.url} controls className="multimedia-video" />
                        )}
                        {m.tipo === "audio" && (
                          <div className="multimedia-audio-wrap">
                            <span className="multimedia-audio-name">{m.url.split("/").pop().split("?")[0]}</span>
                            <audio src={m.url} controls className="multimedia-audio" />
                          </div>
                        )}
                        {m.tipo === "pdf" && (
                          <div className="multimedia-download-item">
                            <span className="multimedia-tipo">📄</span>
                            <span className="multimedia-nombre">{m.url.split("/").pop().split("?")[0]}</span>
                            <a href={m.url} download target="_blank" rel="noreferrer" className="btn-download">
                              Descargar
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="challenge-footer-actions">
                <div className="challenge-tags">
                  {challenge.categoria && <span className="tag-item">{challenge.categoria.toUpperCase()}</span>}
                  {challenge.duracion && <span className="tag-item">{challenge.duracion.toUpperCase()}</span>}
                  {challenge.dificultad && <span className="tag-item">{challenge.dificultad.toUpperCase()}</span>}
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
                [...participantes]
                  .sort((a, b) =>
                    activeTab === "favoritos"
                      ? b.likes - a.likes
                      : new Date(a.fecha) - new Date(b.fecha)
                  )
                  .map((p, index) => (
                    <li key={p.id} className="ranking-item">
                      <span className="ranking-pos">{index + 1}.</span>
                      {p.usuario?._id ? (
                        <Link to={`/profile/${p.usuario._id}`} style={{ textDecoration: "none", color: "inherit", flex: 1 }}>
                          {p.usuario.nombre} {p.usuario.apellido}
                        </Link>
                      ) : (
                        <span style={{ flex: 1 }}>Usuario eliminado</span>
                      )}
                      {activeTab === "favoritos" && (
                        <span className="ranking-likes">👍 {p.likes}</span>
                      )}
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
              {participantes.length > 0 ? (
                participantes.slice(0, 3).map((p, index) => (
                  <React.Fragment key={p.id || index}>
                    <ResponseCard
                      response={p}
                      onLike={handleLike}
                      onMediaImageClick={openGallery}
                    />
                  </React.Fragment>
                ))
              ) : (
                <p className="no-data-padding">Aún no hay publicaciones.</p>
              )}
            </div>

            {expandedGallery && (
              <div className="gallery-modal" onClick={closeGallery}>
                <div className="gallery-modal__content" onClick={(e) => e.stopPropagation()}>
                  <button className="gallery-modal__close" onClick={closeGallery}>
                    ✕
                  </button>
                  <button
                    className="gallery-modal__nav gallery-modal__nav--prev"
                    onClick={prevImage}
                    aria-label="Imagen anterior"
                  >
                    ‹
                  </button>
                  <img
                    src={expandedGallery.images[expandedGallery.currentIndex]}
                    alt={`Imagen ${expandedGallery.currentIndex + 1} de ${expandedGallery.images.length}`}
                    className="gallery-modal__image"
                  />
                  <button
                    className="gallery-modal__nav gallery-modal__nav--next"
                    onClick={nextImage}
                    aria-label="Siguiente imagen"
                  >
                    ›
                  </button>
                  <div className="gallery-modal__counter">
                    {expandedGallery.currentIndex + 1} / {expandedGallery.images.length}
                  </div>
                </div>
              </div>
            )}
          </section>

        </aside>
      </main>
    </div>
  );
}

export default ChallengePage;
