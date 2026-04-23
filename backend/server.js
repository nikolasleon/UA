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

// Servir archivos estáticos del frontend
const buildPath = path.join(__dirname, "../frontend/build");
console.log("Sirviendo archivos estáticos desde:", buildPath);
app.use(express.static(buildPath));

// Servir index.html para todas las rutas que no sean API (catchall)
app.get("*", (req, res) => {
  const indexPath = path.join(buildPath, "index.html");
  console.log("Sirviendo index.html desde:", indexPath);
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error("Error sirviendo index.html:", err);
      res.status(404).json({ error: "No encontrado" });
    }
  });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado"))
  .catch(err => console.log("Error MongoDB:", err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});