import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaBars, FaTimes, FaUser, FaSignOutAlt, FaMoon, FaSun, FaHome, FaInfoCircle, FaEnvelope } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import Alert from "../components/Alert";
import "../styles/Header.css";

function Header() {
  const { user, isLoggedIn, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [optionsMenuOpen, setOptionsMenuOpen] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const profileMenuRef = useRef(null);
  const optionsMenuRef = useRef(null);
  const navigate = useNavigate();
  const userName = user?.nombre || "";
  const userPhoto = user?.fotoPerfil || "";
  const [alert, setAlert] = useState({ message: "", type: "success" });

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleSearch = () => setSearchOpen(!searchOpen);
  const toggleProfileMenu = () => setProfileMenuOpen(!profileMenuOpen);
  const toggleOptionsMenu = () => setOptionsMenuOpen(!optionsMenuOpen);
  // const toggleDarkMode = () => setDarkModeEnabled(!darkModeEnabled);
  const toggleDarkMode = () => {
  const newMode = !darkModeEnabled;
  setDarkModeEnabled(newMode);

    if (newMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
  if (e.key === "Enter" && searchQuery.trim()) {
    navigate(`/buscar?query=${encodeURIComponent(searchQuery)}`);

    setSearchQuery("");
    setSearchOpen(false);
  }
};

  const handleLogout = () => {
    setMenuOpen(false);
    setProfileMenuOpen(false);
    setOptionsMenuOpen(false);
    logout();
    setAlert({ message: "Has cerrado sesión", type: "success" });
    setTimeout(() => {
      navigate("/", { replace: true });
      window.location.reload();
    }, 1000);

  };

  useEffect(() => {
    if (!isLoggedIn) {
      setMenuOpen(false);
      setProfileMenuOpen(false);
      setOptionsMenuOpen(false);
    }
  }, [isLoggedIn]);

  // Cerrar menú de perfil si se hace clic afuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target)) {
        setOptionsMenuOpen(false);
      }
    }

    if (profileMenuOpen || optionsMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [profileMenuOpen, optionsMenuOpen]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      document.body.classList.add("dark-mode");
      setDarkModeEnabled(true);
    } else {
      document.body.classList.remove("dark-mode");
      setDarkModeEnabled(false);
    }
  }, []);

  const renderOptionsDropdown = () => (
    <div className="options-menu" ref={optionsMenuRef}>
      <button
        className="options-btn"
        onClick={toggleOptionsMenu}
        aria-label="Más opciones"
      >
        <FaBars />
      </button>

      {optionsMenuOpen && (
        <div className="options-dropdown">
          <Link
            to="/"
            className="options-link"
            onClick={() => setOptionsMenuOpen(false)}
          >
            <FaHome className="dropdown-icon" />
            Inicio
          </Link>
          <button
            className="options-link"
            onClick={() => {
              navigate("/buscar");
              setOptionsMenuOpen(false);
            }}
          >
            <FaSearch className="dropdown-icon" />
            Buscar
          </button>
          <div className="options-divider"></div>
          <Link
            to="/about"
            className="options-link"
            onClick={() => setOptionsMenuOpen(false)}
          >
            <FaInfoCircle className="dropdown-icon" />
            Acerca de
          </Link>
          <Link
            to="/contact"
            className="options-link"
            onClick={() => setOptionsMenuOpen(false)}
          >
            <FaEnvelope className="dropdown-icon" />
            Contacto
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <>
    <Alert 
      message={alert.message} 
      type={alert.type} 
      onClose={() => setAlert({ ...alert, message: "" })} 
    />
    <header className={`header ${searchOpen ? "search-active" : ""}`}>
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="logo">
          DayDare
        </Link>

        {/* Dark Mode Toggle */}
        <button 
          className="dark-mode-toggle" 
          onClick={toggleDarkMode}
          aria-label={darkModeEnabled ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          title={darkModeEnabled ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          {darkModeEnabled ? <FaSun size={20} /> : <FaMoon size={20} />}
        </button>

        {/* Buscador Desktop */}
        <div className="search-desktop">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Busca un reto..."
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyPress={handleSearchSubmit}
            className="search-input"
          />
        </div>

        {/* Header Right - Desktop */}
        <div className="header-right-desktop">
          {isLoggedIn ? (
            <div className="user-desktop-section">
              <div className="greetings">
                ¡Hola, <strong>{userName}</strong>!
              </div>

              {/* User Profile Dropdown */}
              <div className="user-profile" ref={profileMenuRef}>
                <button
                  className="profile-btn"
                  onClick={toggleProfileMenu}
                  aria-label="Menú de perfil"
                >
                  {userPhoto && userPhoto !== "default" ? (
                    <img src={userPhoto} alt={userName} className="profile-photo" />
                  ) : (
                    <FaUser className="profile-icon" />
                  )}
                </button>

                {/* Dropdown Menu */}
                {profileMenuOpen && (
                  <div className="profile-dropdown">
                    <Link
                      to="/account"
                      className="dropdown-link"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <FaUser className="dropdown-icon" />
                      Mi Cuenta
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="dropdown-logout"
                    >
                      <FaSignOutAlt className="logout-icon" />
                      Salir
                    </button>
                  </div>
                )}
              </div>

              {/* Options Menu */}
              {renderOptionsDropdown()}
            </div>
          ) : (
            <div className="user-desktop-section">
              <Link to="/login" className="login-btn">
                Iniciar sesión
              </Link>
              {renderOptionsDropdown()}
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="menu-toggle" onClick={toggleMenu} aria-label="Abrir menú">
          {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>

        {/* Mobile Search Button */}
        <button className="search-toggle" onClick={toggleSearch} aria-label="Buscar">
          <FaSearch size={20} />
        </button>
      </div>

      {/* Mobile Search Bar */}
      {searchOpen && (
        <div className="search-mobile">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Busca un reto..."
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyPress={handleSearchSubmit}
            className="search-input-mobile"
            autoFocus
          />
          <FaTimes
            className="close-search"
            onClick={() => setSearchOpen(false)}
            role="button"
            aria-label="Cerrar búsqueda"
          />
        </div>
      )}

      {/* Mobile Menu */}
      {menuOpen && (
        <nav className="mobile-menu">
          {/* User Section (Mobile) */}
          {isLoggedIn && (
            <>
              <div className="mobile-user-section">
                {userPhoto && userPhoto !== "default" ? (
                  <img src={userPhoto} alt={userName} className="mobile-profile-photo" />
                ) : (
                  <FaUser className="mobile-profile-icon" />
                )}
                <span className="mobile-greetings">¡Hola, {userName}!</span>
              </div>
              <Link to="/account" className="mobile-user-link" onClick={() => setMenuOpen(false)}>
                <FaUser className="mobile-menu-icon" />
                Mi Cuenta
              </Link>
              <button onClick={handleLogout} className="mobile-user-logout">
                <FaSignOutAlt className="mobile-logout-icon" />
                Salir
              </button>
              <div className="mobile-menu-divider"></div>
            </>
          )}
          {!isLoggedIn && (
            <div className="auth-buttons-mobile">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="mobile-login">
                Iniciar sesión
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="mobile-register">
                Registrarse
              </Link>
            </div>
          )}

          {/* Navigation Links */}
          <Link to="/" onClick={() => setMenuOpen(false)} className="mobile-nav-link">
            <FaHome className="mobile-menu-icon" />
            Inicio
          </Link>
          <button
            className="mobile-menu-search" onClick={() => { navigate("/buscar");
              setMenuOpen(false);
            }}
          >
            <FaSearch className="mobile-menu-icon" />
            Buscar
          </button>
          <Link to="/about" onClick={() => setMenuOpen(false)} className="mobile-nav-link">
            <FaInfoCircle className="mobile-menu-icon" />
            Acerca de
          </Link>
          <Link to="/contact" onClick={() => setMenuOpen(false)} className="mobile-nav-link">
            <FaEnvelope className="mobile-menu-icon" />
            Contacto
          </Link>
        </nav>
      )}
    </header>
    </>
  );
}

export default Header;
