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
      }).populate({
        path: "desafioId",
        populate: {
          path: "creadorId",
          select: "nombre apellido fotoPerfil",
        },
      });

      return res.json(
        userChallenges
          .filter((uc) => uc.desafioId)
          .map((uc) => ({
            ...uc.desafioId.toObject(),
            estadoParticipacion: uc.estado,
          }))
      );
    }

    const challenges = await Challenge.find(query).populate("creadorId", "nombre apellido fotoPerfil");
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
// OBTENER EL RETO DEL DÍA (rota automáticamente cada 24h)
router.get("/daily", async (req, res) => {
  try {
    const ahora = new Date();
    const hace24h = new Date(ahora - 24 * 60 * 60 * 1000);

    let daily = await Challenge.findOne({ esRetoDia: true, estado: "activo" });

    // Rotar si no hay ninguno o si han pasado más de 24h desde que se asignó
    if (!daily || !daily.fechaRetoDia || daily.fechaRetoDia < hace24h) {
      // Quitar la bandera al anterior
      if (daily) {
        await Challenge.findByIdAndUpdate(daily._id, { esRetoDia: false });
      }

      // Elegir el reto activo con la fecha de reto del día más antigua (o null), para rotar de forma justa
      const candidato = await Challenge.findOne({ estado: "activo" })
        .sort({ fechaRetoDia: 1 }); // null va primero, luego el más antiguo

      if (!candidato) return res.json({ reto: null, imagenesParticipantes: [] });

      await Challenge.findByIdAndUpdate(candidato._id, {
        esRetoDia: true,
        fechaRetoDia: ahora,
      });

      daily = await Challenge.findById(candidato._id);
    }

    const participaciones = await UserChallenge.find({
      desafioId: daily._id,
      estado: "aprobado",
    })
      .populate("usuarioId", "nombre fotoPerfil")
      .sort({ fechaEnvio: -1 })
      .limit(3);

    const datosParticipantes = participaciones.map(p => ({
      usuarioId: p.usuarioId?._id || null,
      fotoPerfil: p.usuarioId?.fotoPerfil || null,
      usuario: p.usuarioId?.nombre || "Usuario",
      comentario: p.descripcionEnvio || "¡Reto completado!",
    }));

    res.json({ reto: daily, imagenesParticipantes: datosParticipantes });
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
        const { userId } = req.query;

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
                titulo: p.titulo,
                descripcionEnvio: p.descripcionEnvio,
                imagenEnvio: p.imagenEnvio,
                multimediaEnvio: p.multimediaEnvio || [],
                valoracion: p.valoracion,
                fecha: p.fechaEnvio,
                likes: p.likes.length,
                likedByMe: userId ? p.likes.map(String).includes(String(userId)) : false,
                isOwn: userId ? String(p.usuarioId?._id || p.usuarioId) === String(userId) : false,
            }))
        });
    } catch (err) {
        res.status(500).json({ message: "Error al obtener participantes", error: err });
    }
});

// DAR / QUITAR LIKE A UNA PARTICIPACIÓN
router.post("/:id/participaciones/:participacionId/like", async (req, res) => {
    try {
        const { participacionId } = req.params;
        const { usuarioId } = req.body;

        if (!usuarioId) return res.status(400).json({ message: "usuarioId requerido" });

        const participacion = await UserChallenge.findById(participacionId);
        if (!participacion) return res.status(404).json({ message: "Participación no encontrada" });

        if (String(participacion.usuarioId) === String(usuarioId)) {
            return res.status(403).json({ message: "No puedes dar like a tu propia respuesta" });
        }

        const yaLiked = participacion.likes.map(String).includes(String(usuarioId));
        if (yaLiked) {
            participacion.likes.pull(usuarioId);
        } else {
            participacion.likes.push(usuarioId);
        }
        await participacion.save();

        res.json({ likes: participacion.likes.length, likedByMe: !yaLiked });
    } catch (err) {
        res.status(500).json({ message: "Error al procesar like", error: err });
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
    const { titulo, descripcion, imagenDesafio, creadorId, dificultad, categoria, duracion, multimedia } = req.body;

    if (!titulo || !descripcion || !creadorId) {
      return res.status(400).json({ message: "Título, descripción y creador son obligatorios" });
    }

    const user = await User.findById(creadorId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const newChallenge = new Challenge({
      titulo,
      descripcion,
      imagenDesafio: imagenDesafio || null,
      creadorId,
      creador: `${user.nombre} ${user.apellido}`,
      dificultad,
      categoria,
      duracion,
      multimedia: multimedia || [],
    });

    await newChallenge.save();

    res.status(201).json({ message: "Reto creado exitosamente", reto: newChallenge });
  } catch (err) {
    res.status(500).json({ message: "Error al crear reto", error: err });
  }
});

// Actualizar reto
router.put("/:id", async (req, res) => {
  try {
    const { titulo, descripcion, imagenDesafio, dificultad, categoria, duracion, multimedia } = req.body;

    const challenge = await Challenge.findByIdAndUpdate(
      req.params.id,
      { titulo, descripcion, imagenDesafio, dificultad, categoria, duracion, multimedia },
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

    // Borrar todas las participaciones del reto
    await UserChallenge.deleteMany({ desafioId: req.params.id });

    res.json({ message: "Reto eliminado exitosamente" });
  } catch (err) {
    res.status(500).json({ message: "Error al eliminar reto", error: err });
  }
});

// Borrar respuesta/participación de un usuario en un reto
router.delete("/:id/respuesta/:usuarioId", async (req, res) => {
  try {
    const { id, usuarioId } = req.params;

    const participacion = await UserChallenge.findOneAndDelete({ desafioId: id, usuarioId });
    if (!participacion) {
      return res.status(404).json({ message: "Participación no encontrada" });
    }

    // Decrementar contador de participantes
    await Challenge.findByIdAndUpdate(id, { $inc: { participantes: -1 } });

    // Recalcular valoración promedio
    const restantes = await UserChallenge.find({ desafioId: id, estado: "aprobado", valoracion: { $ne: null } });
    const promedio = restantes.length > 0
      ? restantes.reduce((acc, p) => acc + p.valoracion, 0) / restantes.length
      : 0;
    await Challenge.findByIdAndUpdate(id, { valoracionPromedio: Math.round(promedio * 10) / 10 });

    res.json({ message: "Respuesta eliminada" });
  } catch (err) {
    res.status(500).json({ message: "Error al eliminar respuesta", error: err });
  }
});

// Enviar respuesta a un reto (actualizar participación con multimedia)
router.put("/:id/respuesta", async (req, res) => {
  try {
    const { usuarioId, titulo, descripcionEnvio, valoracion, multimediaEnvio } = req.body;
    const { id } = req.params;

    const participacion = await UserChallenge.findOne({ desafioId: id, usuarioId });
    if (!participacion) {
      return res.status(404).json({ message: "No estás unido a este reto" });
    }

    participacion.titulo = titulo || "";
    participacion.descripcionEnvio = descripcionEnvio || "";
    participacion.valoracion = valoracion || null;
    participacion.multimediaEnvio = multimediaEnvio || [];
    if (participacion.multimediaEnvio.length > 0) {
      const primera = participacion.multimediaEnvio.find(m => m.tipo === "imagen");
      if (primera) participacion.imagenEnvio = primera.url;
    }
    const yaEstabaAprobado = participacion.estado === "aprobado";
    participacion.estado = "aprobado";

    await participacion.save();

    // Incrementar participantes solo si es la primera vez que se aprueba
    if (!yaEstabaAprobado) {
      await Challenge.findByIdAndUpdate(id, { $inc: { participantes: 1 } });
    }

    // Actualizar valoración promedio del reto
    if (valoracion) {
      const todas = await UserChallenge.find({ desafioId: id, estado: "aprobado", valoracion: { $ne: null } });
      const promedio = todas.reduce((acc, p) => acc + p.valoracion, 0) / todas.length;
      await Challenge.findByIdAndUpdate(id, { valoracionPromedio: Math.round(promedio * 10) / 10 });
    }

    res.json({ message: "Respuesta enviada", participacion });
  } catch (err) {
    res.status(500).json({ message: "Error al enviar respuesta", error: err });
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

    if (String(challenge.creadorId) === String(usuarioId)) {
      return res.status(403).json({ message: "No puedes participar en tu propio reto" });
    }

    const userChallenge = new UserChallenge({
      usuarioId,
      desafioId: id,
      imagenEnvio,
      descripcionEnvio,
    });

    await userChallenge.save();

    res.status(201).json({ message: "Participación registrada", participacion: userChallenge });
  } catch (err) {
    res.status(500).json({ message: "Error al participar", error: err });
  }
});

// Recalcular participantes de todos los retos según respuestas aprobadas
router.post("/recalcular-participantes", async (req, res) => {
  try {
    const retos = await Challenge.find({}, "_id");
    for (const reto of retos) {
      const aprobados = await UserChallenge.countDocuments({ desafioId: reto._id, estado: "aprobado" });
      await Challenge.findByIdAndUpdate(reto._id, { participantes: aprobados });
    }
    res.json({ message: `Recalculados ${retos.length} retos` });
  } catch (err) {
    res.status(500).json({ message: "Error al recalcular", error: err });
  }
});

module.exports = router;
