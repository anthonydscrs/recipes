const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const pool = require('../database')

const login = async (pseudo, password) => {
  const [rows] = await pool.query(
    `
      SELECT
        id,
        pseudo,
        password_hash,
        group_id
      FROM users
      WHERE pseudo = ?
    `,
    [pseudo]
  )

  if (rows.length === 0) {
    throw new Error(
      'Identifiants incorrects'
    )
  }

  const user = rows[0]

  const passwordIsValid =
    await bcrypt.compare(
      password,
      user.password_hash
    )

  if (!passwordIsValid) {
    throw new Error(
      'Identifiants incorrects'
    )
  }

  const token = jwt.sign(
    {
      id: user.id,
      pseudo: user.pseudo,
      groupId: user.group_id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_TIMING || '7d',
    }
  )

  return {
    token,

    user: {
      id: user.id,
      pseudo: user.pseudo,
      groupId: user.group_id,
    },
  }
}

module.exports = {
  login,
}