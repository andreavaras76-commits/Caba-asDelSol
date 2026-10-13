const { body } = require('express-validator');
const { LIMITS } = require('../utils/constants');

const passwordRule = (field, label = 'La contraseña') =>
  body(field)
    .isString()
    .isLength({ min: LIMITS.PASSWORD_MIN, max: 72 })
    .withMessage(`${label} debe tener entre ${LIMITS.PASSWORD_MIN} y 72 caracteres`)
    .bail()
    .matches(/[A-Za-z]/)
    .withMessage(`${label} debe incluir al menos una letra`)
    .matches(/\d/)
    .withMessage(`${label} debe incluir al menos un número`);

const login = [
  body('username').exists({ values: 'falsy' }).withMessage('Ingresá tu usuario').bail().isString().withMessage('Ingresá tu usuario').trim().customSanitizer((v) => v.normalize('NFC').toLowerCase()),
  body('password').exists({ values: 'falsy' }).withMessage('La contraseña es obligatoria').bail().isString().withMessage('La contraseña es obligatoria').isLength({ max: 200 }),
];

const changePassword = [
  body('currentPassword').exists({ values: 'falsy' }).withMessage('Ingresá tu contraseña actual').bail().isString().withMessage('Ingresá tu contraseña actual'),
  passwordRule('newPassword', 'La nueva contraseña'),
];

module.exports = { login, changePassword };
