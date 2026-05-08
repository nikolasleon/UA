import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/SubmitResponsePage.css";
import Modal from "../components/Modal";
import Alert from "../components/Alert";

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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "" });

  useEffect(() => {
    fetch(`${API_URL}/api/challenges/${id}`)
      .then(r => r.json())
      .then(setChallenge)
      .catch(() => setError("No se pudo cargar el reto"));
  }, [id]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const MAX_SIZE = 50 * 1024 * 1024; // 50MB
    const ALLOWED_TYPES = ["image/", "video/", "audio/", "application/pdf"];
    
    let filesToNodes = [];

    for (const file of selectedFiles) {
      const isValidType = ALLOWED_TYPES.some(type => file.type.startsWith(type) || file.type === type);
      
      if (!isValidType) {
        setAlert({ message: `Formato de "${file.name}" no permitido.`, type: "error" });
        return; // Detenemos la carga si hay un error
      } 
      
      if (file.size > MAX_SIZE) {
        setAlert({ message: `"${file.name}" supera los 10MB.`, type: "error" });
        return;
      }
      
      filesToNodes.push(file);
    }

    setMultimediaFiles(prev => [...prev, ...filesToNodes]);
    e.target.value = null; 
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
// Esta función ahora solo abre el modal
  const preSubmitCheck = (e) => {
    e.preventDefault();
    if (!titulo.trim()) { setError("El título es obligatorio"); return; }
    if (multimediaFiles.length === 0) { setError("Debes subir al menos un archivo"); return; }
    setShowConfirmModal(true);
  };

  // Esta es la función que realmente hace el trabajo (llámala desde el onConfirm del Modal)
  const executeSubmit = async () => {
    setShowConfirmModal(false);
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

      <form className="submit-response-form" onSubmit={preSubmitCheck}>
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
      <Alert 
        message={alert.message} 
        type={alert.type} 
        onClose={() => setAlert({ ...alert, message: "" })} 
      />
      {showConfirmModal && (
        <Modal
          title="¿Confirmar envío?"
          confirmText="Sí, subir prueba"
          onClose={() => setShowConfirmModal(false)}
          onConfirm={executeSubmit}
        >
          <p>Estás a punto de subir tu prueba para el reto <strong>{challenge.titulo}</strong>.</p>
          <p>Una vez enviada, los demás usuarios podrán ver tu respuesta. ¿Estás listo?</p>
        </Modal>
      )}
    </div>
  );
}

export default SubmitResponsePage;
