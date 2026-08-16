const express = require('express')
const authService = require('../services/auth')

const router = express.Router()

router.post('/login', async (req, res) => {
  try {
    const { pseudo, password } = req.body

    if (!pseudo || !password) {
      return res.status(400).json({
        error:
          'Pseudo et mot de passe obligatoires',
      })
    }

    const result =
      await authService.login(
        pseudo,
        password
      )

    return res.status(200).json(result)
  } catch (error) {
    console.error(
      'Erreur login :',
      error.message
    )

    return res.status(401).json({
      error: 'Identifiants incorrects',
    })
  }
})

module.exports = router