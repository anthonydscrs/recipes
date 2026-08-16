const express = require("express");
const {
  getRating,
  setRating,
  deleteRating,
} = require("../controllers/ratingsControllers");

const router = express.Router();

router.get("/:recipeId", getRating);
router.put("/:recipeId", setRating);
router.delete("/:recipeId", deleteRating);

module.exports = router;