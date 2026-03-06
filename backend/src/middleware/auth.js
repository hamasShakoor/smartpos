const jwt = require('jsonwebtoken');
const SECRET = 'smartpos_secret_key_2024';

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = { auth, SECRET };
