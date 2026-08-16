const express = require("express");
const {
  getPlanning,
  setPlanningItem,
  deletePlanningItem,
  clearPlanning,
} = require("../controllers/planningControllers");

const router = express.Router();

router.get("/", getPlanning);
router.post("/", setPlanningItem);
router.delete("/:id", deletePlanningItem);
router.delete("/", clearPlanning);

module.exports = router;