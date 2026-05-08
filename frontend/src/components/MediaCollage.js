import React from "react";
import { FaExpand, FaPlay } from "react-icons/fa";
import "../styles/MediaCollage.css";

/**
 * Componente que muestra un collage de imágenes tipo WhatsApp
 * - 1 imagen: full width
 * - 2 imágenes: 2 columnas
 * - 3 imágenes: 1 arriba, 2 abajo
 * - 4+ imágenes: 2x2 grid con +X en la última celda
 */
function MediaCollage({ images = [], onImageClick = null }) {
  if (!images || images.length === 0) return null;

  // Normalizar entrada: aceptar strings (URLs) o objetos { tipo, url }
  const mediaItems = images.map((it) => {
    if (typeof it === "string") return { tipo: "imagen", url: it };
    return { tipo: it.tipo || it.type || "imagen", url: it.url || it.src || it };
  });

  const displayCount = Math.min(mediaItems.length, 4);
  const remaining = Math.max(0, mediaItems.length - 4);

  const getGridClass = () => {
    if (mediaItems.length === 1) return "collage-1";
    if (mediaItems.length === 2) return "collage-2";
    if (mediaItems.length === 3) return "collage-3";
    return "collage-4";
  };

  return (
    <div className={`media-collage ${getGridClass()}`}>
      {mediaItems.slice(0, displayCount).map((item, index) => (
        <div
          key={index}
          className="collage-media-item"
          onClick={() => onImageClick?.(index)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter") onImageClick?.(index); }}
        >
          {item.tipo === "imagen" ? (
            <img src={item.url} alt={`Multimedia ${index + 1}`} />
          ) : item.tipo === "video" ? (
            <video src={item.url} muted playsInline loop className="collage-video-preview" />
          ) : item.tipo === "audio" ? (
            <div className="collage-file-placeholder">🎵</div>
          ) : (
            <div className="collage-file-placeholder">📄</div>
          )}

          {/* Mostrar +X solo en la última celda si hay más elementos */}
          {remaining > 0 && index === displayCount - 1 && (
            <div className="collage-overlay">
              <div className="collage-overlay-content">
                <FaExpand size={24} />
                <span className="collage-count">+{remaining}</span>
              </div>
            </div>
          )}

          {/* Ícono play para videos en miniatura */}
          {item.tipo === "video" && (
            <div className="collage-play-icon">
              <FaPlay size={20} />
            </div>
          )}

          {/* Mostrar ícono expand en hover */}
          <div className="collage-expand-icon">
            <FaExpand size={18} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default MediaCollage;
