const pool = require("../database");

const formatRecipe = (r) => ({
  ...r,
  image: r.image_url,
  ingredients: r.ingredients.split("\n"),
  preparation: r.preparation.split("\n"),
});

const getAllRecipes = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM recipes");
    res.json(rows.map(formatRecipe));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

const getRecipeById = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM recipes WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Recette introuvable" });
    }
    res.json(formatRecipe(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

const createRecipe = async (req, res) => {
  try {
    const {
      group_id,
      created_by,
      title,
      description,
      image_url,
      category,
      season,
      ingredients,
      preparation,
    } = req.body;

    // validation minimale
    if (!group_id || !title || !category || !season || !ingredients || !preparation) {
      return res.status(400).json({
        error: "group_id, title, category, season, ingredients et preparation sont requis",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO recipes
        (group_id, created_by, title, description, image_url, category, season, ingredients, preparation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        group_id,
        created_by,
        title,
        description,
        image_url,
        category,
        season,
        Array.isArray(ingredients) ? ingredients.join("\n") : ingredients,
        Array.isArray(preparation) ? preparation.join("\n") : preparation,
      ]
    );

    const [rows] = await pool.query("SELECT * FROM recipes WHERE id = ?", [
      result.insertId,
    ]);

    res.status(201).json(formatRecipe(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

const updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      image_url,
      category,
      season,
      ingredients,
      preparation,
    } = req.body;

    // validation minimale
    if (!title || !category || !season || !ingredients || !preparation) {
      return res.status(400).json({
        error: "title, category, season, ingredients et preparation sont requis",
      });
    }

    const [result] = await pool.query(
      `UPDATE recipes
       SET title = ?, description = ?, image_url = ?, category = ?, season = ?, ingredients = ?, preparation = ?
       WHERE id = ?`,
      [
        title,
        description ?? null,
        image_url ?? null,
        category,
        season,
        Array.isArray(ingredients) ? ingredients.join("\n") : ingredients,
        Array.isArray(preparation) ? preparation.join("\n") : preparation,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Recette introuvable" });
    }

    const [rows] = await pool.query("SELECT * FROM recipes WHERE id = ?", [
      id,
    ]);

    res.json(formatRecipe(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

const deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query("DELETE FROM recipes WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Recette introuvable" });
    }

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

module.exports = {
  getAllRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
};