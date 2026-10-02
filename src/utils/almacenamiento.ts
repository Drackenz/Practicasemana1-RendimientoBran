/**
 * Módulo de Persistencia Local (localStorage) y Respaldo para RENDIMIENTO.
 * 
 * Gestiona el guardado, lectura, borrado y exportación (CSV / JSON)
 * de la bitácora de cargas de combustible directamente en el dispositivo móvil.
 */

import { CargaCombustible } from '../types';

export const CLAVE_LOCALSTORAGE = 'rendimiento_cargas_combustible_v1';

/**
 * 3 cargas de ejemplo representativas para pruebas inmediatas:
 * - Carga 1 (Base): Tanque lleno inicial a 12,150 km.
 * - Carga 2: A 12,310 km (+160 km recorridos, 2.4 gal, $9.10) => 66.7 km/gal, $0.0569/km.
 * - Carga 3: A 12,520 km (+210 km recorridos, 3.0 gal, $11.40) => 70.0 km/gal, $0.0543/km.
 */
export const CARGAS_EJEMPLO_INICIALES: CargaCombustible[] = [
  {
    id: 'ejemplo_carga_1',
    fecha: '2026-08-10',
    kilometraje: 12150,
    galones: 2.0,
    monto: 7.80,
  },
  {
    id: 'ejemplo_carga_2',
    fecha: '2026-08-25',
    kilometraje: 12310,
    galones: 2.4,
    monto: 9.10,
  },
  {
    id: 'ejemplo_carga_3',
    fecha: '2026-09-12',
    kilometraje: 12520,
    galones: 3.0,
    monto: 11.40,
  },
];

/**
 * 1. LEER: Obtiene las cargas almacenadas en el navegador del dispositivo.
 * Si no existen registros previos, retorna las 3 cargas de ejemplo para que la app sea inmediatamente usable.
 */
export function obtenerCargas(): CargaCombustible[] {
  try {
    const datos = localStorage.getItem(CLAVE_LOCALSTORAGE);
    if (!datos) {
      // Primera vez que se abre la app: precargar ejemplos y guardar
      guardarCargas(CARGAS_EJEMPLO_INICIALES);
      return CARGAS_EJEMPLO_INICIALES;
    }
    const parseados = JSON.parse(datos);
    return Array.isArray(parseados) ? parseados : [];
  } catch (error) {
    console.error('Error al leer de localStorage:', error);
    return [];
  }
}

/**
 * 2. GUARDAR: Serializa la lista completa de cargas a texto JSON en el almacenamiento del cliente.
 */
export function guardarCargas(cargas: CargaCombustible[]): void {
  try {
    localStorage.setItem(CLAVE_LOCALSTORAGE, JSON.stringify(cargas));
  } catch (error) {
    console.error('Error al guardar en localStorage:', error);
  }
}

/**
 * 3. BORRAR UNA CARGA: Filtra la carga por ID y persiste el nuevo arreglo resultante.
 */
export function eliminarCarga(id: string): CargaCombustible[] {
  const actuales = obtenerCargas();
  const actualizadas = actuales.filter((c) => c.id !== id);
  guardarCargas(actualizadas);
  return actualizadas;
}

/**
 * 4. EXPORTAR A JSON: Descarga un archivo .json legible con toda la bitácora.
 */
export function exportarAJson(cargas: CargaCombustible[]): void {
  const jsonStr = JSON.stringify(cargas, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = `bitacora_rendimiento_${new Date().toISOString().split('T')[0]}.json`;
  enlace.click();
  URL.revokeObjectURL(url);
}

/**
 * 5. EXPORTAR A CSV: Descarga un archivo .csv compatible con Excel o Google Sheets.
 */
export function exportarACsv(cargas: CargaCombustible[]): void {
  const encabezados = ['ID', 'Fecha', 'Kilometraje (km)', 'Galones (gal)', 'Monto ($ USD)'];
  const filas = cargas.map((c) => [
    c.id,
    c.fecha,
    c.kilometraje,
    c.galones,
    c.monto.toFixed(2),
  ]);

  const contenidoCsv = [
    encabezados.join(','),
    ...filas.map((fila) => fila.join(',')),
  ].join('\n');

  const blob = new Blob([contenidoCsv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = `bitacora_rendimiento_${new Date().toISOString().split('T')[0]}.csv`;
  enlace.click();
  URL.revokeObjectURL(url);
}
