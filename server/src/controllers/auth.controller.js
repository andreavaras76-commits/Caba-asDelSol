const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const { signToken, userFromRequest, cookieOptions, COOKIE_NAME } = require('../middlewares/auth');

exports.login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username }).select('+password');

  if (!user || !(await user.comparePassword(password))) throw ApiError.unauthorized('Usuario o contraseña incorrectos');
  if (!user.active) throw ApiError.forbidden('Tu usuario está desactivado. Hablá con el administrador.');

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  res.cookie(COOKIE_NAME, signToken(user), cookieOptions());
  success(res, { user: user.toJSON() }, `¡Hola, ${user.name}!`);
});

exports.me = asyncHandler(async (req, res) => success(res, req.user.toJSON()));

exports.session = asyncHandler(async (req, res) => {
  const { user, expired } = await userFromRequest(req);
  if (!user && expired) res.clearCookie(COOKIE_NAME, { ...cookieOptions(), maxAge: undefined });
  success(res, user ? user.toJSON() : null);
});

exports.logout = (req, res) => {
  res.clearCookie(COOKIE_NAME, { ...cookieOptions(), maxAge: undefined });
  success(res, null, 'Sesión cerrada');
};

exports.changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(req.body.currentPassword))) throw ApiError.badRequest('La contraseña actual no es correcta');
  user.password = req.body.newPassword;
  await user.save();
  res.cookie(COOKIE_NAME, signToken(user), cookieOptions());
  success(res, null, 'Contraseña actualizada');
});
