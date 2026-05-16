import { useEffect } from "react";
import { FaEnvelope, FaLayerGroup, FaReact, FaUniversalAccess, FaUsers } from "react-icons/fa";
import "../styles/AboutPage.css";

const teamMembers = [
  "Sandra Moya del Amo",
  "Nikolas Leon De Oliveira Dominguez",
  "Noelia Almeida Ibáñez",
  "Andrea Gómez Bobes",
];

function AboutPage() {
  useEffect(() => {
    document.title = "Acerca de – DayDare";
  }, []);

  return (
    <main className="about-page">
      <section className="about-hero" aria-labelledby="about-title">
        <div className="about-hero__content">
          <span className="about-kicker">Proyecto académico</span>
          <h1 id="about-title">Acerca de DayDare</h1>
          <p>
            DayDare es una plataforma web de retos diarios creada como práctica de la
            asignatura de Usabilidad y Accesibilidad. El proyecto combina participación
            social, creación de retos y valoración de contribuciones dentro de una
            interfaz pensada para ser clara, accesible y fácil de utilizar.
          </p>
        </div>
      </section>

      <section className="about-grid" aria-label="Información del proyecto">
        <article className="about-card about-card--team">
          <div className="about-card__icon" aria-hidden="true">
            <FaUsers />
          </div>
          <div>
            <span className="about-card__label">Nuestro grupo</span>
            <h2>Integrantes</h2>
            <ul className="about-team-list">
              {teamMembers.map((member) => (
                <li key={member}>{member}</li>
              ))}
            </ul>
          </div>
        </article>

        <article className="about-card">
          <div className="about-card__icon" aria-hidden="true">
            <FaLayerGroup />
          </div>
          <div>
            <span className="about-card__label">Grupo de clase</span>
            <h2>Usabilidad y Accesibilidad</h2>
            <p>
              Práctica desarrollada para aplicar los contenidos teóricos de la asignatura
              en una aplicación web real: navegación comprensible, jerarquía visual,
              consistencia, ergonomía móvil y accesibilidad web.
            </p>
          </div>
        </article>

        <article className="about-card">
          <div className="about-card__icon" aria-hidden="true">
            <FaUniversalAccess />
          </div>
          <div>
            <span className="about-card__label">Enfoque del diseño</span>
            <h2>Accesible desde el inicio</h2>
            <p>
              La interfaz se ha planteado siguiendo principios de usabilidad y criterios
              WCAG: contraste adecuado, textos legibles, controles reconocibles, estados
              visuales claros y una estructura mobile first.
            </p>
          </div>
        </article>

        <article className="about-card">
          <div className="about-card__icon" aria-hidden="true">
            <FaReact />
          </div>
          <div>
            <span className="about-card__label">Stack tecnológico</span>
            <h2>MERN Stack</h2>
            <p>
              La plataforma se ha construido con MongoDB, Express, React y Node.js, una
              combinación que permite crear una experiencia dinámica con usuarios,
              retos, respuestas y valoraciones de la comunidad.
            </p>
          </div>
        </article>
      </section>

      <section className="about-summary" aria-labelledby="project-summary-title">
        <div>
          <span className="about-kicker">Sobre DayDare</span>
          <h2 id="project-summary-title">Una comunidad de retos diarios</h2>
        </div>
        <p>
          Cada día se propone un reto global y los usuarios pueden subir una imagen para
          demostrar que lo han completado. Además, los usuarios registrados pueden crear
          sus propios retos, participar en los propuestos por otros miembros y valorar las
          aportaciones de la comunidad.
        </p>
        <p>
          El objetivo no es solo construir una aplicación funcional, sino demostrar cómo
          las decisiones de diseño centradas en el usuario mejoran la comprensión, reducen
          la carga cognitiva y hacen que la experiencia sea más inclusiva.
        </p>
      </section>

      <section className="about-footer-panel" aria-label="Contacto académico">
        <FaEnvelope aria-hidden="true" />
        <div>
          <h2>Contacto académico</h2>
          <p>
            Para cualquier consulta sobre el proyecto, el equipo puede ser contactado a
            través de los canales establecidos por la asignatura.
          </p>
        </div>
      </section>
    </main>
  );
}

export default AboutPage;
