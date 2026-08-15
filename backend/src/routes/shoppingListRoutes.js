const express = require("express");
const {
  getShoppingList,
  addItem,
  addFromRecipe,
  toggleItem,
  deleteItem,
  clearList,
} = require("../controllers/shoppingListControllers");

const router = express.Router();

router.get("/", getShoppingList);
router.post("/", addItem);
router.post("/from-recipe", addFromRecipe);
router.patch("/:id", toggleItem);
router.delete("/:id", deleteItem);
router.delete("/", clearList);

module.exports = router;