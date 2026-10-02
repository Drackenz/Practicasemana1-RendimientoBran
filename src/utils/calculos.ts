/**
 * Motor de cálculos de rendimiento según el método de Tanque Lleno.
 * 
 * ============================================================================
 * PUNTOS CRÍTICOS DONDE ALGUIEN SUELE EQUIVOCARSE:
 * ============================================================================
 * 
 * 1. MÉTODO DE TANQUE LLENO:
 *    - La primera carga de combustible (Carga 1) ÚNICAMENTE sirve para fijar
 *      el odómetro inicial de referencia. No se puede calcular rendimiento
 *      en la primera carga porque NO sabemos cuántos kilómetros rindió ese
 *      combustible hasta que volvemos a llenar el tanque.
 *    - En la segunda carga (Carga 2), los galones que cargamos son exactamente
 *      los que se consumieron para recorrer la distancia entre Carga 1 y Carga 2.
 * 
 * 2. CÁLCULO DE KM POR GALÓN (km/gal):
 *    - FÓRMULA CORRECTA: (kmActual - kmAnterior) / galonesActuales
 *    - ERROR COMÚN: Dividir entre los galones de la carga anterior. Eso es falso;
 *      el volumen repostado hoy es el que sustituye el combustible gastado.
 * 
 * 3. CÁLCULO DE COSTO POR KM ($/km):
 *    - FÓRMULA CORRECTA: montoActual / (kmActual - kmAnterior)
 *    - ERROR COMÚN A: Dividir montoActual / galonesActuales (eso da precio por galón, NO costo por km).
 *    - ERROR COMÚN B: Dividir (kmActual - kmAnterior) / montoActual (eso daría km por dólar).
 * 
 * 4. DIVISIÓN POR CERO Y KILOMETRAJE INVÁLIDO:
 *    - Si kmActual <= kmAnterior, la distancia es 0 o negativa. Si dividimos
 *      entre 0, JavaScript produce Infinity o NaN. Debe capturarse explícitamente.
 *    - Si galonesActuales <= 0, dividir produce Infinity. Debe validarse antes.
 * 
 * 5. ORDEN CRONOLÓGICO:
 *    - Si el usuario registra una carga pasada, no podemos comparar por orden
 *      de inserción. Siempre se debe ordenar por kilometraje ascendente o fecha.
 */

import { CargaCombustible, CargaCalculada, ResumenMensual } from '../types';

/**
 * Procesa la lista de cargas y calcula las métricas individuales de cada una.
 */
export function calcularRendimientoCargas(cargas: CargaCombustible[]): CargaCalculada[] {
  if (!cargas || cargas.length === 0) {
    return [];
  }

  // Ordenamos cronológicamente por kilometraje ascendente (o fecha como respaldo)
  // para asegurar que cada carga se compare con la inmediatamente previa en el odómetro.
  const cargasOrdenadas = [...cargas].sort((a, b) => {
    if (a.kilometraje !== b.kilometraje) {
      return a.kilometraje - b.kilometraje;
    }
    return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
  });

  const resultado: CargaCalculada[] = [];

  for (let i = 0; i < cargasOrdenadas.length; i++) {
    const actual = cargasOrdenadas[i];

    // Caso 1: Primera carga registrada en la serie
    // ¡OJO!: Aquí no hay carga previa con la cual contrastar. No se puede calcular rendimiento.
    if (i === 0) {
      resultado.push({
        ...actual,
        kmRecorridos: null,
        kmPorGalon: null,
        costoPorKm: null,
        esPrimeraCarga: true,
      });
      continue;
    }

    const previa = cargasOrdenadas[i - 1];
    const kmRecorridos = actual.kilometraje - previa.kilometraje;

    // Caso 2: Error en odómetro (el odómetro no avanzó o es menor al anterior)
    // PREVENCIÓN DE DIVISIÓN POR CERO O NÚMEROS NEGATIVOS:
    // Si kmRecorridos <= 0, no podemos calcular costo por km ni km por galón válidos.
    if (kmRecorridos <= 0) {
      resultado.push({
        ...actual,
        kmRecorridos,
        kmPorGalon: null,
        costoPorKm: null,
        esPrimeraCarga: false,
        errorCalculo: 'El kilometraje debe ser mayor al de la carga anterior',
      });
      continue;
    }

    // Caso 3: Validación de galones (evitar división por cero)
    if (actual.galones <= 0) {
      resultado.push({
        ...actual,
        kmRecorridos,
        kmPorGalon: null,
        costoPorKm: null,
        esPrimeraCarga: false,
        errorCalculo: 'Los galones deben ser mayores a 0',
      });
      continue;
    }

    // FÓRMULA 1: Kilómetros por galón (Rendimiento)
    // = Distancia recorrida / Galones consumidos para rellenar el tanque
    const kmPorGalon = kmRecorridos / actual.galones;

    // FÓRMULA 2: Costo por kilómetro
    // = Monto pagado para rellenar / Distancia recorrida
    const costoPorKm = actual.monto / kmRecorridos;

    resultado.push({
      ...actual,
      kmRecorridos,
      kmPorGalon: Number(kmPorGalon.toFixed(2)),
      costoPorKm: Number(costoPorKm.toFixed(4)),
      esPrimeraCarga: false,
    });
  }

  // Devolvemos en orden inverso (más reciente primero) para presentación en la UI
  return resultado.reverse();
}

/**
 * Agrupa las cargas calculadas mes a mes para alimentar el gráfico de rendimiento.
 * 
 * ¡CUIDADO EN LA AGREGACIÓN MENSUAL!:
 * El rendimiento mensual ponderado real es:
 *   Suma(kmRecorridos en el mes) / Suma(galones de esas cargas en el mes)
 * En lugar de un promedio simple de los km/gal de cada carga (que cometería
 * el error matemático de promediar razones con denominadores distintos).
 */
export function agruparRendimientoPorMes(cargasCalculadas: CargaCalculada[]): ResumenMensual[] {
  // Filtramos solo las cargas que tengan un cálculo válido de rendimiento
  const cargasValidas = cargasCalculadas.filter(
    (c) => !c.esPrimeraCarga && c.kmRecorridos !== null && c.kmPorGalon !== null && !c.errorCalculo
  );

  if (cargasValidas.length === 0) {
    return [];
  }

  const mapaMeses: { [key: string]: { totalKm: number; totalGalones: number; totalGasto: number; conteo: number } } = {};

  for (const c of cargasValidas) {
    // La fecha viene en formato YYYY-MM-DD
    const mesClave = c.fecha.substring(0, 7); // "YYYY-MM"
    if (!mapaMeses[mesClave]) {
      mapaMeses[mesClave] = { totalKm: 0, totalGalones: 0, totalGasto: 0, conteo: 0 };
    }

    mapaMeses[mesClave].totalKm += c.kmRecorridos || 0;
    mapaMeses[mesClave].totalGalones += c.galones;
    mapaMeses[mesClave].totalGasto += c.monto;
    mapaMeses[mesClave].conteo += 1;
  }

  const mesesOrdenados = Object.keys(mapaMeses).sort(); // Orden cronológico "2026-08", "2026-09", etc.

  const nombresMeses = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];

  return mesesOrdenados.map((clave) => {
    const [anio, mesNum] = clave.split('-');
    const indiceMes = parseInt(mesNum, 10) - 1;
    const datos = mapaMeses[clave];

    // RENDIMIENTO PONDERADO DEL MES (km totales / galones totales)
    // Se previene división por cero si totalGalones fuera 0.
    const kmPorGalonPromedio = datos.totalGalones > 0
      ? datos.totalKm / datos.totalGalones
      : 0;

    const costoPorKmPromedio = datos.totalKm > 0
      ? datos.totalGasto / datos.totalKm
      : 0;

    const nombreLegible = `${nombresMeses[indiceMes] || mesNum} ${anio}`;

    return {
      mesClave: clave,
      mesNombre: nombreLegible,
      totalKm: Math.round(datos.totalKm),
      totalGalones: Number(datos.totalGalones.toFixed(2)),
      totalGasto: Number(datos.totalGasto.toFixed(2)),
      kmPorGalonPromedio: Number(kmPorGalonPromedio.toFixed(1)),
      costoPorKmPromedio: Number(costoPorKmPromedio.toFixed(4)),
      cantidadCargas: datos.conteo,
    };
  });
}
