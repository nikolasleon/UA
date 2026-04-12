import React from "react";
import "../styles/components/ChallengeCard.css";

function ChallengeCard({ challenge, onEdit, onDelete, onViewDetails }) {
  const handleOpenDetails = () => {
    onViewDetails(challenge._id);
  };

  const handleCardKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleOpenDetails();
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
          <div className="challenge-card__header">
            <h3 className="challenge-card__title">{challenge.titulo}</h3>
            <div className="challenge-card__rating">
              ★ {challenge.valoracionPromedio.toFixed(1)}
            </div>
          </div>

          <p className="challenge-card__description">
            {challenge.descripcion.substring(0, 80)}...
          </p>

          <div className="challenge-card__meta">
            <span className="challenge-card__creator">
              por <strong>{challenge.creador}</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="challenge-card__actions">
        {onDelete && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm("¿Estás seguro de que quieres eliminar este reto?")) {
                onDelete(challenge._id);
              }
            }}
            className="challenge-card__action challenge-card__action--delete"
            aria-label={`Eliminar reto ${challenge.titulo}`}
          >
            Eliminar
          </button>
        )}
      </div>
    </article>
  );
}

export default ChallengeCard;
