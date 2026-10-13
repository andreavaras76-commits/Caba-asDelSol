const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const env = require('./config/env');
const connectDB = require('./config/db');
const routes = require('./routes');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.set('trust proxy', 1); // necesario detrás del proxy de Vercel para el rate limit
app.disable('x-powered-by');
// Query strings planos: ?a[$ne]=x NO se convierte en objeto (evita inyección de operadores de Mongo)
app.set('query parser', 'simple');

app.use(helmet());
app.use(
  cors({
    origin(origin, cb) {
      // Permite herramientas sin origin (curl, healthchecks) y los orígenes configurados
      if (!origin || env.CORS_ORIGINS.includes(origin)) return cb(null, true);
      return cb(new Error('Origen no permitido por CORS'));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// Healthcheck sin tocar la base
app.get('/api/health', (req, res) => {
  res.json({ ok: true, data: { status: 'up', env: env.NODE_ENV }, message: 'API de Cabañas del Sol funcionando' });
});

// Asegura la conexión (cacheada) antes de cada request: clave en serverless
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
