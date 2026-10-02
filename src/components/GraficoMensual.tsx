import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, BarChart2, Calendar, Fuel, DollarSign, Gauge } from 'lucide-react';
import { ResumenMensual } from '../types';

interface Props {
  datosMensuales: ResumenMensual[];
}

export const GraficoMensual: React.FC<Props> = ({ datosMensuales }) => {
  const [mesSeleccionado, setMesSeleccionado] = useState<string | null>(null);

  // Mensaje cuando aún no se pueden comparar meses
  if (datosMensuales.length === 0) {
    return (
      <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 text-center shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3 border border-indigo-500/30">
          <BarChart2 className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-black text-white mb-2">
          Gráfico de Rendimiento Mes a Mes
        </h3>
        <p className="text-base text-slate-200 font-medium max-w-sm mx-auto leading-relaxed">
          Para ver la comparación mes a mes necesitás registrar al menos <strong className="text-emerald-400">2 cargas</strong> de tanque lleno.
        </p>
      </div>
    );
  }

  const maxRendimiento = Math.max(...datosMensuales.map((d) => d.kmPorGalonPromedio), 10);
  const ultimoMes = datosMensuales[datosMensuales.length - 1];
  const penultimoMes = datosMensuales.length > 1 ? datosMensuales[datosMensuales.length - 2] : null;
  const diferenciaMesAnterior = penultimoMes
    ? ultimoMes.kmPorGalonPromedio - penultimoMes.kmPorGalonPromedio
    : null;

  const detalleMes = datosMensuales.find((d) => d.mesClave === mesSeleccionado) || ultimoMes;

  return (
    <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-5 sm:p-6 shadow-xl">
      {/* Encabezado */}
      <div className="flex flex-col gap-2 mb-5 pb-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
            <BarChart2 className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Rendimiento Mes a Mes
            </h2>
            <p className="text-base text-slate-300 font-medium">
              Promedio de kilómetros por galón
            </p>
          </div>
        </div>

        {/* Indicador de comparación legible */}
        {diferenciaMesAnterior !== null && (
          <div
            className={`mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-base font-extrabold self-start ${
              diferenciaMesAnterior > 0
                ? 'bg-emerald-950 border-2 border-emerald-400 text-emerald-200'
                : diferenciaMesAnterior < 0
                ? 'bg-rose-950 border-2 border-rose-400 text-rose-200'
                : 'bg-slate-800 border-2 border-slate-600 text-slate-200'
            }`}
          >
            {diferenciaMesAnterior > 0 ? (
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            ) : diferenciaMesAnterior < 0 ? (
              <TrendingDown className="w-5 h-5 text-rose-400" />
            ) : (
              <Minus className="w-5 h-5 text-slate-400" />
            )}
            <span>
              {diferenciaMesAnterior > 0
                ? `Rinde +${diferenciaMesAnterior.toFixed(1)} km/gal más que el mes anterior`
                : diferenciaMesAnterior < 0
                ? `Rinde ${diferenciaMesAnterior.toFixed(1)} km/gal menos que el mes anterior`
                : 'Mismo rendimiento que el mes anterior'}
            </span>
          </div>
        )}
      </div>

      {/* Gráfico de barras SVG accesible y de alto contraste */}
      <div className="w-full pt-4 pb-2">
        <div className="h-52 sm:h-60 flex items-end justify-between gap-3 px-2 border-b-2 border-slate-600 relative">
          {datosMensuales.map((item, index) => {
            const alturaPorcentaje = Math.max(
              Math.round((item.kmPorGalonPromedio / (maxRendimiento * 1.2)) * 100),
              18
            );
            const esSeleccionado = detalleMes?.mesClave === item.mesClave;
            const esUltimo = index === datosMensuales.length - 1;

            return (
              <button
                key={item.mesClave}
                onClick={() => setMesSeleccionado(item.mesClave)}
                type="button"
                className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer focus:outline-none"
              >
                {/* Etiqueta con valor legible en 16px */}
                <div className="mb-2 text-center">
                  <span
                    className={`text-base font-black font-mono px-2.5 py-1 rounded-xl block border ${
                      esSeleccionado
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg'
                        : 'bg-slate-950 text-white border-slate-700'
                    }`}
                  >
                    {item.kmPorGalonPromedio.toFixed(1)}
                  </span>
                </div>

                {/* Barra sólida de alto contraste para sol */}
                <div className="w-full max-w-[56px] flex justify-center">
                  <div
                    style={{ height: `${alturaPorcentaje}%` }}
                    className={`w-full rounded-t-2xl transition-all duration-200 border-t-2 border-x-2 ${
                      esSeleccionado
                        ? 'bg-gradient-to-t from-indigo-700 via-indigo-500 to-cyan-300 border-white ring-2 ring-indigo-400'
                        : esUltimo
                        ? 'bg-gradient-to-t from-emerald-700 to-emerald-400 border-emerald-300'
                        : 'bg-slate-700 border-slate-500 hover:bg-slate-600'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Eje X de nombres de meses en >= 16px */}
        <div className="flex justify-between gap-3 px-2 mt-3">
          {datosMensuales.map((item) => {
            const esSeleccionado = detalleMes?.mesClave === item.mesClave;
            return (
              <div key={item.mesClave} className="flex-1 text-center">
                <span
                  className={`text-base block font-bold ${
                    esSeleccionado ? 'text-indigo-300 underline underline-offset-4' : 'text-slate-200'
                  }`}
                >
                  {item.mesNombre}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tarjeta de detalle del mes seleccionado */}
      {detalleMes && (
        <div className="mt-5 pt-4 border-t border-slate-700">
          <div className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <span>Detalle de {detalleMes.mesNombre}:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-700">
              <span className="text-base text-slate-400 font-bold block flex items-center gap-1.5">
                <Gauge className="w-5 h-5 text-indigo-400" /> Rendimiento promedio:
              </span>
              <span className="text-2xl font-black text-indigo-400 font-mono block mt-1">
                {detalleMes.kmPorGalonPromedio} <span className="text-base font-bold text-slate-300">km/gal</span>
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-700">
              <span className="text-base text-slate-400 font-bold block flex items-center gap-1.5">
                <DollarSign className="w-5 h-5 text-emerald-400" /> Costo por km:
              </span>
              <span className="text-2xl font-black text-emerald-400 font-mono block mt-1">
                ${detalleMes.costoPorKmPromedio.toFixed(4)} <span className="text-base font-bold text-slate-300">USD</span>
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-700">
              <span className="text-base text-slate-400 font-bold block">Distancia recorrida:</span>
              <span className="text-xl font-black text-white font-mono block mt-1">
                {detalleMes.totalKm.toLocaleString()} km
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-700">
              <span className="text-base text-slate-400 font-bold block flex items-center gap-1.5">
                <Fuel className="w-5 h-5 text-amber-400" /> Total galones:
              </span>
              <span className="text-xl font-black text-white font-mono block mt-1">
                {detalleMes.totalGalones.toFixed(2)} gal
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
