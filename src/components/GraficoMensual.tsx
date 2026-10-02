import React from 'react';
import { TrendingUp, TrendingDown, Minus, BarChart2 } from 'lucide-react';
import { ResumenMensual } from '../types';

interface Props {
  datosMensuales: ResumenMensual[];
}

export const GraficoMensual: React.FC<Props> = ({ datosMensuales }) => {
  if (datosMensuales.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-3">
          <BarChart2 className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-white mb-1">
          Gráfico de Rendimiento Mes a Mes
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Para calcular el rendimiento mensual necesitas registrar al menos <strong className="text-emerald-400">2 cargas</strong> de tanque lleno consecutivas.
        </p>
      </div>
    );
  }

  // Obtenemos el valor máximo para escalar la altura de las barras del SVG
  const maxRendimiento = Math.max(...datosMensuales.map((d) => d.kmPorGalonPromedio), 10);
  const minRendimiento = Math.min(...datosMensuales.map((d) => d.kmPorGalonPromedio));
  
  // Cálculo de tendencia entre el último mes y el anterior
  const ultimoMes = datosMensuales[datosMensuales.length - 1];
  const penultimoMes = datosMensuales.length > 1 ? datosMensuales[datosMensuales.length - 2] : null;
  const diferenciaMesAnterior = penultimoMes
    ? ultimoMes.kmPorGalonPromedio - penultimoMes.kmPorGalonPromedio
    : null;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <BarChart2 className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Rendimiento Mes a Mes
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Evolución del rendimiento en kilómetros por galón (km/gal)
          </p>
        </div>

        {/* Resumen comparativo de rendimiento respecto al mes anterior */}
        {diferenciaMesAnterior !== null && (
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold self-start sm:self-auto ${
              diferenciaMesAnterior > 0
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : diferenciaMesAnterior < 0
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            {diferenciaMesAnterior > 0 ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : diferenciaMesAnterior < 0 ? (
              <TrendingDown className="w-3.5 h-3.5" />
            ) : (
              <Minus className="w-3.5 h-3.5" />
            )}
            <span>
              {diferenciaMesAnterior > 0 ? `+${diferenciaMesAnterior.toFixed(1)}` : diferenciaMesAnterior.toFixed(1)} km/gal vs mes anterior
            </span>
          </div>
        )}
      </div>

      {/* Gráfico de barras responsivo usando SVG nativo sin librerías pesadas */}
      <div className="w-full pt-4 pb-2">
        <div className="h-48 sm:h-56 flex items-end justify-between gap-3 sm:gap-6 px-2 border-b border-slate-800 relative">
          {/* Líneas guía de fondo */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-15">
            <div className="border-b border-dashed border-slate-500 w-full" />
            <div className="border-b border-dashed border-slate-500 w-full" />
            <div className="border-b border-dashed border-slate-500 w-full" />
          </div>

          {datosMensuales.map((item, index) => {
            // Escalar la altura proporcionalmente: mínimo 12% para que sea visible siempre
            const alturaPorcentaje = Math.max(
              Math.round((item.kmPorGalonPromedio / (maxRendimiento * 1.15)) * 100),
              12
            );
            const esUltimo = index === datosMensuales.length - 1;

            return (
              <div
                key={item.mesClave}
                className="flex-1 flex flex-col items-center justify-end h-full group relative z-10"
              >
                {/* Etiqueta flotante con el valor exacto sobre la barra */}
                <div className="mb-2 text-center transition-transform group-hover:-translate-y-1">
                  <span
                    className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded ${
                      esUltimo
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-200'
                    }`}
                  >
                    {item.kmPorGalonPromedio.toFixed(1)}
                  </span>
                  <span className="block text-[9px] text-slate-400 uppercase tracking-tighter mt-0.5">
                    km/gal
                  </span>
                </div>

                {/* Barra visual con gradiente */}
                <div className="w-full max-w-[56px] flex justify-center">
                  <div
                    style={{ height: `${alturaPorcentaje}%` }}
                    className={`w-full rounded-t-lg transition-all duration-300 relative ${
                      esUltimo
                        ? 'bg-gradient-to-t from-indigo-600 to-cyan-400 shadow-lg shadow-indigo-500/20'
                        : 'bg-gradient-to-t from-slate-700 to-slate-500 hover:from-slate-600 hover:to-indigo-400'
                    }`}
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 rounded-t-lg transition-opacity" />
                  </div>
                </div>

                {/* Detalle al hacer hover / tooltip accesible */}
                <div className="absolute bottom-16 hidden group-hover:flex flex-col bg-slate-950 border border-slate-700 text-slate-200 text-[11px] p-2.5 rounded-lg shadow-2xl z-20 pointer-events-none whitespace-nowrap">
                  <span className="font-semibold text-white">{item.mesNombre}</span>
                  <span className="text-slate-400">Distancia: {item.totalKm.toLocaleString()} km</span>
                  <span className="text-slate-400">Consumo: {item.totalGalones} gal</span>
                  <span className="text-emerald-400 font-semibold">Costo: ${(item.costoPorKmPromedio).toFixed(4)}/km</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Eje X con los nombres de los meses */}
        <div className="flex justify-between gap-3 sm:gap-6 px-2 mt-2">
          {datosMensuales.map((item, index) => {
            const esUltimo = index === datosMensuales.length - 1;
            return (
              <div key={item.mesClave} className="flex-1 text-center">
                <span
                  className={`text-xs block font-medium ${
                    esUltimo ? 'text-indigo-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  {item.mesNombre}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {item.cantidadCargas} {item.cantidadCargas === 1 ? 'carga' : 'cargas'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tarjetas resumen del mes más reciente */}
      {ultimoMes && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Mes actual</span>
            <span className="text-xs font-semibold text-white">{ultimoMes.mesNombre}</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Rendimiento</span>
            <span className="text-xs font-bold text-indigo-400 font-mono">{ultimoMes.kmPorGalonPromedio} km/gal</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Costo prom/km</span>
            <span className="text-xs font-bold text-emerald-400 font-mono">${ultimoMes.costoPorKmPromedio.toFixed(4)}</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Km recorridos</span>
            <span className="text-xs font-semibold text-slate-200 font-mono">{ultimoMes.totalKm.toLocaleString()} km</span>
          </div>
        </div>
      )}
    </div>
  );
};
