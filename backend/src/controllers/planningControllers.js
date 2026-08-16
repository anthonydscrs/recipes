const pool = require("../database");

// NOTE: en attendant l'auth, group_id/added_by sont passés explicitement par
// le client (query pour GET, body pour POST). Quand l'auth sera en place,
// remplacer req.query.group_id / req.body.added_by par req.user.group_id / req.user.id.

// GET /api/planning?group_id=1
// Renvoie tous les créneaux (jour + repas) du groupe, avec les infos de la
// recette jointe pour affichage direct dans la grille.
const getPlanning = async (req, res) => {
  try {
    const groupId = req.query.group_id;
    if (!groupId) {
      return res.status(400).json({ error: "group_id est requis" });
    }

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

// POST /api/planning  { group_id, added_by, recipe_id, day, meal }
// Un seul plat par créneau (groupe + jour + repas) : si le créneau est déjà
// occupé, la recette est remplacée plutôt que dupliquée.
const setPlanningItem = async (req, res) => {
  try {
    const {
      group_id: groupId,
      added_by: addedBy,
      recipe_id: recipeId,
      day,
      meal,
    } = req.body;

    if (!groupId || !recipeId || !day || !meal) {
      return res
        .status(400)
        .json({ error: "group_id, recipe_id, day et meal sont requis" });
    }

    await pool.query(
      `INSERT INTO planning_items (group_id, recipe_id, added_by, day, meal)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         recipe_id = VALUES(recipe_id),
         added_by = VALUES(added_by)`,
      [groupId, recipeId, addedBy ?? null, day, meal]
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
const deletePlanningItem = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      "DELETE FROM planning_items WHERE id = ?",
      [id]
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

// DELETE /api/planning?group_id=1
// Vide entièrement le planning du groupe.
const clearPlanning = async (req, res) => {
  try {
    const groupId = req.query.group_id;
    if (!groupId) {
      return res.status(400).json({ error: "group_id est requis" });
    }

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