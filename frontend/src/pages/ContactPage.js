import { FaEnvelope, FaLayerGroup, FaReact, FaUniversalAccess, FaUsers } from "react-icons/fa";
import "../styles/ContactPage.css";

const teamMembers = [
  "Sandra Moya del Amo",
  "Nikolas Leon De Oliveira",
  "Noelia Almeida",
  "Andrea García ",
];

function ContactPage() {
  return (
    <main className="contact-page">
      <section className="contact-hero" aria-labelledby="contact-title">
        <div className="contact-hero__content">
          <span className="contact-kicker">Proyecto academico</span>
          <h1 id="contact-title">Contacto y equipo</h1>
          <p>
            DayDare es una plataforma web de retos diarios creada como practica de la
            asignatura de Usabilidad y Accesibilidad. El proyecto combina participacion
            social, creacion de retos y valoracion de contribuciones dentro de una
            interfaz pensada para ser clara, accesible y facil de utilizar.
          </p>
        </div>
      </section>

      <section className="contact-grid" aria-label="Informacion del proyecto">
        <article className="contact-card contact-card--team">
          <div className="contact-card__icon" aria-hidden="true">
            <FaUsers />
          </div>
          <div>
            <span className="contact-card__label">Nuestro grupo</span>
            <h2>Integrantes</h2>
            <ul className="contact-team-list">
              {teamMembers.map((member) => (
                <li key={member}>{member}</li>
              ))}
            </ul>
          </div>
        </article>

        <article className="contact-card">
          <div className="contact-card__icon" aria-hidden="true">
            <FaLayerGroup />
          </div>
          <div>
            <span className="contact-card__label">Grupo de clase</span>
            <h2>Usabilidad y Accesibilidad</h2>
            <p>
              Practica desarrollada para aplicar los contenidos teoricos de la asignatura
              en una aplicacion web real: navegacion comprensible, jerarquia visual,
              consistencia, ergonomia movil y accesibilidad web.
            </p>
          </div>
        </article>

        <article className="contact-card">
          <div className="contact-card__icon" aria-hidden="true">
            <FaUniversalAccess />
          </div>
          <div>
            <span className="contact-card__label">Enfoque del diseno</span>
            <h2>Accesible desde el inicio</h2>
            <p>
              La interfaz se ha planteado siguiendo principios de usabilidad y criterios
              WCAG: contraste adecuado, textos legibles, controles reconocibles, estados
              visuales claros y una estructura mobile first.
            </p>
          </div>
        </article>

        <article className="contact-card">
          <div className="contact-card__icon" aria-hidden="true">
            <FaReact />
          </div>
          <div>
            <span className="contact-card__label">Stack tecnologico</span>
            <h2>MERN Stack</h2>
            <p>
              La plataforma se ha construido con MongoDB, Express, React y Node.js, una
              combinacion que permite crear una experiencia dinamica con usuarios,
              retos, respuestas y valoraciones de la comunidad.
            </p>
          </div>
        </article>
      </section>

      <section className="contact-summary" aria-labelledby="project-summary-title">
        <div>
          <span className="contact-kicker">Sobre DayDare</span>
          <h2 id="project-summary-title">Una comunidad de retos diarios</h2>
        </div>
        <p>
          Cada dia se propone un reto global y los usuarios pueden subir una imagen para
          demostrar que lo han completado. Ademas, los usuarios registrados pueden crear
          sus propios retos, participar en los propuestos por otros miembros y valorar las
          aportaciones de la comunidad.
        </p>
        <p>
          El objetivo no es solo construir una aplicacion funcional, sino demostrar como
          las decisiones de diseno centradas en el usuario mejoran la comprension, reducen
          la carga cognitiva y hacen que la experiencia sea mas inclusiva.
        </p>
      </section>

      <section className="contact-footer-panel" aria-label="Contacto academico">
        <FaEnvelope aria-hidden="true" />
        <div>
          <h2>Contacto</h2>
          <p>
            Para cualquier consulta sobre el proyecto, el equipo puede ser contactado a
            traves de los canales establecidos por la asignatura.
          </p>
        </div>
      </section>
    </main>
  );
}

export default ContactPage;
