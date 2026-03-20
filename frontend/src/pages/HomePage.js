import { useEffect, useState } from "react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000"; //para probarlo en local comentar el process.env y dejar solo http://localhost:5000, para producción usar la variable de entorno REACT_APP_API_URL con la URL del backend desplegado.

function HomePage() {
  const [message, setMessage] = useState("Cargando...");

  useEffect(() => {
    fetch(`${API_URL}`)
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage("No se pudo conectar con el backend"));
  }, []);

  return (
    <section>
      <h1>Inicio</h1>
      <p>{message}</p>
    </section>
  );
}

export default HomePage;
