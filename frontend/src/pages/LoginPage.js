import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Alert from "../components/Alert";
import "../styles/FormulariosPage.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const initialLoginState = {
  email: "",
  contraseña: "",
};

function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoggedIn } = useAuth();
  const [loginForm, setLoginForm] = useState(initialLoginState);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "success" });

  useEffect(() => {
    document.title = "Iniciar sesión – DayDare";
  }, []);

  // Redirigir si ya está logueado (sin haber hecho login aquí, ej. volviendo a /login)
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetLoginForm = () => {
    setLoginForm(initialLoginState);
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

      // Pasar rememberMe a login() para que maneje la persistencia
      

      setAlert({ message: "Login correcto", type: "success" });
      resetLoginForm();
      setTimeout(() => {
        login(data.user, rememberMe);
      }, 1000);
    } catch (error) {
      setAlert({ message: error.message || "Error al iniciar sesión", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="formularios-container">
      <Alert message={alert.message} type={alert.type } onClose={() => setAlert({ ...alert, message: "" })} />
      
      <div className="form-block">
        <h2>Iniciar Sesión</h2>
        
        <div className="form-group">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            name="email"
            placeholder="Introduce tu correo electronico"
            value={loginForm.email}
            onChange={handleLoginChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="login-contraseña">Contraseña</label>
          <input
            id="login-contraseña"
            type="password"
            name="contraseña"
            placeholder="Introduce tu contraseña"
            value={loginForm.contraseña}
            onChange={handleLoginChange}
            onKeyPress={(e) => e.key === "Enter" && handleLogin()}
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
          onClick={handleLogin}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Accediendo..." : "Acceder"}
        </button>

        <p className="login-footer">
          ¿Aún no eres miembro?{" "}
          <Link to="/register">Crea una nueva cuenta aquí</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
