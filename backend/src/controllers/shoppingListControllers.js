const pool = require("../database");

// NOTE: en attendant l'auth, group_id/added_by sont passés explicitement par
// le client (query pour GET, body pour POST). Quand l'auth sera en place,
// remplacer req.query.group_id / req.body.added_by par req.user.group_id / req.user.id.

// GET /api/shopping-list?group_id=1
const getShoppingList = async (req, res) => {
  try {
    const groupId = req.query.group_id;
    if (!groupId) {
      return res.status(400).json({ error: "group_id est requis" });
    }

    const [rows] = await pool.query(
      `SELECT * FROM shopping_list_items
       WHERE group_id = ?
       ORDER BY is_checked ASC, created_at DESC`,
      [groupId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// POST /api/shopping-list  { group_id, added_by, label }
const addItem = async (req, res) => {
  try {
    const { group_id: groupId, added_by: addedBy, label } = req.body;
    if (!groupId || !label?.trim()) {
      return res.status(400).json({ error: "group_id et label sont requis" });
    }

    const [result] = await pool.query(
      `INSERT INTO shopping_list_items (group_id, added_by, label)
       VALUES (?, ?, ?)`,
      [groupId, addedBy ?? null, label.trim()]
    );

    const [rows] = await pool.query(
      "SELECT * FROM shopping_list_items WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// POST /api/shopping-list/from-recipe  { group_id, added_by, recipe_id }
// Éclate les ingrédients d'une recette (stockés en texte, un par ligne) et
// les insère chacun comme article séparé dans la liste de courses du groupe.
const addFromRecipe = async (req, res) => {
  try {
    const { group_id: groupId, added_by: addedBy, recipe_id: recipeId } = req.body;
    if (!groupId || !recipeId) {
      return res.status(400).json({ error: "group_id et recipe_id sont requis" });
    }

    const [recipeRows] = await pool.query(
      "SELECT ingredients FROM recipes WHERE id = ?",
      [recipeId]
    );
    if (recipeRows.length === 0) {
      return res.status(404).json({ error: "Recette introuvable" });
    }

    const ingredients = recipeRows[0].ingredients
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (ingredients.length === 0) {
      return res.status(400).json({ error: "Cette recette n'a aucun ingrédient" });
    }

    const values = ingredients.map((label) => [groupId, addedBy ?? null, label]);
    await pool.query(
      "INSERT INTO shopping_list_items (group_id, added_by, label) VALUES ?",
      [values]
    );

    const [rows] = await pool.query(
      `SELECT * FROM shopping_list_items
       WHERE group_id = ?
       ORDER BY is_checked ASC, created_at DESC`,
      [groupId]
    );

    res.status(201).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// PATCH /api/shopping-list/:id  { is_checked }
const toggleItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_checked: isChecked } = req.body;

    const [result] = await pool.query(
      "UPDATE shopping_list_items SET is_checked = ? WHERE id = ?",
      [isChecked, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Élément introuvable" });
    }

    const [rows] = await pool.query(
      "SELECT * FROM shopping_list_items WHERE id = ?",
      [id]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// DELETE /api/shopping-list/:id
const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      "DELETE FROM shopping_list_items WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Élément introuvable" });
    }

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// DELETE /api/shopping-list?group_id=1
// Vide entièrement la liste de courses du groupe.
const clearList = async (req, res) => {
  try {
    const groupId = req.query.group_id;
    if (!groupId) {
      return res.status(400).json({ error: "group_id est requis" });
    }

    await pool.query("DELETE FROM shopping_list_items WHERE group_id = ?", [
      groupId,
    ]);

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

module.exports = {
  getShoppingList,
  addItem,
  addFromRecipe,
  toggleItem,
  deleteItem,
  clearList,
};