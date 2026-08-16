const pool = require("../database");

// Notes en étoiles (1 à 5), une par utilisateur et par recette. Scopées sur
// req.user.id (JWT), jamais sur une valeur envoyée par le client. On vérifie
// aussi que la recette appartient bien au groupe de l'utilisateur avant de
// lire/écrire une note dessus.

const getAggregate = async (recipeId) => {
  const [rows] = await pool.query(
    `SELECT
       COALESCE(AVG(value), 0) AS average,
       COUNT(*) AS count
     FROM ratings
     WHERE recipe_id = ?`,
    [recipeId]
  );

  return {
    average: Number(rows[0].average),
    count: rows[0].count,
  };
};

const recipeExistsInGroup = async (recipeId, groupId) => {
  const [rows] = await pool.query(
    "SELECT id FROM recipes WHERE id = ? AND group_id = ?",
    [recipeId, groupId]
  );
  return rows.length > 0;
};

// GET /api/ratings/:recipeId
// Renvoie la note personnelle de l'utilisateur connecté sur cette recette
// (null s'il n'a pas encore noté), ainsi que la moyenne du groupe.
const getRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const groupId = req.user.groupId;
    const { recipeId } = req.params;

    if (!(await recipeExistsInGroup(recipeId, groupId))) {
      return res.status(404).json({ error: "Recette introuvable" });
    }

    const [rows] = await pool.query(
      "SELECT value FROM ratings WHERE user_id = ? AND recipe_id = ?",
      [userId, recipeId]
    );

    const aggregate = await getAggregate(recipeId);

    res.json({
      value: rows[0]?.value ?? null,
      ...aggregate,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// PUT /api/ratings/:recipeId  { value }
// Pose ou met à jour la note de l'utilisateur connecté sur cette recette.
const setRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const groupId = req.user.groupId;
    const { recipeId } = req.params;
    const { value } = req.body;

    const numericValue = Number(value);
    if (
      !Number.isInteger(numericValue) ||
      numericValue < 1 ||
      numericValue > 5
    ) {
      return res
        .status(400)
        .json({ error: "value doit être un entier entre 1 et 5" });
    }

    if (!(await recipeExistsInGroup(recipeId, groupId))) {
      return res.status(404).json({ error: "Recette introuvable" });
    }

    await pool.query(
      `INSERT INTO ratings (user_id, recipe_id, value)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE value = VALUES(value)`,
      [userId, recipeId, numericValue]
    );

    const aggregate = await getAggregate(recipeId);

    res.status(200).json({
      value: numericValue,
      ...aggregate,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// DELETE /api/ratings/:recipeId
// Retire la note de l'utilisateur connecté sur cette recette.
const deleteRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const groupId = req.user.groupId;
    const { recipeId } = req.params;

    if (!(await recipeExistsInGroup(recipeId, groupId))) {
      return res.status(404).json({ error: "Recette introuvable" });
    }

    await pool.query(
      "DELETE FROM ratings WHERE user_id = ? AND recipe_id = ?",
      [userId, recipeId]
    );

    const aggregate = await getAggregate(recipeId);

    res.status(200).json({
      value: null,
      ...aggregate,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

module.exports = { getRating, setRating, deleteRating };