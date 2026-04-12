require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Configurar CORS - permitir todos los orígenes para debugging
app.use(cors());
app.use(express.json());

// Importar rutas
const userRoutes = require("./routes/users");
const challengeRoutes = require("./routes/challenges");

app.get("/", (req, res) => {
  console.log("Han llamado a /");
  res.json({ message: "API funcionando" });
});

// Usar rutas
app.use("/api/users", userRoutes);
app.use("/api/challenges", challengeRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado"))
  .catch(err => console.log("Error MongoDB:", err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});