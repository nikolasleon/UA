const mongoose = require("mongoose");

const userChallengeSchema = new mongoose.Schema({
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  desafioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Challenge",
    required: true,
  },
  titulo: {
    type: String,
    default: "",
  },
  imagenEnvio: {
    type: String,
    default: "",
  },
  multimediaEnvio: {
    type: [{ url: String, tipo: { type: String, enum: ["imagen", "video", "audio", "pdf"] } }],
    default: [],
  },
  descripcionEnvio: {
    type: String,
    default: "",
  },
  fechaEnvio: {
    type: Date,
    default: Date.now,
  },
  estado: {
    type: String,
    enum: ["pendiente", "aprobado", "rechazado"],
    default: "pendiente",
  },
  valoracion: {
    type: Number,
    min: 1,
    max: 5,
    default: null,
  },
});

module.exports = mongoose.model("UserChallenge", userChallengeSchema);
