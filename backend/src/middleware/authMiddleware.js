const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({
        error: 'Token manquant',
      })
    }

    const [type, token] = authHeader.split(' ')

    if (type !== 'Bearer' || !token) {
      return res.status(401).json({
        error: 'Format du token invalide',
      })
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    )

    req.user = decoded

    next()
  } catch (error) {
    console.error(
      'Erreur authentification :',
      error.message
    )

    return res.status(401).json({
      error: 'Token invalide ou expiré',
    })
  }
}

module.exports = authMiddleware