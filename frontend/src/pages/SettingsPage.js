import React, { useState, useEffect } from "react";
import { FaArrowUp } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";
import Alert from "../components/Alert";
import "../styles/SettingsPage.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function SettingsPage() {
  const { user: authUser, updateUser, logout } = useAuth();
  const userId = authUser?._id;
  
  const [profile, setProfile] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    fechaNacimiento: "",
    nacionalidad: "",
    bio: "",
    fotoPerfil: "",
    cuentaPrivada: false,
  });

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [pendingPhotoFile, setPendingPhotoFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "success" });
  const [password, setPassword] = useState({
    nueva: "",
    confirmar: "",
  });
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Cargar datos al montar el componente
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/users/profile/${userId}?currentUserId=${userId}`
        );
        if (response.ok) {
          const data = await response.json();
          console.log("Frontend - Datos cargados del backend:", {
            privacidad: data.privacidad,
            privacidad_perfil: data.privacidad?.perfil,
          });
          
          const isPrivate = data.privacidad?.perfil === "privado";
          console.log("Frontend - cuentaPrivada calculada:", isPrivate);
          
          setProfile({
            nombre: data.nombre || "",
            apellido: data.apellido || "",
            email: data.email || "",
            telefono: data.telefono || "",
            fechaNacimiento: data.fechaNacimiento ? data.fechaNacimiento.split("T")[0] : "",
            nacionalidad: data.nacionalidad || "",
            bio: data.bio || "",
            fotoPerfil: data.fotoPerfil || "",
            cuentaPrivada: isPrivate,
          });
          setLoadError(false);
        } else {
          setLoadError(true);
        }
      } catch (err) {
        console.error("Error al cargar perfil:", err);
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [userId]);

  // Scroll to top button handler
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollToTop(true);
      } else {
        setShowScrollToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPassword((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPendingPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      let fotoPerfilUrl = profile.fotoPerfil;

      if (pendingPhotoFile) {
        const formData = new FormData();
        formData.append("archivo", pendingPhotoFile);
        const uploadRes = await fetch(`${API_URL}/api/users/upload`, {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok) throw new Error("Error al subir la imagen");
        const uploadData = await uploadRes.json();
        fotoPerfilUrl = uploadData.url;
        setPendingPhotoFile(null);
      }

      const profileToSave = {
        nombre: profile.nombre,
        apellido: profile.apellido,
        email: profile.email,
        telefono: profile.telefono,
        fechaNacimiento: profile.fechaNacimiento,
        nacionalidad: profile.nacionalidad,
        bio: profile.bio,
        fotoPerfil: fotoPerfilUrl,
        cuentaPrivada: profile.cuentaPrivada,
      };

      console.log("Frontend - Guardando perfil:", {
        cuentaPrivada: profileToSave.cuentaPrivada,
        sera_guardado_como: profileToSave.cuentaPrivada ? "PRIVADO" : "PÚBLICO",
      });

      const response = await fetch(
        `${API_URL}/api/users/profile/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(profileToSave),
        }
      );

      if (!response.ok) throw new Error("Error al guardar");

      const data = await response.json();
      console.log("Frontend - Respuesta del servidor:", {
        privacidad_perfil: data.user?.privacidad?.perfil,
        estado: data.message,
      });

      // Refrescar el perfil desde BD para confirmar que se guardó correctamente
      console.log("Frontend - Refrescando datos desde BD...");
      const refreshResponse = await fetch(
        `${API_URL}/api/users/profile/${userId}?currentUserId=${userId}`
      );
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        console.log("Frontend - Datos refrescados:", {
          privacidad_perfil: refreshData.privacidad?.perfil,
        });
        
        // Actualizar el estado local con los datos frescos
        setProfile((prev) => ({
          ...prev,
          fotoPerfil: fotoPerfilUrl,
          cuentaPrivada: refreshData.privacidad?.perfil === "privado",
        }));
      }

      // Actualizar el contexto de autenticación
      updateUser({
        nombre: profile.nombre,
        apellido: profile.apellido,
        email: profile.email,
        fotoPerfil: fotoPerfilUrl,
      });

      setAlert({
        message: "✓ Perfil guardado correctamente",
        type: "success",
      });
      setIsSaving(false);
    } catch (error) {
      console.error("Frontend - Error:", error);
      setAlert({ message: "✕ Error al guardar los cambios", type: "error" });
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (password.nueva !== password.confirmar) {
      setAlert({ message: "✕ Las contraseñas no coinciden", type: "error" });
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/users/settings/${userId}/password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contraseñaActual: "oldPassword", // En producción, pedir la actual
            contraseñaNueva: password.nueva,
          }),
        }
      );

      if (!response.ok) throw new Error("Error al cambiar contraseña");

      setAlert({ message: "✓ Contraseña cambiada correctamente", type: "success" });
      setPassword({ nueva: "", confirmar: "" });
      setShowPasswordModal(false);
    } catch (error) {
      console.error("Error:", error);
      setAlert({ message: "✕ Error al cambiar la contraseña", type: "error" });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/users/${userId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Error al eliminar");

      setAlert({ message: "✓ Cuenta eliminada. Redirigiendo...", type: "success" });
      logout();
      
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (error) {
      console.error("Error:", error);
      setAlert({ message: "✕ Error al eliminar la cuenta", type: "error" });
    }
  };

  return (
    <div className="settings-container">
      <h1>Ajustes de Perfil</h1>

      <Alert 
        message={alert.message} 
        type={alert.type} 
        onClose={() => setAlert({ message: "", type: "success" })}
      />

      {loading && <p style={{ textAlign: "center", color: "#888" }}>Cargando perfil...</p>}

      {loadError && !loading && (
        <div style={{
          textAlign: "center",
          padding: "2rem",
          backgroundColor: "#fff1f2",
          borderRadius: "10px",
          color: "#9f2330",
          marginBottom: "2rem"
        }}>
          <p><strong>⚠️ No hay conexión con el servidor</strong></p>
          <p>Por favor, verifica tu conexión a internet e intenta de nuevo</p>
        </div>
      )}

      {!loading && !loadError && (
        <>
          <div className="settings-card">
            <h2>Información Personal</h2>

            <div className="form-group">
              <label htmlFor="nombre">Nombre:</label>
              <input
                id="nombre"
                type="text"
                name="nombre"
                value={profile.nombre}
                onChange={handleInputChange}
                placeholder="Tu nombre"
              />
            </div>

            <div className="form-group">
              <label htmlFor="apellido">Apellido:</label>
              <input
                id="apellido"
                type="text"
                name="apellido"
                value={profile.apellido}
                onChange={handleInputChange}
                placeholder="Tu apellido"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                id="email"
                type="email"
                name="email"
                value={profile.email}
                onChange={handleInputChange}
                placeholder="Tu email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefono">Teléfono:</label>
              <input
                id="telefono"
                type="tel"
                name="telefono"
                value={profile.telefono}
                onChange={handleInputChange}
                placeholder="Tu teléfono"
              />
            </div>

            <div className="form-group">
              <label htmlFor="fechaNacimiento">Fecha de Nacimiento:</label>
              <input
                id="fechaNacimiento"
                type="date"
                name="fechaNacimiento"
                value={profile.fechaNacimiento}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="nacionalidad">Nacionalidad:</label>
              <input
                id="nacionalidad"
                type="text"
                name="nacionalidad"
                value={profile.nacionalidad}
                onChange={handleInputChange}
                placeholder="Tu nacionalidad"
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio">Descripción (Bio):</label>
              <textarea
                id="bio"
                name="bio"
                value={profile.bio}
                onChange={handleInputChange}
                placeholder="Cuéntanos sobre ti (máx. 500 caracteres)"
                maxLength="500"
                rows="4"
              />
              <p style={{ fontSize: "0.75rem", color: "#888", marginTop: "0.3rem" }}>
                {profile.bio.length}/500
              </p>
            </div>

            <div className="form-group">
              <label>Privacidad de Cuenta:</label>
              <div style={{ display: "flex", gap: "2rem", marginTop: "0.5rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="cuentaPrivada"
                    value="publica"
                    checked={!profile.cuentaPrivada}
                    onChange={() => setProfile(prev => ({ ...prev, cuentaPrivada: false }))}
                  />
                  <span>Pública</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="cuentaPrivada"
                    value="privada"
                    checked={profile.cuentaPrivada}
                    onChange={() => setProfile(prev => ({ ...prev, cuentaPrivada: true }))}
                  />
                  <span>Privada</span>
                </label>
              </div>
              <p style={{ fontSize: "0.85rem", color: "#888", marginTop: "0.5rem" }}>
                {profile.cuentaPrivada
                  ? "Ningún usuario podrá ver tu perfil completo"
                  : "Tu perfil es visible para todos"}
              </p>
            </div>

            <div className="form-group">
              <input
                id="fotoPerfil"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
              />
              <p style={{ fontSize: "0.85rem", color: "#888", marginTop: "0.5rem" }}>
                Selecciona una imagen desde tu galería
              </p>
            </div>

            {/* Previsualización de foto */}
            {(photoPreview || profile.fotoPerfil) && (
              <div className="photo-preview">
                <img 
                  src={photoPreview || profile.fotoPerfil} 
                  alt="Previsualización de foto de perfil"
                  style={{
                    width: "150px",
                    height: "150px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "3px solid #007bff",
                    marginBottom: "1rem"
                  }}
                />
              </div>
            )}

            <div className="button-group">
              <button 
                onClick={handleSaveProfile} 
                className="btn btn-primary"
                disabled={isSaving}
                style={{
                  opacity: isSaving ? 0.7 : 1,
                  cursor: isSaving ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                {isSaving ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>

          {/* Cambiar Contraseña */}
          <div className="settings-card danger-zone">
            <h2>Seguridad</h2>

            <button
              onClick={() => setShowPasswordModal(true)}
              className="btn btn-warning"
            >
              Cambiar Contraseña
            </button>
          </div>

          {/* Borrar Cuenta */}
          <div className="settings-card danger-zone">
            <h2>Zona de Peligro</h2>

            <p className="danger-text">Una vez eliminada tu cuenta, no hay vuelta atrás.</p>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="btn btn-danger"
            >
              Borrar Cuenta
            </button>
          </div>
        </>
      )}

      {/* Modal Cambiar Contraseña */}
      {showPasswordModal && (
        <Modal
          title="Cambiar Contraseña"
          onClose={() => setShowPasswordModal(false)}
          onConfirm={handleChangePassword}
          confirmText="Cambiar Contraseña"
        >
          <div className="form-group">
            <label htmlFor="newPassword">Nueva Contraseña:</label>
            <input
              id="newPassword"
              type="password"
              name="nueva"
              value={password.nueva}
              onChange={handlePasswordChange}
              placeholder="Ingresa tu nueva contraseña"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña:</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmar"
              value={password.confirmar}
              onChange={handlePasswordChange}
              placeholder="Confirma tu contraseña"
            />
          </div>
        </Modal>
      )}

      {/* Modal Borrar Cuenta */}
      {showDeleteModal && (
        <Modal
          title="Borrar Cuenta"
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAccount}
          confirmText="Borrar Cuenta"
          isDanger={true}
        >
          <p>¿Estás seguro de que quieres eliminar tu cuenta?</p>
          <p style={{ color: "#666", fontSize: "0.9rem" }}>
            Esta acción es irreversible. Se eliminarán todos tus datos y retos.
          </p>
        </Modal>
      )}

      {/* Botón flotante para volver arriba */}
      {showScrollToTop && (
        <button
          onClick={scrollToTop}
          className="scroll-to-top-btn"
          aria-label="Volver al inicio"
          title="Volver al inicio"
        >
          <FaArrowUp size={20} />
        </button>
      )}
    </div>
  );
}

export default SettingsPage;
