/**
 * Estructuras de datos para el registro y cálculo de rendimiento de combustible.
 */

export interface CargaCombustible {
  id: string;
  fecha: string; // Formato YYYY-MM-DD
  monto: number; // Monto pagado en dólares ($)
  galones: number; // Galones cargados
  kilometraje: number; // Lectura del odómetro en kilómetros
}

export interface CargaCalculada extends CargaCombustible {
  kmRecorridos: number | null; // Diferencia respecto a la carga anterior (null si es la primera)
  kmPorGalon: number | null; // Rendimiento: kmRecorridos / galones
  costoPorKm: number | null; // Costo por kilómetro: monto / kmRecorridos
  esPrimeraCarga: boolean; // Indica si es el punto de partida (sin cálculo posible)
  errorCalculo?: string; // Por si el kilometraje fue menor o igual al previo
}

export interface ResumenMensual {
  mesClave: string; // ej: "2026-09"
  mesNombre: string; // ej: "Septiembre 2026"
  totalKm: number;
  totalGalones: number;
  totalGasto: number;
  kmPorGalonPromedio: number;
  costoPorKmPromedio: number;
  cantidadCargas: number;
}
