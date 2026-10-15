const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const COOKIE_NAME = 'cds_session';
const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

const cookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/api',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

const readToken = (req) => {
  if (req.cookies?.[COOKIE_NAME]) return { token: req.cookies[COOKIE_NAME], fromCookie: true };
  const header = req.headers.authorization || '';
  return { token: header.startsWith('Bearer ') ? header.slice(7) : null, fromCookie: false };
};

async function userFromRequest(req) {
  const { token, fromCookie } = readToken(req);
  if (!token) return { user: null, fromCookie };
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(payload.id);
    const stale = user?.passwordChangedAt && payload.iat * 1000 < user.passwordChangedAt.getTime();
    if (stale) return { user: null, fromCookie, expired: true };
    return { user: user && user.active ? user : null, fromCookie, expired: false };
  } catch {
    return { user: null, fromCookie, expired: true };
  }
}

const protect = asyncHandler(async (req, res, next) => {
  const { user, fromCookie, expired } = await userFromRequest(req);
  if (!user) throw ApiError.unauthorized(expired ? 'Tu sesión expiró. Volvé a iniciar sesión.' : 'Iniciá sesión para continuar');

  if (fromCookie && !SAFE_METHODS.includes(req.method) && req.get('X-Requested-With') !== 'XMLHttpRequest') {
    throw ApiError.forbidden('Solicitud no permitida');
  }

  req.user = user;
  next();
});

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return next(ApiError.forbidden());
  next();
};

const signToken = (user) => jwt.sign({ id: user._id, role: user.role }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

module.exports = { protect, authorize, signToken, userFromRequest, cookieOptions, COOKIE_NAME };
