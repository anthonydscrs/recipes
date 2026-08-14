const express = require("express");
const upload = require("../middleware/upload");
const { uploadImage } = require("../controllers/uploadController");

const router = express.Router();

// POST /api/upload — form-data avec un champ "image"
router.post("/", upload.single("image"), uploadImage);

module.exports = router;