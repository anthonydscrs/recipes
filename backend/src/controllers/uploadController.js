const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Aucune image reçue" });
  }

  res.status(201).json({ image_url: req.file.path });
};

module.exports = { uploadImage };