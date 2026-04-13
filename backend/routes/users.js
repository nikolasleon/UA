const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Challenge = require("../models/Challenge");

// Registrar usuario
router.post("/register", async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      email,
      contraseña,
      bio,
      fotoPerfil,
      telefono,
      fechaNacimiento,
      nacionalidad,
      tema,
      privacidad,
      preferenciasNotificaciones,
    } = req.body;

    if (!nombre || !apellido || !email || !contraseña) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "El email ya está registrado" });
    }

    const newUser = await User.create({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: email.toLowerCase(),
      contraseña,
      bio: bio ? bio.trim() : "",
      fotoPerfil: fotoPerfil ? fotoPerfil.trim() : null,
      telefono: telefono ? telefono.trim() : null,
      fechaNacimiento: fechaNacimiento || null,
      nacionalidad: nacionalidad ? nacionalidad.trim() : null,
      tema: tema === "oscuro" ? "oscuro" : "claro",
      privacidad: {
        perfil: privacidad?.perfil === "privado" ? "privado" : "publico",
      },
      preferenciasNotificaciones: {
        email: preferenciasNotificaciones?.email ?? true,
        actualizacionesContenido: preferenciasNotificaciones?.actualizacionesContenido ?? true,
      },
    });

    res.status(201).json({
      message: "Usuario registrado correctamente",
      user: newUser,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "El email ya está registrado" });
    }

    res.status(500).json({ message: "Error al registrar usuario", error: err });
  }
});

// Login básico (validar email y contraseña)
router.post("/login", async (req, res) => {
  try {
    const { email, contraseña } = req.body;

    if (!email || !contraseña) {
      return res.status(400).json({ message: "Email y contraseña son obligatorios" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user || user.contraseña !== contraseña) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    res.json({
      message: "Login correcto",
      user: {
        _id: user._id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Error al iniciar sesión", error: err });
  }
});

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

module.exports = router;
