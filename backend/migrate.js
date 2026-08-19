require('dotenv').config()

const fs = require('fs')
const mysql = require('mysql2/promise')

const migrate = async () => {
  const {
    DB_HOST,
    DB_PORT,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
  } = process.env

  let connection

  try {
    console.log(`Connexion à la base "${DB_NAME}"...`)

connection = await mysql.createConnection({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  multipleStatements: true,
  ssl: {
    minVersion: 'TLSv1.2',
    ca: fs.readFileSync('./ca.pem'),
  },
})

    // Lit database.sql
    const sql = fs.readFileSync('./database.sql', 'utf8')

    // Exécute tout le fichier
    // (CREATE TABLE IF NOT EXISTS + INSERT ... ON DUPLICATE KEY UPDATE
    // sont "safe" à rejouer plusieurs fois sans tout casser)
    await connection.query(sql)

    console.log('Migration terminée avec succès !')
  } catch (err) {
    console.error('Erreur pendant la migration :')
    console.error(err)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

migrate()