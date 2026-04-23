require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

// Configurar CORS para permitir desde Render y localhost
const corsOptions = {
  origin: [
    "https://daydare.onrender.com",
    "http://localhost:3000",
    "http://localhost:5000",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, "../frontend/build")));

// Importar rutas
const userRoutes = require("./routes/users");
const challengeRoutes = require("./routes/challenges");

// Usar rutas
app.use("/api/users", userRoutes);
app.use("/api/challenges", challengeRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ message: "API funcionando" });
});

// Servir index.html para todas las rutas que no sean API
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado"))
  .catch(err => console.log("Error MongoDB:", err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});