const express = require("express");
const cors = require("cors");
const path = require("path");
const recipesRouter = require("./routes/recipesRoutes");
const favoritesRouter = require("./routes/favoritesRoutes");
const uploadRouter = require("./routes/uploadRoutes");
const shoppingListRouter = require("./routes/shoppingListRoutes");
const planningRouter = require("./routes/planningRoutes");

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

// Sert les images uploadées : ex. /uploads/172839-image.jpg
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use("/api/recipes", recipesRouter);
app.use("/api/favorites", favoritesRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/shopping-list", shoppingListRouter);
app.use("/api/planning", planningRouter);

// Gestion d'erreurs dédiée à l'upload (fichier trop lourd, mauvais format…)
// renvoyée en JSON plutôt qu'en page HTML brute
app.use((err, req, res, next) => {
  if (err && (err.code === "LIMIT_FILE_SIZE" || err.message?.includes("Format d'image"))) {
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
  next();
});

module.exports = app;