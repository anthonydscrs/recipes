const pool = require("../database");

// Commentaires libres sous une recette, visibles par tout le groupe.
// Un utilisateur ne peut lire/écrire que sur les recettes de son propre
// groupe (req.user.groupId, jamais une valeur envoyée par le client),
// et ne peut supprimer que ses propres commentaires.

const MAX_LENGTH = 1000;

const recipeExistsInGroup = async (recipeId, groupId) => {
  const [rows] = await pool.query(
    "SELECT id FROM recipes WHERE id = ? AND group_id = ?",
    [recipeId, groupId]
  );
  return rows.length > 0;
};

// GET /api/comments/:recipeId
// Renvoie tous les commentaires de la recette, du plus ancien au plus récent.
const getComments = async (req, res) => {
  try {
    const groupId = req.user.groupId;
    const { recipeId } = req.params;

    if (!(await recipeExistsInGroup(recipeId, groupId))) {
      return res.status(404).json({ error: "Recette introuvable" });
    }

    const [rows] = await pool.query(
      `SELECT c.id, c.recipe_id, c.user_id, c.content, c.created_at, u.pseudo
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.recipe_id = ?
       ORDER BY c.created_at ASC`,
      [recipeId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// POST /api/comments/:recipeId  { content }
// Ajoute un commentaire de l'utilisateur connecté sur cette recette.
const addComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const groupId = req.user.groupId;
    const { recipeId } = req.params;
    const { content } = req.body;

    const trimmed = typeof content === "string" ? content.trim() : "";

    if (!trimmed) {
      return res.status(400).json({ error: "Le commentaire est vide" });
    }

    if (trimmed.length > MAX_LENGTH) {
      return res.status(400).json({
        error: `Le commentaire dépasse ${MAX_LENGTH} caractères`,
      });
    }

    if (!(await recipeExistsInGroup(recipeId, groupId))) {
      return res.status(404).json({ error: "Recette introuvable" });
    }

    const [result] = await pool.query(
      `INSERT INTO comments (recipe_id, user_id, content)
       VALUES (?, ?, ?)`,
      [recipeId, userId, trimmed]
    );

    const [rows] = await pool.query(
      `SELECT c.id, c.recipe_id, c.user_id, c.content, c.created_at, u.pseudo
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.id = ?`,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// DELETE /api/comments/:commentId
// Supprime un commentaire, uniquement si l'utilisateur connecté en est l'auteur.
const deleteComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const groupId = req.user.groupId;
    const { commentId } = req.params;

    const [rows] = await pool.query(
      `SELECT c.id, c.user_id
       FROM comments c
       JOIN recipes r ON r.id = c.recipe_id
       WHERE c.id = ? AND r.group_id = ?`,
      [commentId, groupId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Commentaire introuvable" });
    }

    if (rows[0].user_id !== userId) {
      return res.status(403).json({
        error: "Vous ne pouvez supprimer que vos propres commentaires",
      });
    }

    await pool.query("DELETE FROM comments WHERE id = ?", [commentId]);

    res.status(200).json({ id: Number(commentId), deleted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

module.exports = { getComments, addComment, deleteComment };