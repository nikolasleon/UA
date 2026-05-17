import React, { useState, useEffect, useRef } from "react";
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadLabel, setUploadLabel] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "" });
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetch(`${API_URL}/api/challenges/${id}`)
      .then(r => r.json())
      .then(setChallenge)
      .catch(() => setError("No se pudo cargar el reto"));
  }, [id]);

  useEffect(() => {
    document.title = challenge ? `Subir respuesta: ${challenge.titulo} – DayDare` : "DayDare";
  }, [challenge]);

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

  const uploadFile = (file, index, total) => new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("archivo", file);
    setUploadLabel(`Subiendo archivo ${index + 1} de ${total}...`);
    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const fileBase = (index / total) * 100;
        const fileContrib = (e.loaded / e.total) * (100 / total);
        setUploadProgress(Math.round(fileBase + fileContrib));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText).url);
      } else {
        reject(new Error("Error al subir archivo"));
      }
    };
    xhr.onerror = () => reject(new Error("Error de red al subir archivo"));
    xhr.open("POST", `${API_URL}/api/users/upload`);
    xhr.send(formData);
  });

  const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    const MAX_SIZE = 50 * 1024 * 1024;
    const ALLOWED_TYPES = ["image/", "video/", "audio/", "application/pdf"];
    for (const file of droppedFiles) {
      const isValidType = ALLOWED_TYPES.some(t => file.type.startsWith(t) || file.type === t);
      if (!isValidType) { setAlert({ message: `Formato de "${file.name}" no permitido.`, type: "error" }); return; }
      if (file.size > MAX_SIZE) { setAlert({ message: `"${file.name}" supera los 50MB.`, type: "error" }); return; }
    }
    setMultimediaFiles(prev => [...prev, ...droppedFiles]);
  };

  const preSubmitCheck = (e) => {
    e.preventDefault();
    if (!titulo.trim()) { setError("El título es obligatorio"); return; }
    if (multimediaFiles.length === 0) { setError("Debes subir al menos un archivo"); return; }
    setShowConfirmModal(true);
  };

  const executeSubmit = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);
    setUploadProgress(0);
    setError("");
    try {
      const multimediaEnvio = [];
      for (let i = 0; i < multimediaFiles.length; i++) {
        const url = await uploadFile(multimediaFiles[i], i, multimediaFiles.length);
        multimediaEnvio.push({ url, tipo: getTipo(multimediaFiles[i]) });
      }
      setUploadProgress(100);
      setUploadLabel("Guardando respuesta...");

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
      <p className="submit-response-intro">
        ¿Lo conseguiste? Demuéstralo. Sube una foto, vídeo o lo que necesites para que la comunidad vea que el reto está superado.
      </p>
      <p className="submit-response-challenge-name">{challenge.titulo}</p>

      {error && <div className="submit-response-error">{error}</div>}

      <form className="submit-response-form" onSubmit={preSubmitCheck}>
        <div className="form-group">
          <label htmlFor="resp-titulo">Título <span className="required">*</span></label>
          <input
            id="resp-titulo"
            type="text"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            placeholder="Dale un nombre a tu respuesta"
          />
        </div>

        <div className="form-group">
          <label htmlFor="resp-descripcion">Descripción</label>
          <textarea
            id="resp-descripcion"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            rows={4}
            placeholder="Cuéntanos cómo fue tu experiencia..."
          />
        </div>

        <div className="form-group">
          <label id="resp-valoracion-label">Valoración del reto</label>
          <div className="star-selector" role="group" aria-labelledby="resp-valoracion-label">
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
          <div
            className={`drop-zone${isDragging ? " dragging" : ""}`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
            role="button"
            tabIndex={0}
            aria-label="Zona de carga de archivos. Haz clic o arrastra archivos aquí"
            onKeyDown={e => e.key === "Enter" && fileInputRef.current.click()}
          >
            <span className="drop-zone-icon">📎</span>
            <span className="drop-zone-text">Arrastra tus archivos aquí o <strong>haz clic para seleccionar</strong></span>
            <span className="drop-zone-hint">Imágenes, vídeos, audios o PDFs — máx. 50 MB</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*,audio/*,application/pdf"
            multiple
            onChange={handleFileChange}
            style={{ display: "none" }}
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

        {isSubmitting && (
          <div className="upload-progress-wrapper">
            <div className="upload-label">{uploadLabel}</div>
            <div className="upload-progress-track">
              <div className="upload-progress-fill" style={{ width: `${uploadProgress}%` }} />
            </div>
            <div className="upload-progress-pct">{uploadProgress}%</div>
          </div>
        )}

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
