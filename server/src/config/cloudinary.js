const cloudinary = require('cloudinary').v2;
const env = require('./env');

cloudinary.config({
  cloud_name: env.CLOUDINARY.cloud_name,
  api_key: env.CLOUDINARY.api_key,
  api_secret: env.CLOUDINARY.api_secret,
  secure: true,
});

module.exports = cloudinary;
