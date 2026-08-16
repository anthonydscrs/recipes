const pool = require("../database");

// L'auth est en place : l'utilisateur vient du JWT (req.user.id), posé par
// authMiddleware. On ne fait plus jamais confiance à un user_id envoyé par
// le client (query/body) pour savoir qui fait la requête.

const formatRecipe = (r) => ({
  ...r,
  image: r.image_url,
  ingredients: r.ingredients.split("\n"),
  preparation: r.preparation.split("\n"),
});

// GET /api/favorites
// Renvoie la liste complète des recettes favorites de l'utilisateur connecté.
const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT r.*
       FROM favorites f
       JOIN recipes r ON r.id = f.recipe_id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
      [userId]
    );

    res.json(rows.map(formatRecipe));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// POST /api/favorites  { recipe_id }
// Ajoute une recette aux favoris. Idempotent (UNIQUE user_id+recipe_id en DB).
const addFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { recipe_id: recipeId } = req.body;
    if (!recipeId) {
      return res.status(400).json({ error: "recipe_id est requis" });
    }

    const [recipeRows] = await pool.query(
      "SELECT id FROM recipes WHERE id = ?",
      [recipeId]
    );
    if (recipeRows.length === 0) {
      return res.status(404).json({ error: "Recette introuvable" });
    }

    await pool.query(
      `INSERT INTO favorites (user_id, recipe_id)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE user_id = user_id`,
      [userId, recipeId]
    );

    res.status(201).json({ user_id: userId, recipe_id: Number(recipeId), favorite: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// DELETE /api/favorites/:recipeId
const removeFavorite = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user.id;

    await pool.query(
      "DELETE FROM favorites WHERE user_id = ? AND recipe_id = ?",
      [userId, recipeId]
    );

    res.json({ user_id: userId, recipe_id: Number(recipeId), favorite: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

module.exports = { getFavorites, addFavorite, removeFavorite };