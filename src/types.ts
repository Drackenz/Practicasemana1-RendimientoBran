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

export interface RevisionMecanica {
  componente: string;
  motivo: string;
  costo_estimado_usd: number;
  prioridad: 'Alta' | 'Media' | 'Baja' | string;
}

export interface DiagnosticoRendimiento {
  mes_de_caida: string;
  rendimiento_anterior: number;
  rendimiento_actual: number;
  porcentaje_de_caida: number;
  diagnostico_general: string;
  revisiones: RevisionMecanica[];
}

/**
 * Ejemplo estático de prueba para desarrollo local sin consumir llamadas a la API de Gemini.
 */
export const DIAGNOSTICO_MOCK_EJEMPLO: DiagnosticoRendimiento = {
  mes_de_caida: 'Sep 2026',
  rendimiento_anterior: 74.5,
  rendimiento_actual: 62.8,
  porcentaje_de_caida: 15.7,
  diagnostico_general:
    'Se detectó una reducción del 15.7% en el rendimiento durante Septiembre 2026 (pasó de 74.5 a 62.8 km/gal). Recomendamos realizar las revisiones ordenadas por costo para descartar primero lo más económico.',
  revisiones: [
    {
      componente: 'Presión de aire en llantas',
      motivo:
        'Llantas con 3 o 4 PSI por debajo de lo recomendado aumentan la resistencia al rodaje y disparan el consumo hasta un 5%.',
      costo_estimado_usd: 0.0,
      prioridad: 'Alta',
    },
    {
      componente: 'Filtro de aire',
      motivo:
        'Un filtro tapado de polvo o aceite ahoga la mezcla aire/combustible, haciendo que el motor queme más gasolina de la necesaria.',
      costo_estimado_usd: 6.50,
      prioridad: 'Alta',
    },
    {
      componente: 'Bujía de encendido',
      motivo:
        'Electrodo desgastado o calibración incorrecta provoca chispa débil y combustión incompleta de la gasolina.',
      costo_estimado_usd: 5.0,
      prioridad: 'Media',
    },
    {
      componente: 'Tensión y lubricación de cadena (si es moto)',
      motivo:
        'Una cadena seca o floja genera fricción mecánica que exige acelerar más para mantener la misma velocidad.',
      costo_estimado_usd: 7.0,
      prioridad: 'Media',
    },
    {
      componente: 'Limpieza de carburador / Inyector',
      motivo:
        'Gomas y sedimentos en los conductos de gasolina alteran la pulverización ideal del combustible.',
      costo_estimado_usd: 25.0,
      prioridad: 'Baja',
    },
  ],
};
