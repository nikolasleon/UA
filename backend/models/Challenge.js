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
  dificultad: {
    type: String,
    enum: ["fácil", "medio", "difícil"],
    default: "medio",
  },
  categoria: {
    type: String,
    default: "general",
  },
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
