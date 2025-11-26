const userModel = require('../models/loginModel'); // Model dosyanızı buraya göre ayarlayın

const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'your_jwt_secret',
    { expiresIn: '24h' }
  );
};

// Kullanıcı kayıt işlemi
const registerUser = async (req, res) => {
  const { username, email, password, avatar_url } = req.body;

  try {
    const user = await userModel.signUp(username, email, password, avatar_url);
    const token = generateToken({ ...user, role: 'user' }); // Default role

    res.status(201).json({
      message: 'User created successfully',
      user,
      token
    });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// Kullanıcı giriş işlemi
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await userModel.signIn(username, password);
    const token = generateToken(user);

    res.status(200).json({
      message: 'Login successful',
      user,
      token
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(401).json({ error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
