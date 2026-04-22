import "./Buscar.css";
import { FaSearch, FaTimes } from "react-icons/fa";
import { useState } from "react";
import { useLocation } from "react-router-dom";

// IMÁGENES
import rutaBiciImg from "../assets/images/rutabici.jpg";
import sentadillasImg from "../assets/images/sentadillas.jpg";
import cintacorrerImg from "../assets/images/cintacorrer.png";
import yogaImg from "../assets/images/yoga.png";

// leer query params
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function Buscar() {
  const query = useQuery();
  const urlSearch = query.get("query") || "";

  const [search, setSearch] = useState(urlSearch);
  const [categoria, setCategoria] = useState("");
  const [duracion, setDuracion] = useState("");
  const [nivel, setNivel] = useState("");

  const retos = [
    {
      titulo: "Haz una ruta en bici de 5km",
      descripcion: "Haz una pequeña ruta de 5km en bici al aire libre.",
      imagen: rutaBiciImg,
      tags: ["Aire libre", "15-20min", "Fácil"]
    },
    {
      titulo: "Sesión de 50 sentadillas",
      descripcion: "Realiza una sesión de 50 sentadillas.",
      imagen: sentadillasImg,
      tags: ["Fuerza", "5min", "Medio"]
    },
    {
      titulo: "Corre 5km",
      descripcion: "Corre 5km en cualquier lugar, aire libre o cinta.",
      imagen: cintacorrerImg,
      tags: ["Cardio", "30min", "Medio"]
    },
    {
      titulo: "Equilibrio básico",
      descripcion: "Realiza tus primeras poses de yoga.",
      imagen: yogaImg,
      tags: ["Yoga", "15min", "Fácil"]
    }
  ];

  const retosFiltrados = retos.filter((reto) => {
    const coincideTexto = reto.titulo
      .toLowerCase()
      .includes(search.toLowerCase());

    const coincideCategoria = categoria
      ? reto.tags[0] === categoria
      : true;

    const coincideDuracion = duracion
      ? reto.tags[1] === duracion
      : true;

    const coincideNivel = nivel
      ? reto.tags[2] === nivel
      : true;

    return coincideTexto && coincideCategoria && coincideDuracion && coincideNivel;
  });

  return (
    <div className="page">

      {/* BUSCADOR (SIN HEADER DUPLICADO) */}
      <section className="search-block">
        <h1 className="search-title">BUSCA TU RETO</h1>

        <div className="search-container">

          <div className="search-bar">
            <FaSearch className="icon-left" />

            <input
              type="text"
              placeholder="Busca un reto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <FaTimes
              className="icon-right"
              onClick={() => setSearch("")}
            />
          </div>

          <h3 className="filters-title">Filtros rápidos</h3>

          <div className="filters">

            <select onChange={(e) => setCategoria(e.target.value)}>
              <option value="">Categorías</option>
              <option>Fuerza</option>
              <option>Cardio</option>
              <option>Aire libre</option>
              <option>Gimnasio</option>
              <option>Yoga</option>
            </select>

            <select onChange={(e) => setDuracion(e.target.value)}>
              <option value="">Duración</option>
              <option>5min</option>
              <option>10min</option>
              <option>15min</option>
              <option>30min</option>
              <option>15-20min</option>
            </select>

            <select onChange={(e) => setNivel(e.target.value)}>
              <option value="">Nivel</option>
              <option>Fácil</option>
              <option>Medio</option>
              <option>Intenso</option>
            </select>

          </div>
        </div>
      </section>

      {/* RESULTADOS */}
      <h2 className="popular-title">RETOS POPULARES</h2>

      <div className="cards-container">

        {retosFiltrados.length > 0 ? (
          retosFiltrados.map((reto, index) => (
            <div className="card" key={index}>
              <img src={reto.imagen} alt="reto" />
              <div className="card-info">
                <h3>{reto.titulo}</h3>
                <p>{reto.descripcion}</p>

                <div className="tags">
                  {reto.tags.map((tag, i) => (
                    <span key={i}>{tag}</span>
                  ))}
                </div>

              </div>
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center" }}>
            No se encontraron retos.
          </p>
        )}

      </div>

    </div>
  );
}

export default Buscar;
