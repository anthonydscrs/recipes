const pool = require("../database");

// NOTE: en attendant l'auth, user_id est passé explicitement par le client
// (query pour GET/DELETE, body pour POST). Quand l'auth sera en place, il
// suffira d'ajouter un middleware qui lit le JWT et pose req.user = { id },
// puis de remplacer partout ci-dessous `req.query.user_id` / `req.body.user_id`
// par `req.user.id`. La signature des fonctions ne changera pas.

const formatRecipe = (r) => ({
  ...r,
  image: r.image_url,
  ingredients: r.ingredients.split("\n"),
  preparation: r.preparation.split("\n"),
});

// GET /api/favorites?user_id=1
// Renvoie la liste complète des recettes favorites de l'utilisateur.
const getFavorites = async (req, res) => {
  try {
    const userId = req.query.user_id;
    if (!userId) {
      return res.status(400).json({ error: "user_id est requis" });
    }

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

// POST /api/favorites  { user_id, recipe_id }
// Ajoute une recette aux favoris. Idempotent (UNIQUE user_id+recipe_id en DB).
const addFavorite = async (req, res) => {
  try {
    const { user_id: userId, recipe_id: recipeId } = req.body;
    if (!userId || !recipeId) {
      return res.status(400).json({ error: "user_id et recipe_id sont requis" });
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

    res.status(201).json({ user_id: Number(userId), recipe_id: Number(recipeId), favorite: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// DELETE /api/favorites/:recipeId?user_id=1
const removeFavorite = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.query.user_id;
    if (!userId) {
      return res.status(400).json({ error: "user_id est requis" });
    }

    await pool.query(
      "DELETE FROM favorites WHERE user_id = ? AND recipe_id = ?",
      [userId, recipeId]
    );

    res.json({ user_id: Number(userId), recipe_id: Number(recipeId), favorite: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

module.exports = { getFavorites, addFavorite, removeFavorite };