import "./App.css";
import { Route, Routes, Link } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Header from "./components/Header";
import ScrollToTopButton from "./components/ScrollToTopButton";
import ProtectedRoute from "./components/ProtectedRoute";
import AboutPage from "./pages/AboutPage";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import AccountPage from "./pages/AccountPage";
import SettingsPage from "./pages/SettingsPage";
import ChallengesListPage from "./pages/ChallengesListPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Buscar from "./pages/Buscar";
import PublicProfilePage from "./pages/PublicProfilePage";
import ChallengePage from "./pages/ChallengePage";
import CreateChallengePage from "./pages/CreateChallengePage";
import EditChallengePage from "./pages/EditChallengePage";
import SubmitResponsePage from "./pages/SubmitResponsePage";
import GalleryModal from "./components/GalleryModal";
import "./styles/CreateChallengePage.css";

function FAB() {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return null;
  return (
    <Link to="/crear-reto" className="fab" title="Crear reto">+</Link>
  );
}

function App() {
  useEffect(() => {
    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
    fetch(`${apiUrl}/api/health`)
      .catch((err) => console.log(err));
  }, []);

  return (
    <AuthProvider>
      <div>
        <Header />
        <FAB />
        <ScrollToTopButton />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/buscar" element={<Buscar />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/profile/:userId" element={<PublicProfilePage />} />
          <Route path="/reto/:id" element={<ChallengePage />} />
          <Route
            path="/reto/:id/responder"
            element={
              <ProtectedRoute>
                <SubmitResponsePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-challenges/:tipo"
            element={
              <ProtectedRoute>
                <ChallengesListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editar-reto/:id"
            element={
              <ProtectedRoute>
                <EditChallengePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/crear-reto"
            element={
              <ProtectedRoute>
                <CreateChallengePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
