import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar usuario SOLO al montar: primero localStorage (recordado), luego sessionStorage (temporal)
  useEffect(() => {
    let storedUser = null;

    // Primero intenta cargar desde localStorage (sesión recordada)
    const localStoredUser = localStorage.getItem("user");
    if (localStoredUser) {
      try {
        storedUser = JSON.parse(localStoredUser);
      } catch (error) {
        console.error("Error al parsear usuario de localStorage:", error);
        localStorage.removeItem("user");
      }
    }

    // Si no hay en localStorage, intenta sessionStorage (sesión temporal)
    if (!storedUser) {
      const sessionStoredUser = sessionStorage.getItem("user");
      if (sessionStoredUser) {
        try {
          storedUser = JSON.parse(sessionStoredUser);
        } catch (error) {
          console.error("Error al parsear usuario de sesión:", error);
          sessionStorage.removeItem("user");
        }
      }
    }

    if (storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = (userData, rememberMe = false) => {
    const userToStore = {
      _id: userData._id,
      nombre: userData.nombre || "",
      apellido: userData.apellido || "",
      email: userData.email || "",
      fotoPerfil: userData.fotoPerfil || "",
    };
    setUser(userToStore);

    // Si rememberMe es true, guardar en localStorage (persiste al cerrar navegador)
    // Si no, guardar en sessionStorage (se limpia al cerrar navegador)
    if (rememberMe) {
      localStorage.setItem("user", JSON.stringify(userToStore));
      sessionStorage.removeItem("user"); // Limpiar sessionStorage si existe
    } else {
      sessionStorage.setItem("user", JSON.stringify(userToStore));
      localStorage.removeItem("user"); // Limpiar localStorage si existe
    }
  };

  const logout = () => {
    console.log("🔓 Ejecutando logout en AuthContext");
    
    // Limpiar todos los almacenamientos PRIMERO
    try {
      sessionStorage.removeItem("user");
      localStorage.removeItem("user");
      localStorage.removeItem("rememberMe");
      localStorage.removeItem("rememberedEmail");
      console.log("✅ Almacenamientos limpiados correctamente");
    } catch (error) {
      console.error("❌ Error al limpiar almacenamientos:", error);
    }
    
    // Limpiar el estado
    setUser(null);
  };

  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);

    // Actualizar donde esté guardado (localStorage o sessionStorage)
    if (localStorage.getItem("user")) {
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } else {
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isLoggedIn, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
};
