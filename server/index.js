const app = require('./src/app');
const env = require('./src/config/env');
const connectDB = require('./src/config/db');

if (!process.env.VERCEL) {
  connectDB()
    .then(() => {
      app.listen(env.PORT, () => console.log(`☀️  API de Cabañas del Sol en http://localhost:${env.PORT}`));
    })
    .catch((err) => {
      console.error('No se pudo conectar a MongoDB:', err.message);
      process.exit(1);
    });
}

module.exports = app;
