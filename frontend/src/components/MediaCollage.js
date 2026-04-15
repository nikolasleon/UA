import React from "react";
import { FaExpand } from "react-icons/fa";
import "../styles/MediaCollage.css";

/**
 * Componente que muestra un collage de imágenes tipo WhatsApp
 * - 1 imagen: full width
 * - 2 imágenes: 2 columnas
 * - 3 imágenes: 1 arriba, 2 abajo
 * - 4+ imágenes: 2x2 grid con +X en la última celda
 */
function MediaCollage({ images = [], onImageClick = null }) {
  if (!images || images.length === 0) {
    return null;
  }

  const displayCount = Math.min(images.length, 4);
  const remainingImages = Math.max(0, images.length - 4);

  const getGridClass = () => {
    if (images.length === 1) return "collage-1";
    if (images.length === 2) return "collage-2";
    if (images.length === 3) return "collage-3";
    return "collage-4";
  };

  return (
    <div className={`media-collage ${getGridClass()}`}>
      {images.slice(0, displayCount).map((image, index) => (
        <div 
          key={index} 
          className="collage-media-item"
          onClick={() => onImageClick?.(index)}
        >
          <img src={image} alt={`Imagen ${index + 1}`} />

          {/* Mostrar +X solo en la última celda si hay más imágenes */}
          {remainingImages > 0 && index === displayCount - 1 && (
            <div className="collage-overlay">
              <div className="collage-overlay-content">
                <FaExpand size={24} />
                <span className="collage-count">+{remainingImages}</span>
              </div>
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
