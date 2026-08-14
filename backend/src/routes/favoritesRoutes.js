const express = require("express");
const {
  getFavorites,
  addFavorite,
  removeFavorite,
} = require("../controllers/favoritesControllers");

const router = express.Router();

router.get("/", getFavorites);
router.post("/", addFavorite);
router.delete("/:recipeId", removeFavorite);

module.exports = router;