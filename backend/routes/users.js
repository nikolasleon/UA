const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Challenge = require("../models/Challenge");
const UserChallenge = require("../models/UserChallenge");

// Obtener perfil de un usuario
router.get("/profile/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener usuario", error: err });
  }
});

// Actualizar perfil de usuario (todos los campos)
router.put("/profile/:id", async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      bio,
      fotoPerfil,
      tema,
      telefono,
      fechaNacimiento,
      nacionalidad,
      email,
    } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        nombre,
        apellido,
        bio,
        fotoPerfil,
        tema,
        telefono,
        fechaNacimiento,
        nacionalidad,
        email,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ message: "Perfil actualizado", user });
  } catch (err) {
    res.status(500).json({ message: "Error al actualizar perfil", error: err });
  }
});

// Actualizar preferencias de notificaciones
router.put("/settings/:id/notifications", async (req, res) => {
  try {
    const { email, actualizacionesContenido } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        "preferenciasNotificaciones.email": email,
        "preferenciasNotificaciones.actualizacionesContenido": actualizacionesContenido,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ message: "Notificaciones actualizadas", user });
  } catch (err) {
    res.status(500).json({ message: "Error al actualizar notificaciones", error: err });
  }
});

// Actualizar preferencias de privacidad
router.put("/settings/:id/privacy", async (req, res) => {
  try {
    const { perfil } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { "privacidad.perfil": perfil },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ message: "Privacidad actualizada", user });
  } catch (err) {
    res.status(500).json({ message: "Error al actualizar privacidad", error: err });
  }
});

// Cambiar contraseña
router.put("/settings/:id/password", async (req, res) => {
  try {
    const { contraseñaActual, contraseñaNueva } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // En producción usar bcrypt para verificar contraseña
    if (user.contraseña !== contraseñaActual) {
      return res.status(401).json({ message: "Contraseña actual incorrecta" });
    }

    user.contraseña = contraseñaNueva;
    await user.save();

    res.json({ message: "Contraseña actualizada" });
  } catch (err) {
    res.status(500).json({ message: "Error al cambiar contraseña", error: err });
  }
});

// Borrar cuenta del usuario
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Borrar todos los retos creados por el usuario
    await Challenge.deleteMany({ creadorId: req.params.id });

    res.json({ message: "Cuenta eliminada exitosamente" });
  } catch (err) {
    res.status(500).json({ message: "Error al eliminar cuenta", error: err });
  }
});

// Obtener comentarios/aportaciones de los retos completados del usuario
router.get("/:id/comments", async (req, res) => {
  try {
    // Obtener todos los UserChallenge APROBADOS donde el usuario es el que envió (usuarioId)
    // Ordenados por fecha más reciente primero
    const userComments = await UserChallenge.find({
      usuarioId: req.params.id,
      estado: "aprobado", // Solo mostrar aprobados (completados y con comentarios)
    })
      .populate("desafioId", "titulo")
      .sort({ fechaEnvio: -1 })
      .limit(10);

    res.json(userComments);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener comentarios", error: err });
  }
});

module.exports = router;
