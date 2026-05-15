import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Alert from "../components/Alert";
import Breadcrumb from "../components/Breadcrumb";
import "../styles/CreateChallengePage.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const CATEGORIAS = ["fuerza", "cardio", "aire libre", "gimnasio", "yoga"];
const DURACIONES = ["5min", "10min", "15min", "30min", "15-20min"];
const NIVELES = ["fácil", "medio", "intenso"];

function EditChallengePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    categoria: "",
    duracion: "",
    dificultad: "",
  });

  const [portadaFile, setPortadaFile] = useState(null);
  const [portadaPreview, setPortadaPreview] = useState(null);
  const [multimediaFiles, setMultimediaFiles] = useState([]);
  const [existingMultimedia, setExistingMultimedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "success" });

  useEffect(() => {
    document.title = form.titulo ? `Editar: ${form.titulo} – DayDare` : "Editar reto – DayDare";
  }, [form.titulo]);

  useEffect(() => {
    if (!user) return;
    const fetchChallenge = async () => {
      try {
        const res = await fetch(`${API_URL}/api/challenges/${id}`);
        const data = await res.json();

        const creadorId = String(data.creadorId?._id || data.creadorId);
        if (creadorId !== String(user._id)) {
          navigate(`/reto/${id}`);
          return;
        }

        setForm({
          titulo: data.titulo || "",
          descripcion: data.descripcion || "",
          categoria: data.categoria || "",
          duracion: data.duracion || "",
          dificultad: data.dificultad || "",
        });
        setPortadaPreview(data.imagenDesafio || null);
        setExistingMultimedia(data.multimedia || []);
      } catch {
        setAlert({ message: "Error al cargar el reto", type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchChallenge();
  }, [id, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePortadaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPortadaFile(file);
      setPortadaPreview(URL.createObjectURL(file));
    }
  };

  const handleMultimediaChange = (e) => {
    const files = Array.from(e.target.files);
    setMultimediaFiles((prev) => [...prev, ...files]);
  };

  const removeNewMultimedia = (index) => {
    setMultimediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingMultimedia = (index) => {
    setExistingMultimedia((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("archivo", file);
    const res = await fetch(`${API_URL}/api/users/upload`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Error al subir archivo");
    const data = await res.json();
    return data.url;
  };

  const getTipo = (file) => {
    if (file.type.startsWith("image/")) return "imagen";
    if (file.type.startsWith("video/")) return "video";
    if (file.type.startsWith("audio/")) return "audio";
    if (file.type === "application/pdf") return "pdf";
    return "imagen";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titulo.trim() || !form.descripcion.trim()) {
      setAlert({ message: "El título y la descripción son obligatorios", type: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      let imagenDesafio = portadaPreview;
      if (portadaFile) {
        imagenDesafio = await uploadFile(portadaFile);
      }

      const newMultimedia = await Promise.all(
        multimediaFiles.map(async (file) => ({
          url: await uploadFile(file),
          tipo: getTipo(file),
        }))
      );

      const multimedia = [...existingMultimedia, ...newMultimedia];

      const res = await fetch(`${API_URL}/api/challenges/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: form.titulo.trim(),
          descripcion: form.descripcion.trim(),
          categoria: form.categoria,
          duracion: form.duracion,
          dificultad: form.dificultad,
          imagenDesafio,
          multimedia,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al actualizar el reto");

      navigate(`/reto/${id}`);
    } catch (err) {
      console.error("Error al editar reto:", err);
      setAlert({ message: err.message || "Error al actualizar el reto", type: "error" });
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="loading-state">Cargando reto...</div>;

  return (
    <div className="create-challenge-container">
      <Breadcrumb items={[{ label: "Inicio", to: "/" }, { label: form.titulo || "Reto", to: `/reto/${id}` }, { label: "Editar" }]} />
      <Alert message={alert.message} type={alert.type} onClose={() => setAlert({ message: "", type: "success" })} />
      <h1 className="create-challenge-title">Editar reto</h1>

      <form className="create-challenge-form" onSubmit={handleSubmit}>

        <div className="form-group">
          <label htmlFor="edit-titulo">Título</label>
          <input id="edit-titulo" type="text" name="titulo" value={form.titulo} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label htmlFor="edit-descripcion">Descripción</label>
          <textarea id="edit-descripcion" name="descripcion" value={form.descripcion} onChange={handleChange} rows={4} />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="edit-categoria">Categoría</label>
            <select id="edit-categoria" name="categoria" value={form.categoria} onChange={handleChange}>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="edit-duracion">Duración</label>
            <select id="edit-duracion" name="duracion" value={form.duracion} onChange={handleChange}>
              {DURACIONES.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="edit-nivel">Nivel</label>
            <select id="edit-nivel" name="dificultad" value={form.dificultad} onChange={handleChange}>
              {NIVELES.map((n) => (
                <option key={n} value={n}>{n.charAt(0).toUpperCase() + n.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="edit-portada">Imagen de portada</label>
          {portadaPreview && (
            <img src={portadaPreview} alt="Portada actual" className="portada-preview" />
          )}
          <input id="edit-portada" type="file" accept="image/*" onChange={handlePortadaChange} />
        </div>

        <div className="form-group">
          <label>Multimedia actual</label>
          {existingMultimedia.length === 0 ? (
            <p style={{ color: "#888", fontSize: "0.9rem" }}>Sin archivos</p>
          ) : (
            <ul className="multimedia-list">
              {existingMultimedia.map((m, i) => (
                <li key={i} className="multimedia-item">
                  <span>{m.tipo} — {m.url.split("/").pop()}</span>
                  <button type="button" onClick={() => removeExistingMultimedia(i)} className="btn-remove">✕</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="form-group">
          <label>Añadir multimedia <span className="optional">(opcional — foto, vídeo, audio, PDF)</span></label>
          <input type="file" accept="image/*,video/*,audio/*,application/pdf" multiple onChange={handleMultimediaChange} />
          {multimediaFiles.length > 0 && (
            <ul className="multimedia-list">
              {multimediaFiles.map((file, i) => (
                <li key={i} className="multimedia-item">
                  <span>{file.name}</span>
                  <button type="button" onClick={() => removeNewMultimedia(i)} className="btn-remove">✕</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button type="submit" className="btn-create" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}

export default EditChallengePage;
