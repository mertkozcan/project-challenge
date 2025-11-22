// db.js
const { Pool } = require('pg')

// .env sadece local için, Render'da zaten dashboard'dan geliyor
require('dotenv').config()

const connectionString =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}` +
  `@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`

// log'da host/port'u gör, şifre maskelenmiş olsun:
console.log(
  '[DB] Connecting to:',
  connectionString?.replace(/(\/\/.*:)([^@]+)@/, '$1*****@')
)

const pool = new Pool({
  connectionString,
  ssl: {
    require: true,           // Supabase TLS istiyor
    rejectUnauthorized: false,
  },
})

pool.connect((err) => {
  if (err) {
    console.error('Database connection error:', err)
  } else {
    console.log('Connected to PostgreSQL')
  }
})

module.exports = pool
