// db.js
const { Pool } = require('pg')
require('dotenv').config() // sadece local içindir; Render'da önemli değil

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('[DB] DATABASE_URL is not set!')
  // Prod ortamında DB yoksa devam etmenin anlamı yok:
  // process.exit(1)
}

console.log(
  '[DB] Connecting to:',
  connectionString?.replace(/(\/\/.*:)([^@]+)@/, '$1*****@')
)

const pool = new Pool({
  connectionString,
  ssl: {
    require: true,          // Supabase TLS istiyor
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
