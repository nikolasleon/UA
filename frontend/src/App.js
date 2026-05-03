import "./App.css";
import { Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";

import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import AccountPage from "./pages/AccountPage";
import SettingsPage from "./pages/SettingsPage";
import ChallengesListPage from "./pages/ChallengesListPage";
import FormulariosPage from "./pages/FormulariosPage";
import LoginPage from "./pages/LoginPage";
import Buscar from "./pages/Buscar";
import ChallengePage from "./pages/ChallengePage";

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
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/buscar" element={<Buscar />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/reto/:id" element={<ChallengePage />} />
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
          <Route path="/formularios" element={<FormulariosPage />} />
          <Route
            path="/my-challenges/:tipo"
            element={
              <ProtectedRoute>
                <ChallengesListPage />
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
