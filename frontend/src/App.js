import { Link, Route, Routes } from "react-router-dom";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import AccountPage from "./pages/AccountPage";
import SettingsPage from "./pages/SettingsPage";
import ChallengesListPage from "./pages/ChallengesListPage";

function App() {
  return (
    <div>
      <nav>
        <Link to="/">Inicio</Link> |
        <Link to="/about">Acerca de</Link> |
        <Link to="/contact">Contacto</Link> |
        <Link to="/account">Mi Cuenta</Link> |
        <Link to="/settings">Ajustes</Link>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/my-challenges/:tipo" element={<ChallengesListPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;