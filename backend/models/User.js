const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  apellido: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  contraseña: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
    default: "",
  },
  fotoPerfil: {
    type: String,
    default: null,
  },
  telefono: {
    type: String,
    default: null,
  },
  fechaNacimiento: {
    type: Date,
    default: null,
  },
  nacionalidad: {
    type: String,
    default: null,
  },
  fechaRegistro: {
    type: Date,
    default: Date.now,
  },
  preferenciasNotificaciones: {
    email: {
      type: Boolean,
      default: true,
    },
    actualizacionesContenido: {
      type: Boolean,
      default: true,
    },
  },
  privacidad: {
    perfil: {
      type: String,
      enum: ["publico", "privado"],
      default: "publico",
    },
    descargas: {
      type: Number,
      default: 0,
    },
  },
  tema: {
    type: String,
    enum: ["claro", "oscuro"],
    default: "claro",
  },
  estilo: {
    retosCompletados: {
      type: Number,
      default: 0,
    },
    retosCreados: {
      type: Number,
      default: 0,
    },
    retosEnProgreso: {
      type: Number,
      default: 0,
    },
    puntuacionTotal: {
      type: Number,
      default: 0,
    },
  },
});

module.exports = mongoose.model("User", userSchema);
