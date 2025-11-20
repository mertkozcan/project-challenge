const pool = require('../config/db');
const bcrypt = require('bcrypt');

// Kullanıcı kayıt fonksiyonu
const signUp = async (username, email, password, avatar_url) => {
  try {
    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Veritabanına kaydet
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, avatar_url) 
       VALUES ($1, $2, $3, $4) RETURNING id, username, email, avatar_url, created_at`,
      [username, email, hashedPassword, avatar_url]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error creating user:', error.message);
    throw error;
  }
};

// Kullanıcı giriş fonksiyonu
const signIn = async (username, password) => {
  try {
    // Kullanıcıyı bul
    const result = await pool.query(
      `SELECT * FROM users WHERE username = $1`,
      [username]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid username/password');
    }

    const user = result.rows[0];

    // Şifreyi doğrula
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new Error('Invalid username/password');
    }

    // Kullanıcı bilgilerini dön
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar_url: user.avatar_url,
      role: user.role,
    };
  } catch (error) {
    console.error('Error during user sign-in:', error.message);
    throw error;
  }
};

module.exports = { signUp, signIn };