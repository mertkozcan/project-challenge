const userModel = require('../models/loginModel'); // Model dosyanızı buraya göre ayarlayın

// Kullanıcı kayıt işlemi
const registerUser = async (req, res) => {
  const { username, email, password, avatar_url } = req.body;

  try {
    const user = await userModel.signUp(username, email, password, avatar_url);
    res.status(201).json({
      message: 'User created successfully',
      user,
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
    res.status(200).json({
      message: 'Login successful',
      user,
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
