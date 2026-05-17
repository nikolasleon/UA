const mongoose = require("mongoose");

const challengeSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true,
  },
  descripcion: {
    type: String,
    required: true,
  },
  imagenDesafio: {
    type: String,
    default: null,
  },
  creadorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  creador: {
    type: String,
    required: true,
  },
  fechaCreacion: {
    type: Date,
    default: Date.now,
  },
  esRetoDia: {
    type: Boolean,
    default: false,
  },
  fechaRetoDia: {
    type: Date,
    default: null,
  },
  dificultad: {
    type: String,
    enum: ["fácil", "medio", "intenso"],
    default: "medio",
  },
  categoria: {
    type: String,
    enum: ["fuerza", "cardio", "aire libre", "gimnasio", "yoga", "general", "equipo", "flexibilidad", "resistencia", "arte", "tecnologia", "cocina", "música"],
    default: "general",
  },
  duracion: {
    type: String,
    enum: ["5min", "10min", "15min", "20min", "30min", "45min", "1h", "1h 30min", "2h"],
    default: "15min",
  },
  multimedia: [
    {
      url: { type: String, required: true },
      tipo: { type: String, enum: ["imagen", "video", "audio", "pdf"], required: true },
    },
  ],
  participantes: {
    type: Number,
    default: 0,
  },
  valoracionPromedio: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  estado: {
    type: String,
    enum: ["activo", "completado", "archivado"],
    default: "activo",
  },
});

module.exports = mongoose.model("Challenge", challengeSchema);
