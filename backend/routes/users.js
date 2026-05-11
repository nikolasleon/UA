const express = require("express");
const router = express.Router();
const multer = require("multer");
const bcrypt = require("bcrypt");
const { createClient } = require("@supabase/supabase-js");
const User = require("../models/User");
const Challenge = require("../models/Challenge");
const UserChallenge = require("../models/UserChallenge");

const SALT_ROUNDS = 10;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/", "video/", "audio/", "application/pdf"];
    if (!allowed.some((t) => file.mimetype.startsWith(t))) {
      return cb(new Error("Tipo de archivo no permitido"));
    }
    cb(null, true);
  },
});

// Subir archivo (foto, vídeo, audio, PDF)
router.post("/upload", upload.single("archivo"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No se recibió ningún archivo" });
  }
  try {
    const ext = req.file.originalname.split(".").pop();
    const filename = `upload_${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("uploads")
      .upload(filename, req.file.buffer, { contentType: req.file.mimetype });

    if (error) throw error;

    const { data } = supabase.storage.from("uploads").getPublicUrl(filename);
    res.json({ url: data.publicUrl });
  } catch (err) {
    res.status(500).json({ message: "Error al subir el archivo", error: err.message });
  }
});

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

    const hash = await bcrypt.hash(contraseña, SALT_ROUNDS);

    const newUser = await User.create({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: email.toLowerCase(),
      contraseña: hash,
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

    const passwordMatch = user && (await bcrypt.compare(contraseña, user.contraseña));
    if (!passwordMatch) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    res.json({
      message: "Login correcto",
      user: {
        _id: user._id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        fotoPerfil: user.fotoPerfil || "",
        tema: user.tema || "claro",
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Error al iniciar sesión", error: err });
  }
});

// Obtener perfil de un usuario (respeta privacidad)
router.get("/profile/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    
    // Si el perfil es privado y no es el mismo usuario, devolver info limitada
    const isPrivate = user.privacidad?.perfil === "privado";
    const isSameUser = req.query.currentUserId === req.params.id;
    
    if (isPrivate && !isSameUser) {
      // Devolver solo información básica pública
      return res.json({
        _id: user._id,
        nombre: user.nombre,
        apellido: user.apellido,
        fotoPerfil: user.fotoPerfil,
        bio: user.bio,
        isPrivate: true,
        message: "Este perfil es privado"
      });
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
      cuentaPrivada,
    } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (fotoPerfil !== undefined && user.fotoPerfil && fotoPerfil !== user.fotoPerfil) {
      try {
        // Extraemos el nombre del archivo de la URL antigua
        const fileNameAntiguo = user.fotoPerfil.split("/").pop();
        
        // Borramos el archivo de Supabase
        await supabase.storage
          .from("uploads")
          .remove([fileNameAntiguo]);
        
        console.log("Foto de perfil antigua eliminada de Supabase:", fileNameAntiguo);
      } catch (err) {
        console.error("Error al borrar foto antigua de Supabase:", err);
      }
    }

    if (nombre !== undefined) user.nombre = nombre;
    if (apellido !== undefined) user.apellido = apellido;
    if (bio !== undefined) user.bio = bio;
    if (fotoPerfil !== undefined) user.fotoPerfil = fotoPerfil;
    if (tema !== undefined) user.tema = tema;
    if (telefono !== undefined) user.telefono = telefono;
    if (fechaNacimiento !== undefined) user.fechaNacimiento = fechaNacimiento;
    if (nacionalidad !== undefined) user.nacionalidad = nacionalidad;
    if (email !== undefined) user.email = email;

    if (cuentaPrivada !== undefined) {
      const nuevoValor = cuentaPrivada ? "privado" : "publico";
      user.privacidad = {
        ...(user.privacidad ? user.privacidad.toObject?.() ?? user.privacidad : {}),
        perfil: nuevoValor,
      };
    }

    const savedUser = await user.save();

    res.json({ message: "Perfil actualizado", user: savedUser });
  } catch (err) {
    console.error("Backend - Error al actualizar:", err);
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

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    user.privacidad = {
      ...(user.privacidad ? user.privacidad.toObject?.() ?? user.privacidad : {}),
      perfil: perfil === "privado" ? "privado" : "publico",
    };

    const savedUser = await user.save();

    res.json({ message: "Privacidad actualizada", user: savedUser });
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

    if (!(await bcrypt.compare(contraseñaActual, user.contraseña))) {
      return res.status(401).json({ message: "Contraseña actual incorrecta" });
    }

    user.contraseña = await bcrypt.hash(contraseñaNueva, SALT_ROUNDS);
    await user.save();

    res.json({ message: "Contraseña actualizada" });
  } catch (err) {
    res.status(500).json({ message: "Error al cambiar contraseña", error: err });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const usuarioId = req.params.id;

    const user = await User.findById(usuarioId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const archivosABorrar = [];

    // Foto de perfil
    if (user.fotoPerfil) {
      archivosABorrar.push(user.fotoPerfil.split("/").pop());
    }

    // Retos creados
    const retosCreados = await Challenge.find({ creadorId: usuarioId }); 
    retosCreados.forEach(reto => {
      if (reto.imagenDesafio) archivosABorrar.push(reto.imagenDesafio.split("/").pop());
      if (reto.multimedia) {
        reto.multimedia.forEach(m => {
           if (m.url) archivosABorrar.push(m.url.split("/").pop());
        });
      }
    });

    // Participaciones
    const participacionesPropias = await UserChallenge.find({ usuarioId: usuarioId });
    participacionesPropias.forEach(p => {
      if (p.imagenEnvio) archivosABorrar.push(p.imagenEnvio.split("/").pop());
      if (p.multimediaEnvio) {
        p.multimediaEnvio.forEach(m => {
          if (m.url) archivosABorrar.push(m.url.split("/").pop());
        });
      }
    });

    // Borrado físico en Supabase
    if (archivosABorrar.length > 0) {
      const listaUnica = [...new Set(archivosABorrar.filter(name => name))];
      await supabase.storage.from("uploads").remove(listaUnica);
      console.log("Multimedia borrada de Supabase");
    }
    
    // Borrar participaciones en retos creados por el usuario y luego los retos
    const retosIds = retosCreados.map((r) => r._id);
    await UserChallenge.deleteMany({ desafioId: { $in: retosIds } });
    await Challenge.deleteMany({ creadorId: usuarioId });

    // Guardamos los retos ajenos afectados antes de borrar las participaciones
    const desafiosAfectados = [...new Set(participacionesPropias.map((p) => String(p.desafioId)))];

    // Borrar participaciones del usuario
    await UserChallenge.deleteMany({ usuarioId: usuarioId });

    // Borrar el usuario finalmente
    await User.findByIdAndDelete(usuarioId);

    // 3. Recalcular promedios de los retos donde participó
    for (const desafioId of desafiosAfectados) {
      const aprobados = await UserChallenge.find({ desafioId, estado: "aprobado" });
      const conValoracion = aprobados.filter((p) => p.valoracion != null);
      const promedio = conValoracion.length > 0
          ? conValoracion.reduce((acc, p) => acc + p.valoracion, 0) / conValoracion.length
          : 0;
      
      await Challenge.findByIdAndUpdate(desafioId, {
        participantes: aprobados.length,
        valoracionPromedio: Math.round(promedio * 10) / 10,
      });
    }

    res.json({ message: "Cuenta y toda su multimedia eliminadas exitosamente" });
  } catch (err) {
    console.error(err);
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
      .limit(10)
      .lean();

    res.json(
      userComments.map((comment) => ({
        ...comment,
        likesCount: comment.likes?.length || 0,
      }))
    );
  } catch (err) {
    res.status(500).json({ message: "Error al obtener comentarios", error: err });
  }
});

module.exports = router;
