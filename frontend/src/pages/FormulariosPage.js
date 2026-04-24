import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";
import Alert from "../components/Alert";
import "../styles/FormulariosPage.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const initialFormState = {
  nombre: "",
  apellido: "",
  email: "",
  contraseña: "",
  confirmarContraseña: "",
  telefono: "",
  fechaNacimiento: "",
  nacionalidad: "",
  bio: "",
  fotoPerfil: "",
  tema: "claro",
  perfilPrivado: false,
  notificacionesEmail: true,
  actualizacionesContenido: true,
};

const initialLoginState = {
  email: "",
  contraseña: "",
};

const initialChallengeState = {
  titulo: "",
  descripcion: "",
  imagenDesafio: "",
  dificultad: "medio",
  categoria: "general",
  esRetoDia: false,
};

function FormulariosPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registerForm, setRegisterForm] = useState(initialFormState);
  const [loginForm, setLoginForm] = useState(initialLoginState);
  const [challengeForm, setChallengeForm] = useState(initialChallengeState);
  const [alert, setAlert] = useState({ message: "", type: "success" });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRegisterForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setRegisterForm(initialFormState);
  };

  const resetLoginForm = () => {
    setLoginForm(initialLoginState);
  };

  const resetChallengeForm = () => {
    setChallengeForm(initialChallengeState);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setShowRegisterModal(false);
    resetForm();
  };

  const closeLoginModal = () => {
    if (isSubmitting) return;
    setShowLoginModal(false);
    resetLoginForm();
  };

  const closeChallengeModal = () => {
    if (isSubmitting) return;
    setShowChallengeModal(false);
    resetChallengeForm();
  };

  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChallengeInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setChallengeForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRegister = async () => {
    if (isSubmitting) return;

    const {
      nombre,
      apellido,
      email,
      contraseña,
      confirmarContraseña,
      telefono,
      fechaNacimiento,
      nacionalidad,
      bio,
      fotoPerfil,
      tema,
      perfilPrivado,
      notificacionesEmail,
      actualizacionesContenido,
    } = registerForm;

    if (!nombre.trim() || !apellido.trim() || !email.trim() || !contraseña.trim() || !confirmarContraseña.trim()) {
      setAlert({ message: "Completa todos los campos para registrarte", type: "error" });
      return;
    }

    if (contraseña.length < 6) {
      setAlert({ message: "La contraseña debe tener al menos 6 caracteres", type: "error" });
      return;
    }

    if (contraseña !== confirmarContraseña) {
      setAlert({ message: "Las contraseñas no coinciden", type: "error" });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          email: email.trim(),
          contraseña,
          telefono: telefono.trim(),
          fechaNacimiento,
          nacionalidad: nacionalidad.trim(),
          bio: bio.trim(),
          fotoPerfil: fotoPerfil.trim(),
          tema,
          privacidad: {
            perfil: perfilPrivado ? "privado" : "publico",
          },
          preferenciasNotificaciones: {
            email: notificacionesEmail,
            actualizacionesContenido,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No se pudo registrar el usuario");
      }

      setAlert({ message: "Usuario registrado correctamente", type: "success" });
      setShowRegisterModal(false);
      resetForm();
    } catch (error) {
      setAlert({ message: error.message || "Error al registrar usuario", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async () => {
    if (isSubmitting) return;

    const { email, contraseña } = loginForm;

    if (!email.trim() || !contraseña.trim()) {
      setAlert({ message: "Introduce email y contraseña", type: "error" });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          contraseña,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Login incorrecto");
        }
        throw new Error(data.message || "No se pudo iniciar sesión");
      }

      login(data.user);

      setAlert({ message: "Login correcto", type: "success" });
      setShowLoginModal(false);
      resetLoginForm();
      setTimeout(() => {
        navigate("/account");
      }, 500);
    } catch (error) {
      setAlert({ message: error.message || "Error al iniciar sesión", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateChallenge = async () => {
    if (isSubmitting) return;

    const userId = localStorage.getItem("userId");
    const userName = localStorage.getItem("userName") || "";
    const userLastName = localStorage.getItem("userLastName") || "";

    if (!userId) {
      setAlert({ message: "Debes iniciar sesión para crear un reto", type: "error" });
      return;
    }

    const { titulo, descripcion, imagenDesafio, dificultad, categoria, esRetoDia } = challengeForm;

    if (!titulo.trim() || !descripcion.trim()) {
      setAlert({ message: "Título y descripción son obligatorios", type: "error" });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/challenges`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          imagenDesafio: imagenDesafio.trim(),
          creadorId: userId,
          creador: `${userName} ${userLastName}`.trim(),
          dificultad,
          categoria: categoria.trim() || "general",
          esRetoDia,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No se pudo crear el reto");
      }

      setAlert({ message: "Reto creado correctamente", type: "success" });
      setShowChallengeModal(false);
      resetChallengeForm();
    } catch (error) {
      setAlert({ message: error.message || "Error al crear el reto", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="formularios-container">
      <h1>Formularios</h1>

      <Alert
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ message: "", type: "success" })}
      />

      <div className="formularios-card">
        <h2>Registro de Usuario</h2>
        <p>
          Abre el formulario emergente para crear una nueva cuenta.
        </p>

        <div className="formularios-actions">
          <button
            className="btn btn-primary"
            onClick={() => setShowRegisterModal(true)}
            aria-label="Abrir formulario de registro"
          >
            Abrir Formulario de Registro
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => setShowLoginModal(true)}
            aria-label="Abrir formulario de login"
          >
            Abrir Formulario de Login
          </button>

          <button
            className="btn btn-success"
            onClick={() => setShowChallengeModal(true)}
            aria-label="Abrir formulario de creación de reto"
          >
            Crear Reto
          </button>
        </div>
      </div>

      {showRegisterModal && (
        <Modal
          title={isSubmitting ? "Registrando usuario..." : "Registro de Usuario"}
          onClose={closeModal}
          onConfirm={handleRegister}
          confirmText={isSubmitting ? "Registrando..." : "Registrar"}
        >
          <div className="register-form">
            <div className="form-group">
              <label htmlFor="nombre">Nombre:</label>
              <input
                id="nombre"
                type="text"
                name="nombre"
                value={registerForm.nombre}
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
                value={registerForm.apellido}
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
                value={registerForm.email}
                onChange={handleInputChange}
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="contraseña">Contraseña:</label>
              <input
                id="contraseña"
                type="password"
                name="contraseña"
                value={registerForm.contraseña}
                onChange={handleInputChange}
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmarContraseña">Confirmar contraseña:</label>
              <input
                id="confirmarContraseña"
                type="password"
                name="confirmarContraseña"
                value={registerForm.confirmarContraseña}
                onChange={handleInputChange}
                placeholder="Repite tu contraseña"
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefono">Teléfono:</label>
              <input
                id="telefono"
                type="tel"
                name="telefono"
                value={registerForm.telefono}
                onChange={handleInputChange}
                placeholder="Tu teléfono"
              />
            </div>

            <div className="form-group">
              <label htmlFor="fechaNacimiento">Fecha de nacimiento:</label>
              <input
                id="fechaNacimiento"
                type="date"
                name="fechaNacimiento"
                value={registerForm.fechaNacimiento}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="nacionalidad">Nacionalidad:</label>
              <input
                id="nacionalidad"
                type="text"
                name="nacionalidad"
                value={registerForm.nacionalidad}
                onChange={handleInputChange}
                placeholder="Tu nacionalidad"
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio:</label>
              <textarea
                id="bio"
                name="bio"
                value={registerForm.bio}
                onChange={handleInputChange}
                placeholder="Cuéntanos sobre ti"
                maxLength="500"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="fotoPerfil">URL de foto de perfil:</label>
              <input
                id="fotoPerfil"
                type="url"
                name="fotoPerfil"
                value={registerForm.fotoPerfil}
                onChange={handleInputChange}
                placeholder="https://..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="tema">Tema:</label>
              <select
                id="tema"
                name="tema"
                value={registerForm.tema}
                onChange={handleInputChange}
              >
                <option value="claro">Claro</option>
                <option value="oscuro">Oscuro</option>
              </select>
            </div>

            <div className="checkbox-group">
              <label htmlFor="perfilPrivado" className="checkbox-label">
                <input
                  id="perfilPrivado"
                  type="checkbox"
                  name="perfilPrivado"
                  checked={registerForm.perfilPrivado}
                  onChange={handleInputChange}
                />
                Perfil privado
              </label>

              <label htmlFor="notificacionesEmail" className="checkbox-label">
                <input
                  id="notificacionesEmail"
                  type="checkbox"
                  name="notificacionesEmail"
                  checked={registerForm.notificacionesEmail}
                  onChange={handleInputChange}
                />
                Recibir notificaciones por email
              </label>

              <label htmlFor="actualizacionesContenido" className="checkbox-label">
                <input
                  id="actualizacionesContenido"
                  type="checkbox"
                  name="actualizacionesContenido"
                  checked={registerForm.actualizacionesContenido}
                  onChange={handleInputChange}
                />
                Recibir actualizaciones de contenido
              </label>
            </div>
          </div>
        </Modal>
      )}

      {showLoginModal && (
        <Modal
          title={isSubmitting ? "Validando login..." : "Login de Usuario"}
          onClose={closeLoginModal}
          onConfirm={handleLogin}
          confirmText={isSubmitting ? "Validando..." : "Iniciar Sesión"}
        >
          <div className="register-form">
            <div className="form-group">
              <label htmlFor="loginEmail">Email:</label>
              <input
                id="loginEmail"
                type="email"
                name="email"
                value={loginForm.email}
                onChange={handleLoginInputChange}
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="loginContraseña">Contraseña:</label>
              <input
                id="loginContraseña"
                type="password"
                name="contraseña"
                value={loginForm.contraseña}
                onChange={handleLoginInputChange}
                placeholder="Tu contraseña"
              />
            </div>
          </div>
        </Modal>
      )}

      {showChallengeModal && (
        <Modal
          title={isSubmitting ? "Creando reto..." : "Crear Nuevo Reto"}
          onClose={closeChallengeModal}
          onConfirm={handleCreateChallenge}
          confirmText={isSubmitting ? "Creando..." : "Crear Reto"}
        >
          <div className="register-form">
            <div className="form-group">
              <label htmlFor="titulo">Título:</label>
              <input
                id="titulo"
                type="text"
                name="titulo"
                value={challengeForm.titulo}
                onChange={handleChallengeInputChange}
                placeholder="Nombre del reto"
              />
            </div>

            <div className="form-group">
              <label htmlFor="descripcion">Descripción:</label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={challengeForm.descripcion}
                onChange={handleChallengeInputChange}
                placeholder="Describe el reto"
                maxLength="500"
                rows="4"
              />
            </div>

            <div className="form-group">
              <label htmlFor="imagenDesafio">Imagen del reto (URL):</label>
              <input
                id="imagenDesafio"
                type="url"
                name="imagenDesafio"
                value={challengeForm.imagenDesafio}
                onChange={handleChallengeInputChange}
                placeholder="https://..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="dificultad">Dificultad:</label>
              <select
                id="dificultad"
                name="dificultad"
                value={challengeForm.dificultad}
                onChange={handleChallengeInputChange}
              >
                <option value="fácil">Fácil</option>
                <option value="medio">Medio</option>
                <option value="difícil">Difícil</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="categoria">Categoría:</label>
              <input
                id="categoria"
                type="text"
                name="categoria"
                value={challengeForm.categoria}
                onChange={handleChallengeInputChange}
                placeholder="general, deporte, salud..."
              />
            </div>

            <div className="checkbox-group">
              <label htmlFor="esRetoDia" className="checkbox-label">
                <input
                  id="esRetoDia"
                  type="checkbox"
                  name="esRetoDia"
                  checked={challengeForm.esRetoDia}
                  onChange={handleChallengeInputChange}
                />
                Marcar como reto del día
              </label>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default FormulariosPage;
