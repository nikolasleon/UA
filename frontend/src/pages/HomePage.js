import { useEffect, useState } from "react";

function HomePage() {
  const [message, setMessage] = useState("Cargando...");

  useEffect(() => {
    fetch("http://localhost:5000")
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
