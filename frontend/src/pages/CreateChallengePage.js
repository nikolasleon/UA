import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Alert from "../components/Alert";
import "../styles/CreateChallengePage.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const CATEGORIAS = ["fuerza", "cardio", "aire libre", "gimnasio", "yoga", "equipo", "flexibilidad", "resistencia", "arte", "tecnologia", "cocina", "música"];
const DURACIONES = ["5min", "10min", "15min", "20min", "30min", "45min", "1h", "1h 30min", "2h"];
const NIVELES = ["fácil", "medio", "intenso"];

function CreateChallengePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    categoria: "fuerza",
    duracion: "15min",
    dificultad: "medio",
  });

  const [portadaFile, setPortadaFile] = useState(null);
  const [portadaPreview, setPortadaPreview] = useState(null);
  const [multimediaFiles, setMultimediaFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "success" });

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

  const removeMultimedia = (index) => {
    setMultimediaFiles((prev) => prev.filter((_, i) => i !== index));
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
    if (!portadaFile) {
      setAlert({ message: "Debes subir al menos una imagen de portada", type: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      const portadaUrl = await uploadFile(portadaFile);

      const multimedia = await Promise.all(
        multimediaFiles.map(async (file) => ({
          url: await uploadFile(file),
          tipo: getTipo(file),
        }))
      );

      const res = await fetch(`${API_URL}/api/challenges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: form.titulo.trim(),
          descripcion: form.descripcion.trim(),
          categoria: form.categoria,
          duracion: form.duracion,
          dificultad: form.dificultad,
          imagenDesafio: portadaUrl,
          multimedia,
          creadorId: user._id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al crear el reto");

      navigate(`/reto/${data.reto._id}`);
    } catch (err) {
      console.error("Error al crear reto:", err);
      setAlert({ message: err.message || "Error al crear el reto", type: "error" });
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    document.title = "Crear reto – DayDare";
  }, []);

  return (
    <div className="create-challenge-container">
      <Alert message={alert.message} type={alert.type} onClose={() => setAlert({ message: "", type: "success" })} />
      <h1 className="create-challenge-title">Crear reto</h1>
      <p className="create-challenge-subtitle">
        Lanza un reto a la comunidad y que se las arreglen. Define bien lo que pides, ponle nombre,
        una imagen y asegúrate de que sea alcanzable en el tiempo indicado — nadie quiere un reto que dure más de un día.
      </p>

      <form className="create-challenge-form" onSubmit={handleSubmit}>

        <div className="form-group">
          <label htmlFor="create-titulo">Título</label>
          <input
            id="create-titulo"
            type="text"
            name="titulo"
            value={form.titulo}
            onChange={handleChange}
            placeholder="Dale un nombre a tu reto"
          />
        </div>

        <div className="form-group">
          <label htmlFor="create-descripcion">Descripción</label>
          <textarea
            id="create-descripcion"
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            placeholder="Explica en qué consiste el reto"
            rows={4}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="create-categoria">Categoría</label>
            <select id="create-categoria" name="categoria" value={form.categoria} onChange={handleChange}>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="create-duracion">Duración</label>
            <select id="create-duracion" name="duracion" value={form.duracion} onChange={handleChange}>
              {DURACIONES.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="create-nivel">Nivel</label>
            <select id="create-nivel" name="dificultad" value={form.dificultad} onChange={handleChange}>
              {NIVELES.map((n) => (
                <option key={n} value={n}>{n.charAt(0).toUpperCase() + n.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="create-portada">Imagen de portada <span className="required">*</span></label>
          <input id="create-portada" type="file" accept="image/*" onChange={handlePortadaChange} />
          {portadaPreview && (
            <img src={portadaPreview} alt="Portada del reto" className="portada-preview" />
          )}
        </div>

        <div className="form-group">
          <label htmlFor="create-multimedia">Multimedia adicional <span className="optional">(opcional — foto, vídeo, audio, PDF)</span></label>
          <input
            id="create-multimedia"
            type="file"
            accept="image/*,video/*,audio/*,application/pdf"
            multiple
            onChange={handleMultimediaChange}
          />
          {multimediaFiles.length > 0 && (
            <ul className="multimedia-list">
              {multimediaFiles.map((file, i) => (
                <li key={i} className="multimedia-item">
                  <span>{file.name}</span>
                  <button type="button" onClick={() => removeMultimedia(i)} className="btn-remove">✕</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button type="submit" className="btn-create" disabled={isSubmitting}>
          {isSubmitting ? "Creando..." : "Crear reto"}
        </button>
      </form>
    </div>
  );
}

export default CreateChallengePage;
