import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Alert from "../components/Alert";
import "../styles/FormulariosPage.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const initialRegisterState = {
  usuario: "",
  apellido: "",
  email: "",
  contraseña: "",
  confirmarContraseña: "",
};

function RegisterPage() {
  const navigate = useNavigate();
  const { login, isLoggedIn } = useAuth();
  const [registerForm, setRegisterForm] = useState(initialRegisterState);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "success" });

  // Redirigir si ya está logueado
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/account", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetRegisterForm = () => {
    setRegisterForm(initialRegisterState);
  };

  const handleRegister = async () => {
    if (isSubmitting) return;

    const { usuario, apellido, email, contraseña, confirmarContraseña } = registerForm;

    // Validaciones
    if (!usuario.trim() || !apellido.trim() || !email.trim() || !contraseña || !confirmarContraseña) {
      setAlert({ message: "Todos los campos son obligatorios", type: "error" });
      return;
    }

    if (contraseña !== confirmarContraseña) {
      setAlert({ message: "Las contraseñas no coinciden", type: "error" });
      return;
    }

    if (contraseña.length < 6) {
      setAlert({ message: "La contraseña debe tener al menos 6 caracteres", type: "error" });
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
          nombre: usuario.trim(),
          apellido: apellido.trim(),
          email: email.trim(),
          contraseña,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error("El email ya está registrado");
        }
        throw new Error(data.message || "No se pudo crear la cuenta");
      }

      // Pasar rememberMe a login() para que maneje la persistencia
      login(data.user, rememberMe);

      setAlert({ message: "Cuenta creada exitosamente", type: "success" });
      resetRegisterForm();
      setTimeout(() => {
        navigate("/account");
      }, 500);
    } catch (error) {
      setAlert({ message: error.message || "Error al registrarse", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="formularios-container">
      <Alert message={alert.message} type={alert.type} />
      
      <div className="form-block">
        <h2>Registro</h2>
        
        <div className="form-group">
          <label htmlFor="register-usuario">Nombre</label>
          <input
            id="register-usuario"
            type="text"
            name="usuario"
            placeholder="Introduce tu nombre"
            value={registerForm.usuario}
            onChange={handleRegisterChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="register-apellido">Apellido</label>
          <input
            id="register-apellido"
            type="text"
            name="apellido"
            placeholder="Introduce tu apellido"
            value={registerForm.apellido}
            onChange={handleRegisterChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="register-email">Email</label>
          <input
            id="register-email"
            type="email"
            name="email"
            placeholder="Introduce tu correo electronico"
            value={registerForm.email}
            onChange={handleRegisterChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="register-contraseña">Contraseña</label>
          <input
            id="register-contraseña"
            type="password"
            name="contraseña"
            placeholder="Introduce tu contraseña"
            value={registerForm.contraseña}
            onChange={handleRegisterChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="register-confirmar">Repita la contraseña</label>
          <input
            id="register-confirmar"
            type="password"
            name="confirmarContraseña"
            placeholder="Por favor, repite la contraseña"
            value={registerForm.confirmarContraseña}
            onChange={handleRegisterChange}
            onKeyPress={(e) => e.key === "Enter" && handleRegister()}
          />
        </div>

        <div className="form-group checkbox-group">
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <label htmlFor="remember-me">Acuerdate de mi</label>
        </div>

        <button
          className="btn-submit"
          onClick={handleRegister}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Registrando..." : "Acceder"}
        </button>

        <p className="login-footer">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login">inicia sesión aquí</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
