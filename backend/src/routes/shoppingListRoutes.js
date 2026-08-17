const express = require("express");
const {
  getShoppingList,
  addItem,
  addFromRecipe,
  addFromPlanning,
  toggleItem,
  deleteItem,
  clearList,
} = require("../controllers/shoppingListControllers");

const router = express.Router();

router.get("/", getShoppingList);
router.post("/", addItem);
router.post("/from-recipe", addFromRecipe);
router.post("/from-planning", addFromPlanning);
router.patch("/:id", toggleItem);
router.delete("/:id", deleteItem);
router.delete("/", clearList);

module.exports = router;