const mongoose = require('mongoose');
const env = require('./env');

/**
 * Conexión cacheada en el scope global: en serverless cada invocación "en caliente"
 * reutiliza la conexión existente en lugar de abrir una nueva.
 */
let cached = global._mongoose;
if (!cached) cached = global._mongoose = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    mongoose.set('strictQuery', true);
    cached.promise = mongoose
      .connect(env.MONGODB_URI, { bufferCommands: false, serverSelectionTimeoutMS: 10000 })
      .then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null; // permite reintentar en la próxima invocación
    throw err;
  }
  return cached.conn;
}

module.exports = connectDB;
