import React, { useState } from 'react';
import {
  Wrench,
  AlertTriangle,
  TrendingDown,
  DollarSign,
  Sparkles,
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { ResumenMensual, DiagnosticoRendimiento, DIAGNOSTICO_MOCK_EJEMPLO } from '../types';

interface Props {
  datosMensuales: ResumenMensual[];
}

export const DiagnosticoIA: React.FC<Props> = ({ datosMensuales }) => {
  const [cargando, setCargando] = useState(false);
  const [diagnostico, setDiagnostico] = useState<DiagnosticoRendimiento | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Solicitar diagnóstico a la API de Gemini (a través del backend seguro)
  const ejecutarAnalisis = async () => {
    if (datosMensuales.length < 2) {
      setError('Se necesitan al menos 2 meses con cargas calculadas para comparar tendencias de consumo.');
      return;
    }

    setCargando(true);
    setError(null);

    try {
      const respuesta = await fetch('/api/diagnostico-rendimiento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ datosMensuales }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.error || 'Ocurrió un error al contactar al servicio de inteligencia artificial.');
      }

      // Validación defensiva del esquema recibido
      if (!datos.mes_de_caida || !Array.isArray(datos.revisiones)) {
        throw new Error('La respuesta de la IA no cumplió con el formato estructurado esperado.');
      }

      setDiagnostico(datos);
    } catch (err: any) {
      console.error('Fallo en diagnóstico:', err);
      setError(
        err.message || 'La IA tardó demasiado o no pudo procesar la solicitud. Puedes cargar el ejemplo de prueba para continuar.'
      );
    } finally {
      setCargando(false);
    }
  };

  // Cargar ejemplo de prueba (sin consumir cuota de API)
  const cargarEjemploPrueba = () => {
    setError(null);
    setDiagnostico(DIAGNOSTICO_MOCK_EJEMPLO);
  };

  return (
    <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
      {/* Encabezado de la herramienta */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30">
            <Sparkles className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Diagnóstico Mecánico IA
            </h2>
            <p className="text-base text-slate-300 font-medium">
              Detecta caídas y prioriza revisiones de menor a mayor costo
            </p>
          </div>
        </div>

        {/* Acciones de activación */}
        <div className="flex items-center gap-2">
          <button
            onClick={ejecutarAnalisis}
            disabled={cargando}
            type="button"
            className="flex-1 sm:flex-initial min-h-[48px] px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white text-base font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-indigo-600/30"
          >
            {cargando ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Analizando...</span>
              </>
            ) : (
              <>
                <Wrench className="w-5 h-5" />
                <span>Analizar con Gemini</span>
              </>
            )}
          </button>

          <button
            onClick={cargarEjemploPrueba}
            type="button"
            title="Cargar ejemplo simulado sin llamar a la API"
            className="min-h-[48px] px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 text-slate-200 text-base font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <span className="hidden sm:inline">Ejemplo</span>
          </button>
        </div>
      </div>

      {/* Manejo de Fallo visible y sin tecnicismos */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border-2 border-rose-500 text-rose-100 space-y-3 animate-in fade-in">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-base font-bold text-white mb-0.5">
                No se pudo completar el análisis en vivo
              </strong>
              <p className="text-base text-rose-200">{error}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={ejecutarAnalisis}
              className="px-4 py-2 rounded-xl bg-rose-800 hover:bg-rose-700 text-white text-base font-bold flex items-center gap-2 transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reintentar</span>
            </button>
            <button
              onClick={cargarEjemploPrueba}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-base font-bold transition cursor-pointer"
            >
              Ver ejemplo de prueba
            </button>
          </div>
        </div>
      )}

      {/* Estado previo: cuando aún no se ha ejecutado el diagnóstico */}
      {!diagnostico && !cargando && !error && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-center">
          <p className="text-base text-slate-300 font-medium">
            Pulsa <strong>«Analizar con Gemini»</strong> para que la IA revise tu historial de km/gal y te diga qué repuesto o ajuste descartar primero para no gastar de más.
          </p>
        </div>
      )}

      {/* Pantalla de carga mientras Gemini procesa */}
      {cargando && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
          <p className="text-base font-bold text-white">
            Examinando tendencias de consumo y generando lista de revisiones...
          </p>
          <p className="text-base text-slate-400">
            Ordenando sugerencias de menor a mayor costo en dólares.
          </p>
        </div>
      )}

      {/* Visualización en Tarjetas y Tablas del Diagnóstico Recibido */}
      {diagnostico && !cargando && (
        <div className="space-y-5 animate-in fade-in">
          {/* Tarjeta de métricas de la caída detectada */}
          <div className="bg-slate-950 border-2 border-indigo-500/50 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <span className="text-base font-bold text-indigo-300 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-rose-400" />
                Mes crítico detectado: <strong className="text-white">{diagnostico.mes_de_caida}</strong>
              </span>
              <span className="text-base font-black px-3 py-1 rounded-xl bg-rose-950 border border-rose-500 text-rose-300 font-mono">
                -{diagnostico.porcentaje_de_caida.toFixed(1)}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-base text-slate-400 font-bold block">Mes anterior</span>
                <span className="text-xl font-black text-white font-mono">
                  {diagnostico.rendimiento_anterior} <span className="text-base font-normal text-slate-400">km/gal</span>
                </span>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-base text-slate-400 font-bold block">Mes de caída</span>
                <span className="text-xl font-black text-rose-400 font-mono">
                  {diagnostico.rendimiento_actual} <span className="text-base font-normal text-slate-400">km/gal</span>
                </span>
              </div>
            </div>

            <p className="text-base text-slate-200 font-medium leading-relaxed bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              {diagnostico.diagnostico_general}
            </p>
          </div>

          {/* Tabla / Lista de Revisiones ordenadas de menor a mayor costo */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-emerald-400" />
                <span>Revisiones sugeridas (de menor a mayor costo)</span>
              </h3>
            </div>

            <div className="space-y-3">
              {diagnostico.revisiones.map((item, idx) => {
                const esGratisOEconomico = item.costo_estimado_usd <= 5;
                return (
                  <div
                    key={idx}
                    className="bg-slate-950 border-2 border-slate-700 rounded-2xl p-4 space-y-2 hover:border-slate-600 transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 font-mono font-bold text-base flex items-center justify-center border border-slate-700">
                          #{idx + 1}
                        </span>
                        <h4 className="text-lg font-extrabold text-white">
                          {item.componente}
                        </h4>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`text-base font-black font-mono px-3 py-1 rounded-xl block border ${
                            esGratisOEconomico
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                              : 'bg-slate-800 text-amber-300 border-slate-700'
                          }`}
                        >
                          {item.costo_estimado_usd === 0
                            ? '$0 (Gratis)'
                            : `~$${item.costo_estimado_usd.toFixed(2)} USD`}
                        </span>
                      </div>
                    </div>

                    <p className="text-base text-slate-300 font-medium leading-relaxed pl-9">
                      {item.motivo}
                    </p>

                    <div className="pl-9 flex items-center gap-2 pt-1">
                      <span className="text-base text-slate-400 font-semibold">Prioridad:</span>
                      <span
                        className={`text-base font-bold px-2.5 py-0.5 rounded-lg ${
                          item.prioridad === 'Alta'
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-600'
                            : item.prioridad === 'Media'
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-600'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {item.prioridad}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
