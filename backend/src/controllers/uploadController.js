const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Aucune image reçue" });
  }

  // URL absolue, directement utilisable comme image_url pour une recette
  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

  res.status(201).json({ image_url: imageUrl });
};

module.exports = { uploadImage };