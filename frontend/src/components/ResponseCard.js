import React from "react";
import { Link } from "react-router-dom";
import { FaStar, FaThumbsUp } from "react-icons/fa";
import MediaCollage from "./MediaCollage";
import "../styles/components/ResponseCard.css";

function ResponseCard({
  response,
  userInfo,
  challengeTitle,
  onLike,
  onOpenChallenge,
  onMediaImageClick,
  showChallengeTitle = false,
}) {
  const responseId = response.id || response._id;
  const author = response.usuario || userInfo || {};
  const authorName = [author.nombre, author.apellido].filter(Boolean).join(" ") || "Usuario";
  const authorPhoto = author.fotoPerfil;
  const responseTitle = response.titulo || "Respuesta sin título";
  const description = response.descripcionEnvio;
  const date = response.fecha || response.fechaEnvio;
  const rating = response.valoracion;
  const likedByMe = !!response.likedByMe;
  const isOwn = !!response.isOwn;
  const likes = Array.isArray(response.likes) ? response.likes.length : response.likes || response.likesCount || 0;
  const multimedia = response.multimediaEnvio || [];
  const images = multimedia.filter((m) => m.tipo === "imagen").map((m) => m.url);
  const collageImages = images.length > 0 ? images : response.imagenEnvio ? [response.imagenEnvio] : [];
  const extraMedia = multimedia.filter((m) => m.tipo !== "imagen");
  const isClickable = !!onOpenChallenge;

  const handleCardKeyDown = (event) => {
    if (!isClickable) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpenChallenge();
    }
  };

  const stopCardClick = (event) => {
    event.stopPropagation();
  };

  return (
    <article
      className={`response-card ${isClickable ? "response-card--clickable" : ""}`}
      onClick={onOpenChallenge}
      onKeyDown={handleCardKeyDown}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={isClickable ? `Abrir reto ${challengeTitle || ""}`.trim() : undefined}
    >
      <div className="response-card__header">
        {author._id ? (
          <Link to={`/profile/${author._id}`} onClick={stopCardClick} className="response-card__avatar-link">
            {authorPhoto ? (
              <img src={authorPhoto} alt={`Avatar de ${authorName}`} className="response-card__avatar" />
            ) : (
              <span className="response-card__avatar-initials">{authorName.charAt(0).toUpperCase()}</span>
            )}
          </Link>
        ) : authorPhoto ? (
          <img src={authorPhoto} alt={`Avatar de ${authorName}`} className="response-card__avatar" />
        ) : (
          <span className="response-card__avatar-initials">{authorName.charAt(0).toUpperCase()}</span>
        )}

        <div className="response-card__meta">
          {author._id ? (
            <Link to={`/profile/${author._id}`} onClick={stopCardClick} className="response-card__author">
              {authorName}
            </Link>
          ) : (
            <span className="response-card__author">{authorName}</span>
          )}
          {date && (
            <time className="response-card__date" dateTime={new Date(date).toISOString()}>
              {new Date(date).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </time>
          )}
        </div>
      </div>

      <div className="response-card__body">
        {showChallengeTitle && challengeTitle && (
          <p className="response-card__challenge-title">{challengeTitle}</p>
        )}
        <h3 className="response-card__title">{responseTitle}</h3>
        {description && <p className="response-card__description">{description}</p>}
      </div>

      {collageImages.length > 0 && (
        <div className="response-card__media" onClick={stopCardClick}>
          <MediaCollage
            images={collageImages}
            onImageClick={(index) => onMediaImageClick?.(collageImages, index)}
          />
        </div>
      )}

      {extraMedia.length > 0 && (
        <div className="response-card__attachments" onClick={stopCardClick}>
          {extraMedia.map((media, index) => (
            <div key={`${media.url}-${index}`} className="response-card__attachment">
              {media.tipo === "video" && <video src={media.url} controls className="response-card__video" />}
              {media.tipo === "audio" && (
                <div className="response-card__audio-wrap">
                  <span className="response-card__file-name">{media.url.split("/").pop().split("?")[0]}</span>
                  <audio src={media.url} controls className="response-card__audio" />
                </div>
              )}
              {media.tipo === "pdf" && (
                <a href={media.url} download target="_blank" rel="noreferrer" className="response-card__download">
                  Descargar PDF
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="response-card__footer">
        <div className="response-card__rating" aria-label={rating ? `${rating} de 5 estrellas` : "Sin valorar"}>
          {[...Array(5)].map((_, index) => (
            <FaStar
              key={index}
              size={15}
              className={rating && index < rating ? "response-card__star--active" : "response-card__star"}
            />
          ))}
          <span>{rating ? `${rating}/5` : "Sin valorar"}</span>
        </div>

        {isOwn || !onLike ? (
          <span className="response-card__likes response-card__likes--readonly" aria-label={`${likes} likes`}>
            <FaThumbsUp size={14} />
            {likes}
          </span>
        ) : (
          <button
            type="button"
            className={`response-card__likes ${likedByMe ? "response-card__likes--active" : ""}`}
            onClick={(event) => {
              event.stopPropagation();
              onLike(responseId);
            }}
            aria-label={likedByMe ? "Quitar like" : "Dar like"}
          >
            <FaThumbsUp size={14} />
            {likes}
          </button>
        )}
      </div>
    </article>
  );
}

export default ResponseCard;
