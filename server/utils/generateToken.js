import jwt from 'jsonwebtoken';
import env from '../config/env.js';

// Centralizes JWT creation so the payload shape and signing options only
// need to change in one place - e.g. if a later step adds a `role` claim
// for admin-only problem management.
const generateToken = (userId) => jwt.sign({ id: userId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

export default generateToken;
