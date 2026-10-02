import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, BarChart2, Calendar, Fuel, DollarSign, Gauge } from 'lucide-react';
import { ResumenMensual } from '../types';

interface Props {
  datosMensuales: ResumenMensual[];
}

export const GraficoMensual: React.FC<Props> = ({ datosMensuales }) => {
  const [mesSeleccionado, setMesSeleccionado] = useState<string | null>(null);

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
  
  // Cálculo de tendencia entre el último mes y el anterior
  const ultimoMes = datosMensuales[datosMensuales.length - 1];
  const penultimoMes = datosMensuales.length > 1 ? datosMensuales[datosMensuales.length - 2] : null;
  const diferenciaMesAnterior = penultimoMes
    ? ultimoMes.kmPorGalonPromedio - penultimoMes.kmPorGalonPromedio
    : null;

  // Mes activo en la tarjeta de detalle (por defecto el último)
  const detalleMes = datosMensuales.find((d) => d.mesClave === mesSeleccionado) || ultimoMes;

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
            Evolución del rendimiento en kilómetros por galón (km/gal). Toca una barra para ver detalles.
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

      {/* Gráfico de barras interactivo optimizado para móvil */}
      <div className="w-full pt-4 pb-2">
        <div className="h-48 sm:h-56 flex items-end justify-between gap-3 sm:gap-6 px-2 border-b border-slate-800 relative">
          {/* Líneas guía de fondo */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-15">
            <div className="border-b border-dashed border-slate-500 w-full" />
            <div className="border-b border-dashed border-slate-500 w-full" />
            <div className="border-b border-dashed border-slate-500 w-full" />
          </div>

          {datosMensuales.map((item, index) => {
            const alturaPorcentaje = Math.max(
              Math.round((item.kmPorGalonPromedio / (maxRendimiento * 1.15)) * 100),
              14
            );
            const esSeleccionado = detalleMes?.mesClave === item.mesClave;
            const esUltimo = index === datosMensuales.length - 1;

            return (
              <button
                key={item.mesClave}
                onClick={() => setMesSeleccionado(item.mesClave)}
                className="flex-1 flex flex-col items-center justify-end h-full group relative z-10 cursor-pointer focus:outline-none"
              >
                {/* Etiqueta flotante con el valor exacto sobre la barra */}
                <div className="mb-2 text-center transition-transform group-hover:-translate-y-1">
                  <span
                    className={`text-xs font-bold font-mono px-2 py-0.5 rounded-md transition-colors ${
                      esSeleccionado
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                        : esUltimo
                        ? 'bg-slate-800 text-indigo-300'
                        : 'bg-slate-800 text-slate-300'
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
                    className={`w-full rounded-t-xl transition-all duration-200 relative ${
                      esSeleccionado
                        ? 'bg-gradient-to-t from-indigo-600 via-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-400'
                        : 'bg-gradient-to-t from-slate-800 to-slate-600 hover:from-slate-700 hover:to-indigo-400'
                    }`}
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 rounded-t-xl transition-opacity" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Eje X con los nombres de los meses */}
        <div className="flex justify-between gap-3 sm:gap-6 px-2 mt-2">
          {datosMensuales.map((item) => {
            const esSeleccionado = detalleMes?.mesClave === item.mesClave;
            return (
              <div key={item.mesClave} className="flex-1 text-center">
                <span
                  className={`text-xs block font-medium transition-colors ${
                    esSeleccionado ? 'text-indigo-400 font-bold' : 'text-slate-400'
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

      {/* Tarjeta de detalle interactiva del mes seleccionado */}
      {detalleMes && (
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              Detalle del mes: <strong className="text-white normal-case">{detalleMes.mesNombre}</strong>
            </span>
            <span className="text-[10px] text-slate-500">
              {detalleMes.cantidadCargas} {detalleMes.cantidadCargas === 1 ? 'carga registrada' : 'cargas registradas'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block flex items-center justify-center gap-1">
                <Gauge className="w-3 h-3 text-indigo-400" /> Rendimiento
              </span>
              <span className="text-sm font-bold text-indigo-400 font-mono">
                {detalleMes.kmPorGalonPromedio} <span className="text-[10px] font-normal text-slate-400">km/gal</span>
              </span>
            </div>

            <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block flex items-center justify-center gap-1">
                <DollarSign className="w-3 h-3 text-emerald-400" /> Costo / km
              </span>
              <span className="text-sm font-bold text-emerald-400 font-mono">
                ${detalleMes.costoPorKmPromedio.toFixed(4)}
              </span>
            </div>

            <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Distancia total</span>
              <span className="text-sm font-semibold text-white font-mono">
                {detalleMes.totalKm.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">km</span>
              </span>
            </div>

            <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block flex items-center justify-center gap-1">
                <Fuel className="w-3 h-3 text-amber-400" /> Total galones
              </span>
              <span className="text-sm font-semibold text-slate-200 font-mono">
                {detalleMes.totalGalones.toFixed(2)} <span className="text-[10px] font-normal text-slate-400">gal</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
