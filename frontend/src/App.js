import "./App.css";
import { Route, Routes, Link } from "react-router-dom";
import { useEffect, useState } from "react";

import Header from "./components/Header";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import AccountPage from "./pages/AccountPage";
import SettingsPage from "./pages/SettingsPage";
import ChallengesListPage from "./pages/ChallengesListPage";
import FormulariosPage from "./pages/FormulariosPage";
import Buscar from "./pages/Buscar";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
    fetch(`${apiUrl}/api/health`)
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div>
      <nav>
        <Link to="/">Inicio</Link> |
        <Link to="/about">Acerca de</Link> |
        <Link to="/contact">Contacto</Link> |
        <Link to="/account">Mi Cuenta</Link> |
        <Link to="/settings">Ajustes</Link> |
        <Link to="/formularios">Formularios</Link>
      </nav>
      <Header />
    </div>
  );
}

export default App;
