require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User");
const Challenge = require("./models/Challenge");
const UserChallenge = require("./models/UserChallenge");

// ===========================
// FUNCIONES DE SEED
// ===========================

/**
 * Agrega retos deportivos creados por Sandra
 */
async function seedSportChallenges() {
  console.log("\n📊 Agregando RETOS DEPORTIVOS...");
  
  const sportChallenges = [
    {
      titulo: "Entrenamiento de escaleras",
      descripcion: "Completa 15 minutos subiendo y bajando escaleras a ritmo constante",
      imagenDesafio: "https://via.placeholder.com/300x200?text=Escaleras",
      dificultad: "medio",
      categoria: "deporte",
      participantes: 18,
      valoracionPromedio: 4.4,
      estado: "activo",
      esRetoDia: false,
    },
    {
      titulo: "Circuito funcional en casa",
      descripcion: "Haz un circuito de 4 ejercicios funcionales durante 20 minutos y comparte tu rutina",
      imagenDesafio: "https://via.placeholder.com/300x200?text=Circuito",
      dificultad: "difícil",
      categoria: "deporte",
      participantes: 27,
      valoracionPromedio: 4.7,
      estado: "activo",
      esRetoDia: false,
    },
    {
      titulo: "Reto de pasos del fin de semana",
      descripcion: "Consigue 12000 pasos en un día y describe cómo organizaste tu actividad",
      imagenDesafio: "https://via.placeholder.com/300x200?text=Pasos",
      dificultad: "fácil",
      categoria: "deporte",
      participantes: 41,
      valoracionPromedio: 4.3,
      estado: "activo",
      esRetoDia: false,
    },
  ];

  try {
    const sandra = await User.findOne({ email: "sandra@gmail.com" });
    if (!sandra) {
      console.log("❌ No se encontró a Sandra");
      return;
    }

    const existingTitles = sportChallenges.map((challenge) => challenge.titulo);
    const existingChallenges = await Challenge.find({
      creadorId: sandra._id,
      titulo: { $in: existingTitles },
    }).select("titulo");

    const existingTitleSet = new Set(existingChallenges.map((challenge) => challenge.titulo));
    const challengesToInsert = sportChallenges
      .filter((challenge) => !existingTitleSet.has(challenge.titulo))
      .map((challenge) => ({
        ...challenge,
        creadorId: sandra._id,
        creador: `${sandra.nombre} ${sandra.apellido}`,
      }));

    if (challengesToInsert.length === 0) {
      console.log("⚠️  Los 3 retos deportivos ya existen para Sandra");
      return;
    }

    await Challenge.insertMany(challengesToInsert);
    await User.findByIdAndUpdate(sandra._id, {
      $inc: { "estilo.retosCreados": challengesToInsert.length },
    });

    console.log(`✅ Se añadieron ${challengesToInsert.length} retos deportivos:`);
    challengesToInsert.forEach((challenge) => {
      console.log(`   • ${challenge.titulo}`);
    });
  } catch (error) {
    console.error("❌ Error al añadir retos deportivos:", error.message);
  }
}

/**
 * Crea usuarios adicionales y sus retos asociados
 */
async function seedOtherUsersAndChallenges() {
  console.log("\n👥 Creando OTROS USUARIOS y sus RETOS...");
  
  const otherUsers = [
    {
      nombre: "Carlos",
      apellido: "García",
      email: "carlos.garcia@gmail.com",
      telefono: "555-0101",
    },
    {
      nombre: "María",
      apellido: "López",
      email: "maria.lopez@gmail.com",
      telefono: "555-0102",
    },
    {
      nombre: "Juan",
      apellido: "Martínez",
      email: "juan.martinez@gmail.com",
      telefono: "555-0103",
    },
    {
      nombre: "Ana",
      apellido: "Rodríguez",
      email: "ana.rodriguez@gmail.com",
      telefono: "555-0104",
    },
  ];

  const challengesByCreator = {
    "Carlos García": [
      {
        titulo: "Reto de flexiones diarias",
        descripcion: "Realiza 50 flexiones en total durante el día, en series de 10",
        dificultad: "medio",
        categoria: "deporte",
        participantes: 15,
        valoracionPromedio: 4.5,
      },
      {
        titulo: "Reto de natación",
        descripcion: "Nada 1 kilómetro sin detenerte",
        dificultad: "difícil",
        categoria: "deporte",
        participantes: 12,
        valoracionPromedio: 4.4,
      },
    ],
    "María López": [
      {
        titulo: "Meditación matutina",
        descripcion: "Practica 10 minutos de meditación cada mañana durante una semana",
        dificultad: "fácil",
        categoria: "bienestar",
        participantes: 32,
        valoracionPromedio: 4.8,
      },
      {
        titulo: "Desafío sin azúcar",
        descripcion: "Pasa una semana sin consumir azúcar refinado ni bebidas azucaradas",
        dificultad: "medio",
        categoria: "nutrición",
        participantes: 19,
        valoracionPromedio: 4.2,
      },
    ],
    "Juan Martínez": [
      {
        titulo: "Carreras de 5K",
        descripcion: "Corre una distancia de 5 kilómetros sin parar",
        dificultad: "difícil",
        categoria: "deporte",
        participantes: 22,
        valoracionPromedio: 4.6,
      },
      {
        titulo: "Reto de saltos con cuerda",
        descripcion: "Realiza 500 saltos con cuerda sin interrupciones",
        dificultad: "difícil",
        categoria: "deporte",
        participantes: 14,
        valoracionPromedio: 4.3,
      },
    ],
    "Ana Rodríguez": [
      {
        titulo: "Desafío de yoga",
        descripcion: "Completa una sesión de yoga de 30 minutos de nivel intermedio",
        dificultad: "medio",
        categoria: "bienestar",
        participantes: 28,
        valoracionPromedio: 4.7,
      },
    ],
  };

  try {
    let totalUsersCreated = 0;
    let totalChallengesCreated = 0;

    for (const userData of otherUsers) {
      // Verificar si el usuario ya existe
      let user = await User.findOne({ email: userData.email });
      
      if (!user) {
        user = await User.create({
          nombre: userData.nombre,
          apellido: userData.apellido,
          email: userData.email,
          telefono: userData.telefono,
          contraseña: await bcrypt.hash("contraseña123", 10),
          fotoPerfil: `https://via.placeholder.com/150?text=${userData.nombre}`,
          tema: "claro",
        });
        totalUsersCreated++;
        console.log(`✅ Usuario creado: ${userData.nombre} ${userData.apellido}`);
      } else {
        console.log(`⚠️  Usuario ya existe: ${userData.nombre} ${userData.apellido}`);
      }

      // Crear retos para este usuario
      const creatorName = `${userData.nombre} ${userData.apellido}`;
      const userChallenges = challengesByCreator[creatorName] || [];

      for (const challengeData of userChallenges) {
        // Verificar si el reto ya existe
        const existing = await Challenge.findOne({
          titulo: challengeData.titulo,
          creadorId: user._id,
        });

        if (!existing) {
          await Challenge.create({
            ...challengeData,
            imagenDesafio: `https://via.placeholder.com/300x200?text=${challengeData.titulo}`,
            creadorId: user._id,
            creador: creatorName,
            estado: "activo",
            esRetoDia: false,
          });
          totalChallengesCreated++;
          console.log(`   • Reto creado: ${challengeData.titulo}`);
        }
      }

      // Actualizar contador de retos creados
      await User.findByIdAndUpdate(user._id, {
        "estilo.retosCreados": userChallenges.length,
      });
    }

    console.log(`\n📊 Resumen: ${totalUsersCreated} usuarios creados, ${totalChallengesCreated} retos creados`);
  } catch (error) {
    console.error("❌ Error al crear usuarios y retos:", error.message);
  }
}

/**
 * Agrega participaciones de Sandra en retos de otros usuarios
 */
async function seedSandraParticipations() {
  console.log("\n🎯 Agregando PARTICIPACIONES de Sandra...");
  
  try {
    const sandra = await User.findOne({ email: "sandra@gmail.com" });
    if (!sandra) {
      console.log("❌ No se encontró a Sandra");
      return;
    }

    // Obtener todos los retos creados por otros usuarios (no Sandra)
    const otherChallenges = await Challenge.find({
      creadorId: { $ne: sandra._id },
    });

    console.log(`   Encontrados ${otherChallenges.length} retos de otros usuarios`);

    let completedCount = 0;
    let inProgressCount = 0;

    for (let i = 0; i < otherChallenges.length; i++) {
      const challenge = otherChallenges[i];

      // Verificar si Sandra ya participa
      const existing = await UserChallenge.findOne({
        usuarioId: sandra._id,
        desafioId: challenge._id,
      });

      if (existing) {
        console.log(`   ⚠️  Sandra ya participa en: ${challenge.titulo}`);
        continue;
      }

      // Primeros 5 retos: completados (aprobado)
      // Resto: en progreso (pendiente)
      const isCompleted = i < 5;
      const estado = isCompleted ? "aprobado" : "pendiente";

      // Crear participación
      await UserChallenge.create({
        usuarioId: sandra._id,
        desafioId: challenge._id,
        imagenEnvio: "https://via.placeholder.com/300x200?text=Envio",
        descripcionEnvio: isCompleted ? "Completado exitosamente" : "Estoy trabajando en esto",
        estado: estado,
        valoracion: isCompleted ? 5 : null,
        comentarios: isCompleted ? "Excelente reto" : "",
      });

      if (isCompleted) {
        completedCount++;
      } else {
        inProgressCount++;
      }

      console.log(`   ${isCompleted ? "✅" : "⏳"} ${challenge.titulo}`);
    }

    // Actualizar estadísticas de Sandra
    await User.findByIdAndUpdate(sandra._id, {
      "estilo.retosCompletados": completedCount,
      "estilo.retosEnProgreso": inProgressCount,
    });

    console.log(`\n📊 Resumen de participaciones:`);
    console.log(`   ✅ Retos completados: ${completedCount}`);
    console.log(`   ⏳ Retos en progreso: ${inProgressCount}`);
  } catch (error) {
    console.error("❌ Error al agregar participaciones:", error.message);
  }
}

/**
 * Enriquece los comentarios de Sandra en sus retos completados
 */
async function seedSandraComments() {
  try {
    console.log("\n💬 Agregando comentarios a retos completados de Sandra...");

    // Obtener Sandra
    const sandra = await User.findOne({ nombre: "Sandra" });
    if (!sandra) {
      console.log("   ⚠️  No se encontró a Sandra");
      return;
    }

    // Comentarios variados y realistas por categoría
    const commentTemplates = [
      {
        descripcion: "¡Excelente reto! Me ayudó a mejorar mi resistencia física",
        valoracion: 5
      },
      {
        descripcion: "Completé el ejercicio completo, fue bastante desafiante pero gratificante",
        valoracion: 5
      },
      {
        descripcion: "Muy buena experiencia general, buen ritmo de dificultad",
        valoracion: 4
      },
      {
        descripcion: "Reto interesante que me motivó a superarme a mí misma",
        valoracion: 5
      },
      {
        descripcion: "Cumplí todos los objetivos y aprendí nuevas técnicas",
        valoracion: 5
      },
      {
        descripcion: "Fue un buen desafío para mi nivel actual de entrenamiento",
        valoracion: 4
      },
      {
        descripcion: "Completé con éxito, aunque fue más difícil de lo esperado",
        valoracion: 4
      },
      {
        descripcion: "Superé mis límites personales durante este reto",
        valoracion: 5
      },
    ];

    // Buscar todos los UserChallenge de Sandra con estado aprobado
    const sandraCompletedChallenges = await UserChallenge.find({
      usuarioId: sandra._id,
      estado: "aprobado",
    });

    console.log(`   Encontrados ${sandraCompletedChallenges.length} retos completados`);

    // Actualizar cada uno con comentarios variados
    for (let i = 0; i < sandraCompletedChallenges.length; i++) {
      const challenge = sandraCompletedChallenges[i];
      const template = commentTemplates[i % commentTemplates.length];

      // URLs de imágenes de muestra para diferentes tipos de actividades
      const sampleImages = [
        "https://via.placeholder.com/400x300?text=Completé+el+reto",
        "https://via.placeholder.com/400x300?text=Mi+aportación",
        "https://via.placeholder.com/400x300?text=Resultado+exitoso",
        "https://via.placeholder.com/400x300?text=Desafío+completado",
        "https://via.placeholder.com/400x300?text=Recordatorio+del+reto",
      ];

      // Variar entre 1 y 4 imágenes por comentario
      const numImages = (i % 4) + 1; // 1, 2, 3 o 4
      const imagenesEnvio = [];
      for (let j = 0; j < numImages; j++) {
        imagenesEnvio.push(sampleImages[(i + j) % sampleImages.length]);
      }

      // Actualizar el comentario
      await UserChallenge.findByIdAndUpdate(challenge._id, {
        descripcionEnvio: template.descripcion,
        valoracion: template.valoracion,
        imagenEnvio: imagenesEnvio[0], // Fallback para compatibilidad
        imagenesEnvio: imagenesEnvio,
      });

      console.log(`   ✅ Comentario agregado a reto ${i + 1}/${sandraCompletedChallenges.length} (${numImages} imagen/es)`);
    }

    console.log(`\n📊 Total: ${sandraCompletedChallenges.length} comentarios agregados`);
  } catch (error) {
    console.error("❌ Error al agregar comentarios:", error.message);
  }
}

// ===========================
// FUNCIÓN PRINCIPAL
// ===========================

async function seedDatabase(options = {}) {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB conectado");
    console.log("\n" + "=".repeat(50));
    console.log("🌱 INICIANDO SEED DE BASE DE DATOS");
    console.log("=".repeat(50));

    // Ejecutar según opciones pasadas o todas por defecto
    if (options.all || !Object.keys(options).length) {
      await seedOtherUsersAndChallenges();
      await seedSportChallenges();
      await seedSandraParticipations();
      await seedSandraComments();
    } else {
      if (options.otherUsers) await seedOtherUsersAndChallenges();
      if (options.sportChallenges) await seedSportChallenges();
      if (options.participations) await seedSandraParticipations();
      if (options.comments) await seedSandraComments();
    }

    console.log("\n" + "=".repeat(50));
    console.log("✅ SEED COMPLETADO EXITOSAMENTE");
    console.log("=".repeat(50) + "\n");
  } catch (error) {
    console.error("❌ Error durante el seed:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB desconectado\n");
  }
}

// ===========================
// EJECUCIÓN
// ===========================

// Determinar qué ejecutar según argumentos de línea de comandos
const args = process.argv.slice(2);
const options = {};

if (args.length === 0) {
  options.all = true; // Por defecto: ejecuta todo
} else {
  args.forEach((arg) => {
    if (arg === "all") options.all = true;
    if (arg === "users") options.otherUsers = true;
    if (arg === "sports") options.sportChallenges = true;
    if (arg === "participations") options.participations = true;
  });
}

seedDatabase(options);
