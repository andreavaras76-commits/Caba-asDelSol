import { Component } from 'react';
import SunLogo from './SunLogo';

/**
 * Si un componente falla al renderizar, mostramos una pantalla amable
 * en lugar de dejar la página en blanco (y sin exponer detalles técnicos).
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-crema px-4 text-center">
        <SunLogo className="h-16 w-16" />
        <h1 className="text-4xl font-semibold text-cerro-profundo">Algo no salió como esperábamos</h1>
        <p className="max-w-md text-carbon-light">Recargá la página. Si sigue pasando, escribinos por WhatsApp y te ayudamos.</p>
        <button type="button" className="btn-sol" onClick={() => window.location.reload()}>
          Recargar
        </button>
      </main>
    );
  }
}
