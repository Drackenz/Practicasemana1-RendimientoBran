import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// Esquema estructurado estricto para respuesta de diagnóstico
const esquemaDiagnostico = {
  type: Type.OBJECT,
  properties: {
    mes_de_caida: {
      type: Type.STRING,
      description: "Mes en que se detectó la caída de rendimiento (ej: 'Sep 2026') o 'Sin caídas detectadas' si no hubo disminución.",
    },
    rendimiento_anterior: {
      type: Type.NUMBER,
      description: "Rendimiento promedio en km/gal del mes anterior a la caída.",
    },
    rendimiento_actual: {
      type: Type.NUMBER,
      description: "Rendimiento promedio en km/gal del mes con menor rendimiento.",
    },
    porcentaje_de_caida: {
      type: Type.NUMBER,
      description: "Porcentaje de pérdida de rendimiento (ej: 12.5 para 12.5%).",
    },
    diagnostico_general: {
      type: Type.STRING,
      description: "Explicación breve y amigable para el conductor sobre qué sucedió con su consumo.",
    },
    revisiones: {
      type: Type.ARRAY,
      description: "Lista de revisiones mecánicas recomendadas, ordenadas de menor a mayor costo estimado en USD.",
      items: {
        type: Type.OBJECT,
        properties: {
          componente: {
            type: Type.STRING,
            description: "Parte a revisar (ej: 'Calibración de presión en llantas', 'Filtro de aire', 'Bujía', 'Limpieza de carburador / inyectores').",
          },
          motivo: {
            type: Type.STRING,
            description: "Por qué este fallo produce más consumo de combustible.",
          },
          costo_estimado_usd: {
            type: Type.NUMBER,
            description: "Costo estimado en dólares ($ USD) de la inspección o repuesto básico.",
          },
          prioridad: {
            type: Type.STRING,
            description: "Nivel de urgencia ('Alta', 'Media' o 'Baja').",
          },
        },
        required: ['componente', 'motivo', 'costo_estimado_usd', 'prioridad'],
      },
    },
  },
  required: [
    'mes_de_caida',
    'rendimiento_anterior',
    'rendimiento_actual',
    'porcentaje_de_caida',
    'diagnostico_general',
    'revisiones',
  ],
};

// Endpoint seguro para analizar rendimiento con Gemini en el servidor
app.post('/api/diagnostico-rendimiento', async (req: Request, res: Response) => {
  const { datosMensuales } = req.body;

  if (!datosMensuales || !Array.isArray(datosMensuales) || datosMensuales.length < 2) {
    res.status(400).json({
      error: 'Se requieren al menos 2 meses con cargas calculadas para detectar caídas de rendimiento.',
    });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503).json({
      error: 'La variable de entorno GEMINI_API_KEY no está configurada en el servidor. Puedes usar los datos de prueba simulados.',
      sinLlave: true,
    });
    return;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `Actúa como mecánico experto en diagnóstico vehicular (motos y carros).
Analiza el siguiente historial de rendimiento mensual en kilómetros por galón (km/gal):
${JSON.stringify(datosMensuales, null, 2)}

Tu tarea:
1. Detecta si hubo un mes donde cayó el rendimiento respecto al mes anterior o al promedio.
2. Si hubo caída, calcula el porcentaje de pérdida e identifica el mes crítico.
3. Genera una lista de causas mecánicas comunes y revisiones preventivas recomendadas.
4. IMPORTANTE: Ordena la lista de revisiones estrictamente de MENOR costo estimado en USD a MAYOR costo estimado (empezando por cosas baratas o gratuitas como presión de aire, seguido de filtro, bujía, etc.).`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000); // 20 segundos máximo

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: esquemaDiagnostico,
        systemInstruction:
          'Eres un asistente mecánico profesional. Responde únicamente con el esquema JSON estructurado solicitado, sin formato markdown fuera del JSON.',
      },
    });

    clearTimeout(timeout);

    const texto = response.text?.trim();
    if (!texto) {
      throw new Error('La respuesta del modelo llegó vacía.');
    }

    const jsonParsed = JSON.parse(texto);
    res.json(jsonParsed);
  } catch (error: any) {
    console.error('Error al procesar diagnóstico con Gemini:', error);
    res.status(500).json({
      error: 'No se pudo completar el análisis con la IA en este momento. Intenta de nuevo o consulta las recomendaciones de prueba.',
      detalles: error?.message || 'Error desconocido',
    });
  }
});

async function startServer() {
  if (!isProd) {
    // Modo Desarrollo: montar Vite middlewares en Express
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Modo Producción: servir estáticos desde dist
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor RENDIMIENTO activo en http://0.0.0.0:${port}`);
  });
}

startServer();
