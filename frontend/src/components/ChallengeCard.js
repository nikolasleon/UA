import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import Modal from "./Modal";
import "../styles/components/ChallengeCard.css";

function ChallengeCard({ challenge, onEdit, onDelete, onDeleteResponse, onViewDetails }) {
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteResponseModal, setShowDeleteResponseModal] = useState(false);
  const creator = typeof challenge.creadorId === "object" ? challenge.creadorId : null;
  const creatorName = challenge.creador || [creator?.nombre, creator?.apellido].filter(Boolean).join(" ");
  const creatorInitial = creatorName?.trim().charAt(0).toUpperCase() || "?";
  const creatorPhoto = creator?.fotoPerfil;

  const handleOpenDetails = () => {
    onViewDetails(challenge._id);
  };

  const handleCardKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleOpenDetails();
    }
  };

  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
    onDelete(challenge._id);
  };

  const handleConfirmDeleteResponse = () => {
    setShowDeleteResponseModal(false);
    onDeleteResponse(challenge._id);
  };

  const handleVisitProfile = (e) => {
    e.stopPropagation();
    // creadorId puede ser un string ID o un objeto con _id
    const creatorId = typeof challenge.creadorId === 'string' 
      ? challenge.creadorId 
      : challenge.creadorId?._id;
    
    if (creatorId) {
      navigate(`/profile/${creatorId}`);
    }
  };

  return (
    <article className="challenge-card" aria-label={`Reto: ${challenge.titulo}`}>
      <div
        className="challenge-card__surface"
        role="button"
        tabIndex={0}
        onClick={handleOpenDetails}
        onKeyDown={handleCardKeyDown}
        aria-label={`Abrir detalles del reto ${challenge.titulo}`}
      >
        <div className="challenge-card__image-wrapper">
          {challenge.imagenDesafio && (
            <img
              src={challenge.imagenDesafio}
              alt={`Imagen del reto: ${challenge.titulo}`}
              className="challenge-card__image"
            />
          )}
          <span className="challenge-card__difficulty-badge" data-difficulty={challenge.dificultad}>
            {challenge.dificultad}
          </span>
        </div>

        <div className="challenge-card__content">
          <h3 className="challenge-card__title">{challenge.titulo}</h3>

          <p className="challenge-card__description">
            {challenge.descripcion}
          </p>

          <div className="challenge-card__tags">
            <span className="challenge-card__tag">{challenge.dificultad}</span>
            {challenge.categoria && <span className="challenge-card__tag">{challenge.categoria}</span>}
            {challenge.duracion && <span className="challenge-card__tag">{challenge.duracion}</span>}
          </div>

          <div className="challenge-card__footer">
            <div className="challenge-card__rating">
              ★ {challenge.valoracionPromedio.toFixed(1)}
            </div>
            {challenge.creadorId ? (
              <button
                onClick={handleVisitProfile}
                className="challenge-card__creator-link"
                title="Ver perfil del creador"
              >
                <span className="challenge-card__creator-name">por {creatorName}</span>
                {creatorPhoto ? (
                  <img
                    src={creatorPhoto}
                    alt={`Foto de perfil de ${creatorName}`}
                    className="challenge-card__creator-avatar"
                  />
                ) : (
                  <span className="challenge-card__creator-avatar challenge-card__creator-avatar--initial">
                    {creatorInitial}
                  </span>
                )}
              </button>
            ) : (
              <span className="challenge-card__creator">
                por {creatorName}
              </span>
            )}
          </div>
        </div>
      </div>

      {onDelete && (
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="challenge-card__btn-delete"
          aria-label={`Eliminar reto ${challenge.titulo}`}
        >
          <FaTrash style={{ marginRight: "0.3rem" }} />
          Eliminar
        </button>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <Modal
          title="Eliminar Reto"
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
          confirmText="Eliminar"
          isDanger={true}
        >
          <p>¿Estás seguro de que quieres eliminar el reto <strong>"{challenge.titulo}"</strong>?</p>
          <p style={{ color: "#666", fontSize: "0.9rem" }}>
            Esta acción no se puede deshacer.
          </p>
        </Modal>
      )}

      {onDeleteResponse && (
        <button
          type="button"
          onClick={() => setShowDeleteResponseModal(true)}
          className="challenge-card__btn-delete"
          aria-label={`Borrar mi respuesta del reto ${challenge.titulo}`}
        >
          <FaTrash style={{ marginRight: "0.3rem" }} />
          Borrar respuesta
        </button>
      )}

      {showDeleteResponseModal && (
        <Modal
          title="Borrar respuesta"
          onClose={() => setShowDeleteResponseModal(false)}
          onConfirm={handleConfirmDeleteResponse}
          confirmText="Borrar"
          isDanger={true}
        >
          <p>¿Seguro que quieres borrar tu respuesta de <strong>"{challenge.titulo}"</strong>?</p>
          <p style={{ color: "#666", fontSize: "0.9rem" }}>
            Perderás tu progreso y podrás volver a unirte al reto.
          </p>
        </Modal>
      )}
    </article>
  );
}

export default ChallengeCard;
