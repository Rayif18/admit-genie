import jwt from 'jsonwebtoken';

// Generate JWT token for user
export const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Generate JWT token for admin
export const generateAdminToken = (adminId) => {
  return jwt.sign(
    { adminId, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

