import React, { useRef } from "react";
import "../styles/components/ChallengeCarousel.css";
import ChallengeCard from "./ChallengeCard";

function ChallengeCarousel({
  title,
  challenges,
  onEdit,
  onDelete,
  onViewDetails,
  onViewAll,
  children,
}) {
  const sliderRef = useRef(null);

  const sortedChallenges = [...challenges].sort((a, b) => {
    const dateA = a?.fechaCreacion ? new Date(a.fechaCreacion).getTime() : 0;
    const dateB = b?.fechaCreacion ? new Date(b.fechaCreacion).getTime() : 0;
    return dateB - dateA;
  });

  const visibleChallenges = sortedChallenges.slice(0, 3);
  const showViewAllCard = challenges.length > 3 && onViewAll;

  return (
    <section className="challenge-section" role="region" aria-label={title}>
      <div className="challenge-section__header">
        <div className="challenge-section__heading">
          <h2 className="challenge-section__title">{title}</h2>
          {children && (
            <div className="challenge-section__button-inline">
              {children}
            </div>
          )}
        </div>

        <p className="challenge-section__count">
          {challenges.length} {challenges.length === 1 ? "reto" : "retos"}
        </p>
      </div>

      <div className="challenge-section__content">
        {challenges.length === 0 ? (
          <p className="challenge-section__empty">No hay retos en esta categor&iacute;a</p>
        ) : (
          <>
            <div
              ref={sliderRef}
              className="challenge-grid"
            >
              {visibleChallenges.map((challenge) => (
                <ChallengeCard
                  key={challenge._id}
                  challenge={challenge}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onViewDetails={onViewDetails}
                />
              ))}

              {showViewAllCard && (
                <button
                  type="button"
                  onClick={onViewAll}
                  className="challenge-more-card"
                  aria-label={`Ver todos los ${title.toLowerCase()}`}
                >
                  <span className="challenge-more-card__eyebrow">M&aacute;s retos</span>
                  <span className="challenge-more-card__title">Ver todos</span>
                  <span className="challenge-more-card__text">
                    Consulta la lista completa de {title.toLowerCase()}.
                  </span>
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default ChallengeCarousel;
