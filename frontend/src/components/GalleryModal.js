import React from "react";
import { FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "../styles/MediaCollage.css"; // usa estilos de galería mejorada

function renderMedia(item) {
  if (!item) return null;
  const tipo = typeof item === "string" ? "imagen" : item.tipo || item.type || "imagen";
  const url = typeof item === "string" ? item : item.url || item.src || item;

  if (tipo === "imagen") return <img src={url} alt="Galería" className="gallery-enhanced-image" />;
  if (tipo === "video") return <video src={url} controls className="gallery-enhanced-image" />;
  if (tipo === "audio") return (
    <div style={{ width: "100%", textAlign: "center" }}>
      <audio src={url} controls style={{ width: "100%" }} />
    </div>
  );
  // pdf u otros
  return (
    <iframe src={url} title="Archivo" className="gallery-enhanced-image" style={{ border: "none" }} />
  );
}

export default function GalleryModal({ items = [], currentIndex = 0, onClose, onNext, onPrev }) {
  if (!items || items.length === 0) return null;

  const safeIndex = ((currentIndex % items.length) + items.length) % items.length;

  return (
    <div className="gallery-modal-enhanced" onClick={onClose}>
      <button
        onClick={(e) => { e.stopPropagation(); onClose?.(); }}
        className="gallery-close-btn-enhanced"
        aria-label="Cerrar galería"
      >
        <FaTimes size={24} />
      </button>

      <div className="gallery-modal-enhanced-content" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onPrev}
          className="gallery-nav-btn prev"
          disabled={items.length <= 1}
          aria-label="Anterior"
        >
          <FaChevronLeft size={24} />
        </button>

        {renderMedia(items[safeIndex])}

        <button
          onClick={onNext}
          className="gallery-nav-btn next"
          disabled={items.length <= 1}
          aria-label="Siguiente"
        >
          <FaChevronRight size={24} />
        </button>

        {items.length > 1 && (
          <div className="gallery-counter">
            {safeIndex + 1} / {items.length}
          </div>
        )}
      </div>
    </div>
  );
}
