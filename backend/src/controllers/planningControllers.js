const pool = require("../database");

// L'auth est en place : group_id/added_by viennent du JWT (req.user), posé
// par authMiddleware. On ne fait plus confiance à un group_id envoyé par le
// client : sinon n'importe quel utilisateur authentifié pourrait lire ou
// modifier le planning d'un autre groupe en changeant juste la query/body.

// GET /api/planning
// Renvoie tous les créneaux (jour + repas) du groupe de l'utilisateur
// connecté, avec les infos de la recette jointe pour affichage direct dans
// la grille.
const getPlanning = async (req, res) => {
  try {
    const groupId = req.user.groupId;

    const [rows] = await pool.query(
      `SELECT
         planning_items.id,
         planning_items.day,
         planning_items.meal,
         planning_items.added_by,
         planning_items.created_at,
         recipes.id AS recipe_id,
         recipes.title AS recipe_title,
         recipes.image_url AS recipe_image
       FROM planning_items
       JOIN recipes ON recipes.id = planning_items.recipe_id
       WHERE planning_items.group_id = ?`,
      [groupId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// POST /api/planning  { recipe_id, day, meal }
// Un seul plat par créneau (groupe + jour + repas) : si le créneau est déjà
// occupé, la recette est remplacée plutôt que dupliquée.
const setPlanningItem = async (req, res) => {
  try {
    const groupId = req.user.groupId;
    const addedBy = req.user.id;
    const { recipe_id: recipeId, day, meal } = req.body;

    if (!recipeId || !day || !meal) {
      return res
        .status(400)
        .json({ error: "recipe_id, day et meal sont requis" });
    }

    await pool.query(
      `INSERT INTO planning_items (group_id, recipe_id, added_by, day, meal)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         recipe_id = VALUES(recipe_id),
         added_by = VALUES(added_by)`,
      [groupId, recipeId, addedBy, day, meal]
    );

    const [rows] = await pool.query(
      `SELECT
         planning_items.id,
         planning_items.day,
         planning_items.meal,
         planning_items.added_by,
         planning_items.created_at,
         recipes.id AS recipe_id,
         recipes.title AS recipe_title,
         recipes.image_url AS recipe_image
       FROM planning_items
       JOIN recipes ON recipes.id = planning_items.recipe_id
       WHERE planning_items.group_id = ? AND planning_items.day = ? AND planning_items.meal = ?`,
      [groupId, day, meal]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// DELETE /api/planning/:id
// Le créneau doit appartenir au groupe de l'utilisateur connecté.
const deletePlanningItem = async (req, res) => {
  try {
    const { id } = req.params;
    const groupId = req.user.groupId;

    const [result] = await pool.query(
      "DELETE FROM planning_items WHERE id = ? AND group_id = ?",
      [id, groupId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Créneau introuvable" });
    }

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// DELETE /api/planning
// Vide entièrement le planning du groupe de l'utilisateur connecté.
const clearPlanning = async (req, res) => {
  try {
    const groupId = req.user.groupId;

    await pool.query("DELETE FROM planning_items WHERE group_id = ?", [
      groupId,
    ]);

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

module.exports = {
  getPlanning,
  setPlanningItem,
  deletePlanningItem,
  clearPlanning,
};