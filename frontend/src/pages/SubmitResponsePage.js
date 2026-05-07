import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/SubmitResponsePage.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function SubmitResponsePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [challenge, setChallenge] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [valoracion, setValoracion] = useState(0);
  const [multimediaFiles, setMultimediaFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/challenges/${id}`)
      .then(r => r.json())
      .then(setChallenge)
      .catch(() => setError("No se pudo cargar el reto"));
  }, [id]);

  const handleFileChange = (e) => {
    setMultimediaFiles(prev => [...prev, ...Array.from(e.target.files)]);
  };

  const removeFile = (index) => {
    setMultimediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getTipo = (file) => {
    if (file.type.startsWith("image/")) return "imagen";
    if (file.type.startsWith("video/")) return "video";
    if (file.type.startsWith("audio/")) return "audio";
    if (file.type === "application/pdf") return "pdf";
    return "imagen";
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("archivo", file);
    const res = await fetch(`${API_URL}/api/users/upload`, { method: "POST", body: formData });
    if (!res.ok) throw new Error("Error al subir archivo");
    const data = await res.json();
    return data.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titulo.trim()) { setError("El título es obligatorio"); return; }
    if (multimediaFiles.length === 0) { setError("Debes subir al menos un archivo"); return; }

    setIsSubmitting(true);
    setError("");
    try {
      const multimediaEnvio = await Promise.all(
        multimediaFiles.map(async (file) => ({
          url: await uploadFile(file),
          tipo: getTipo(file),
        }))
      );

      const res = await fetch(`${API_URL}/api/challenges/${id}/respuesta`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioId: user._id,
          titulo: titulo.trim(),
          descripcionEnvio: descripcion.trim(),
          valoracion: valoracion || null,
          multimediaEnvio,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al enviar");

      navigate(`/reto/${id}`);
    } catch (err) {
      setError(err.message || "Error al enviar la respuesta");
      setIsSubmitting(false);
    }
  };

  if (!challenge) return <div className="loading-state">Cargando...</div>;

  return (
    <div className="submit-response-container">
      <h1 className="submit-response-title">Subir respuesta</h1>
      <p className="submit-response-challenge-name">{challenge.titulo}</p>

      {error && <div className="submit-response-error">{error}</div>}

      <form className="submit-response-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Título <span className="required">*</span></label>
          <input
            type="text"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            placeholder="Dale un nombre a tu respuesta"
          />
        </div>

        <div className="form-group">
          <label>Descripción</label>
          <textarea
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            rows={4}
            placeholder="Cuéntanos cómo fue tu experiencia..."
          />
        </div>

        <div className="form-group">
          <label>Valoración del reto</label>
          <div className="star-selector">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                type="button"
                className={`star-btn ${n <= valoracion ? "active" : ""}`}
                onClick={() => setValoracion(prev => prev === n ? 0 : n)}
              >
                ★
              </button>
            ))}
            <span className="star-label">{valoracion > 0 ? `${valoracion}/5` : "Sin valorar"}</span>
          </div>
        </div>

        <div className="form-group">
          <label>Multimedia <span className="required">*</span> <span className="optional">(foto, vídeo, audio, PDF)</span></label>
          <input
            type="file"
            accept="image/*,video/*,audio/*,application/pdf"
            multiple
            onChange={handleFileChange}
          />
          {multimediaFiles.length > 0 && (
            <ul className="multimedia-list">
              {multimediaFiles.map((file, i) => (
                <li key={i} className="multimedia-item">
                  <span>{file.name}</span>
                  <button type="button" onClick={() => removeFile(i)} className="btn-remove">✕</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button type="submit" className="btn-submit-response" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Enviar respuesta"}
        </button>
      </form>
    </div>
  );
}

export default SubmitResponsePage;
