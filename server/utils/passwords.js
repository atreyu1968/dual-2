import bcrypt from 'bcryptjs';

export const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

export const comparePasswords = async (password, hash) => {
  return bcrypt.compare(password, hash);
};