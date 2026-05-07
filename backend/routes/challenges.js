const express = require("express");
const router = express.Router();
const Challenge = require("../models/Challenge");
const UserChallenge = require("../models/UserChallenge");
const User = require("../models/User");

// Obtener retos del usuario (creados, en progreso, completados)
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { estado } = req.query; // "creados", "enProgreso", "completados"

    let query = {};

    if (estado === "creados") {
      query = { creadorId: userId };
    } else if (estado === "enProgreso" || estado === "completados") {
      // Para estos casos buscamos en UserChallenge
      const userChallenges = await UserChallenge.find({
        usuarioId: userId,
        estado: estado === "completados" ? "aprobado" : "pendiente",
      }).populate("desafioId");

      return res.json(
        userChallenges.map((uc) => ({
          ...uc.desafioId.toObject(),
          estadoParticipacion: uc.estado,
        }))
      );
    }

    const challenges = await Challenge.find(query).populate("creadorId", "nombre apellido");
    res.json(challenges);
  } catch (err) {
    console.error("Error fatal en la base de datos:", err);
    res.status(500).json({ message: "Error al obtener retos", error: err });
  }
});

// Obtener todos los retos
router.get("/", async (req, res) => {
  try {
    const challenges = await Challenge.find({ estado: "activo" }).populate(
      "creadorId",
      "nombre apellido fotoPerfil"
    );
    res.json(challenges);
  } catch (err) {
    console.error("Error fatal en la base de datos:", err);
    res.status(500).json({ message: "Error al obtener retos", error: err });
  }
});
// OBTENER EL RETO DEL DÍA
router.get("/daily", async (req, res) => {
  try {
    const dailyChallenge = await Challenge.findOne({ esRetoDia: true, estado: "activo" });

    if (!dailyChallenge) {
      const fallback = await Challenge.findOne({ estado: "activo" }).sort({ fechaCreacion: -1 });
      return res.json({ reto: fallback, imagenesParticipantes: [] });
    }

    // Cambiamos el .find para que traiga los datos del usuario
    const participaciones = await UserChallenge.find({
      desafioId: dailyChallenge._id,
      estado: "aprobado"
    })
    .populate("usuarioId", "nombre") // Traemos el nombre del usuario
    .sort({ fechaEnvio: -1 })
    .limit(3); // El mockup muestra 3 tarjetas

    // Enviamos el objeto completo en lugar de solo la URL
    const datosParticipantes = participaciones.map(p => ({
      url: p.imagenEnvio,
      usuario: p.usuarioId?.nombre || "Usuario",
      comentario: p.descripcionEnvio || "¡Reto completado!"
    }));

    res.json({
      reto: dailyChallenge,
      imagenesParticipantes: datosParticipantes
    });
  } catch (err) {
    res.status(500).json({ message: "Error en el servidor", error: err });
  }
});
//OBTENER UN RETO ESPECÍFICO
router.get("/:id", async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id).populate(
      "creadorId",
      "nombre apellido fotoPerfil bio"
    );

    if (!challenge) {
      return res.status(404).json({ message: "Reto no encontrado" });
    }

    res.json(challenge);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener reto. Verifica que el ID sea correcto.", error: err });
  }
});

// OBTENER PARTICIPANTES
router.get("/:id/participantes", async (req, res) => {
    try {
        const { id } = req.params;
        const participaciones = await UserChallenge.find({ 
            desafioId: id, 
            estado: "aprobado" 
        })
        .populate("usuarioId", "nombre apellido fotoPerfil")
        .sort({ fechaEnvio: 1 });

        res.json({
            participantes: participaciones.map(p => ({
                id: p._id,
                usuario: p.usuarioId,
                descripcionEnvio: p.descripcionEnvio,
                imagenEnvio: p.imagenEnvio,
                fecha: p.fechaEnvio,
                likes: Math.floor(Math.random() * 50)
            }))
        });
    } catch (err) {
        res.status(500).json({ message: "Error al obtener participantes", error: err });
    }
});

// OBTENER ESTADO DE PARTICIPACIÓN DE UN USUARIO EN UN RETO
router.get("/:id/estado/:usuarioId", async (req, res) => {
  try {
    const { id, usuarioId } = req.params;
    
    // Buscamos la participación en la colección UserChallenge
    const participacion = await UserChallenge.findOne({ 
      desafioId: id, 
      usuarioId: usuarioId 
    });

    if (!participacion) {
      return res.json({ estado: "no_unido" });
    }

    // Si el estado es 'aprobado', significa que ya subió la respuesta y terminó
    if (participacion.estado === "aprobado") {
      return res.json({ estado: "completado" });
    }

    // Si existe pero no está aprobado (está 'pendiente'), es que se ha unido pero no ha terminado
    return res.json({ estado: "pendiente" });
  } catch (err) {
    res.status(500).json({ message: "Error al obtener estado de participación", error: err });
  }
});
// Crear nuevo reto
router.post("/", async (req, res) => {
  try {
    const { titulo, descripcion, imagenDesafio, creadorId, dificultad, categoria, esRetoDia } = req.body;

    if (!titulo || !descripcion || !creadorId) {
      return res.status(400).json({ message: "Título, descripción y creador son obligatorios" });
    }

    // Obtener nombre del creador
    const user = await User.findById(creadorId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const newChallenge = new Challenge({
      titulo,
      descripcion,
      imagenDesafio,
      creadorId,
      creador: `${user.nombre} ${user.apellido}`,
      dificultad: dificultad || "medio",
      categoria: categoria || "general",
      esRetoDia: Boolean(esRetoDia),
    });

    await newChallenge.save();

    // Actualizar contador de retos creados del usuario
    await User.findByIdAndUpdate(
      creadorId,
      { $inc: { "estilo.retosCreados": 1 } },
      { new: true }
    );

    res.status(201).json({ message: "Reto creado exitosamente", reto: newChallenge });
  } catch (err) {
    res.status(500).json({ message: "Error al crear reto", error: err });
  }
});

// Actualizar reto
router.put("/:id", async (req, res) => {
  try {
    const { titulo, descripcion, imagenDesafio, dificultad, categoria } = req.body;

    const challenge = await Challenge.findByIdAndUpdate(
      req.params.id,
      { titulo, descripcion, imagenDesafio, dificultad, categoria },
      { new: true }
    );

    if (!challenge) {
      return res.status(404).json({ message: "Reto no encontrado" });
    }

    res.json({ message: "Reto actualizado", reto: challenge });
  } catch (err) {
    res.status(500).json({ message: "Error al actualizar reto", error: err });
  }
});

// Borrar reto
router.delete("/:id", async (req, res) => {
  try {
    const challenge = await Challenge.findByIdAndDelete(req.params.id);

    if (!challenge) {
      return res.status(404).json({ message: "Reto no encontrado" });
    }

    // Actualizar contador de retos creados
    await User.findByIdAndUpdate(
      challenge.creadorId,
      { $inc: { "estilo.retosCreados": -1 } },
      { new: true }
    );

    res.json({ message: "Reto eliminado exitosamente" });
  } catch (err) {
    res.status(500).json({ message: "Error al eliminar reto", error: err });
  }
});

// Participar en un reto (subir imagen)
router.post("/:id/participar", async (req, res) => {
  try {
    const { usuarioId, imagenEnvio, descripcionEnvio } = req.body;
    const { id } = req.params;

    const challenge = await Challenge.findById(id);
    if (!challenge) {
      return res.status(404).json({ message: "Reto no encontrado" });
    }

    const userChallenge = new UserChallenge({
      usuarioId,
      desafioId: id,
      imagenEnvio,
      descripcionEnvio,
    });

    await userChallenge.save();

    // Actualizar contador de participantes
    await Challenge.findByIdAndUpdate(id, { $inc: { participantes: 1 } });

    res.status(201).json({ message: "Participación registrada", participacion: userChallenge });
  } catch (err) {
    res.status(500).json({ message: "Error al participar", error: err });
  }
});

module.exports = router;
