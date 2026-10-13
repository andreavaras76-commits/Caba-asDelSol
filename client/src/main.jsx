// Primero de todo: endurecimiento en producción (antes de que cargue React)
import './security/hardening';
// Detecta el shell del hero antes de que React lo reemplace
import './utils/shell';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { MotionConfig } from 'framer-motion';
import App from './App.jsx';
import ErrorBoundary from './components/ui/ErrorBoundary';
// Fuentes autoalojadas: Fraunces (con eje óptico), Manrope y Caveat
import '@fontsource-variable/fraunces/opsz.css';
import '@fontsource-variable/manrope/index.css';
import '@fontsource/caveat/500.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          {/* reducedMotion="user" hace que Framer Motion respete prefers-reduced-motion */}
          <MotionConfig reducedMotion="user">
            <App />
          </MotionConfig>
        </BrowserRouter>
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
