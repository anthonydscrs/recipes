const pool = require("../database");

// L'auth est en place : group_id/added_by viennent du JWT (req.user), posé
// par authMiddleware. On ne fait plus confiance à un group_id envoyé par le
// client : sinon n'importe quel utilisateur authentifié pourrait lire ou
// modifier la liste de courses d'un autre groupe en changeant juste la
// query/body. Les routes par :id vérifient aussi que l'item appartient bien
// au groupe de l'utilisateur avant de le modifier/supprimer.

// GET /api/shopping-list
const getShoppingList = async (req, res) => {
  try {
    const groupId = req.user.groupId;

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

// POST /api/shopping-list  { label }
const addItem = async (req, res) => {
  try {
    const groupId = req.user.groupId;
    const addedBy = req.user.id;
    const { label } = req.body;
    if (!label?.trim()) {
      return res.status(400).json({ error: "label est requis" });
    }

    const [result] = await pool.query(
      `INSERT INTO shopping_list_items (group_id, added_by, label)
       VALUES (?, ?, ?)`,
      [groupId, addedBy, label.trim()]
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

// POST /api/shopping-list/from-recipe  { recipe_id }
// Éclate les ingrédients d'une recette (stockés en texte, un par ligne) et
// les insère chacun comme article séparé dans la liste de courses du groupe.
const addFromRecipe = async (req, res) => {
  try {
    const groupId = req.user.groupId;
    const addedBy = req.user.id;
    const { recipe_id: recipeId } = req.body;
    if (!recipeId) {
      return res.status(400).json({ error: "recipe_id est requis" });
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

    const values = ingredients.map((label) => [groupId, addedBy, label]);
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
    const groupId = req.user.groupId;
    const { is_checked: isChecked } = req.body;

    const [result] = await pool.query(
      "UPDATE shopping_list_items SET is_checked = ? WHERE id = ? AND group_id = ?",
      [isChecked, id, groupId]
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
    const groupId = req.user.groupId;

    const [result] = await pool.query(
      "DELETE FROM shopping_list_items WHERE id = ? AND group_id = ?",
      [id, groupId]
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

// DELETE /api/shopping-list
// Vide entièrement la liste de courses du groupe de l'utilisateur connecté.
const clearList = async (req, res) => {
  try {
    const groupId = req.user.groupId;

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