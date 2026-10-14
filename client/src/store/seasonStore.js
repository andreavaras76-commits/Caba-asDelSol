import { create } from 'zustand';

/**
 * Ya no hay selector Verano / Invierno: el sitio usa siempre la versión de verano
 * de las ilustraciones. Se mantiene el store para los componentes que lo leen.
 */
export const useSeasonStore = create(() => ({ season: 'verano' }));
