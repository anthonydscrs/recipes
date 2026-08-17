const express = require("express");
const {
  getComments,
  addComment,
  deleteComment,
} = require("../controllers/commentsControllers");

const router = express.Router();

router.get("/:recipeId", getComments);
router.post("/:recipeId", addComment);
router.delete("/:commentId", deleteComment);

module.exports = router;