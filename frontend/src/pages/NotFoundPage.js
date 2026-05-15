import { useEffect } from "react";

function NotFoundPage() {
  useEffect(() => {
    document.title = "Página no encontrada – DayDare";
  }, []);

  return (
    <section>
      <h1>404</h1>
      <p>La pagina que buscas no existe.</p>
    </section>
  );
}

export default NotFoundPage;
