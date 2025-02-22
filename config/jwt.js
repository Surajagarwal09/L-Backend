const jwt = require('jsonwebtoken');

const generateToken = ({ id, userType, fullname }) => {
  return jwt.sign({ id, userType, fullname}, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = generateToken;