import React, { useEffect } from "react";
import "../styles/components/Alert.css";

function Alert({ message, type = "success", onClose }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className={`alert alert-${type}`} role="alert">
      <div className="alert-content">
        <span className="alert-icon">
          {type === "success" ? "✓" : "✕"}
        </span>
        <span className="alert-message">{message}</span>
      </div>
      <button 
        className="alert-close" 
        onClick={onClose}
        aria-label="Cerrar alerta"
      >
        ×
      </button>
    </div>
  );
}

export default Alert;
