import React from "react";
import { Link } from "react-router-dom";
import "../styles/Breadcrumb.css";

function Breadcrumb({ items }) {
  return (
    <nav className="breadcrumb" aria-label="Ruta de navegación">
      {items.map((item, i) => (
        <span key={i} className="breadcrumb-item">
          {i < items.length - 1 ? (
            <>
              <Link to={item.to} className="breadcrumb-link">{item.label}</Link>
              <span className="breadcrumb-sep" aria-hidden="true">›</span>
            </>
          ) : (
            <span className="breadcrumb-current" aria-current="page">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export default Breadcrumb;
