import React from "react";
import "../styles/components/Modal.css";

function Modal({ title, children, onClose, onConfirm, confirmText = "Confirmar", isDanger = false }) {
  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="modal-content" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">
            {title}
          </h2>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Cerrar diálogo"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">{children}</div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary" aria-label="Cancelar">
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`btn ${isDanger ? "btn-danger" : "btn-primary"}`}
            aria-label={confirmText}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;
