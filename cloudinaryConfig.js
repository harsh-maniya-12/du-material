// cloudinaryConfig.js (create this file)
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dew0t34zy', // Replace with your Cloudinary Cloud name
  api_key: '896481416854355',       // Replace with your Cloudinary API key
  api_secret: 'ftoWual0b-YyoLsoipHvdBweNsU', // Replace with your Cloudinary API secret
});

module.exports = cloudinary;
