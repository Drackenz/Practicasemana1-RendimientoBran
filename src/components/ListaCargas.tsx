import React from 'react';
import { Trash2, Info, Fuel, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { CargaCalculada } from '../types';

interface Props {
  cargas: CargaCalculada[];
  onEliminarCarga: (id: string) => void;
}

export const ListaCargas: React.FC<Props> = ({ cargas, onEliminarCarga }) => {
  if (cargas.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-8 text-center">
        <Fuel className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-400">
          Aún no has registrado ninguna carga.
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Registra tu primera carga de tanque lleno para comenzar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <span>Historial de Cargas</span>
          <span className="text-xs font-mono font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
            {cargas.length} {cargas.length === 1 ? 'registro' : 'registros'}
          </span>
        </h3>
        <span className="text-[11px] text-slate-500 hidden sm:inline">
          Ordenadas de más reciente a más antigua
        </span>
      </div>

      <div className="space-y-2.5">
        {cargas.map((carga, index) => {
          return (
            <div
              key={carga.id}
              className={`bg-slate-900/90 border rounded-2xl p-4 transition-all ${
                carga.esPrimeraCarga
                  ? 'border-slate-800/80'
                  : carga.errorCalculo
                  ? 'border-rose-900/50 bg-rose-950/10'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Encabezado de la carga: Fecha y Odómetro */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs">
                    #{cargas.length - index}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white font-mono">
                        {carga.kilometraje.toLocaleString()} km
                      </span>
                      {carga.kmRecorridos !== null && (
                        <span className="text-xs font-medium text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                          +{carga.kmRecorridos.toLocaleString()} km recorridos
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      {new Date(carga.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-bold text-white font-mono block">
                      ${carga.monto.toFixed(2)}
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      {carga.galones.toFixed(2)} gal
                    </span>
                  </div>

                  <button
                    onClick={() => onEliminarCarga(carga.id)}
                    title="Eliminar esta carga"
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Métricas calculadas o mensaje informativo */}
              {carga.esPrimeraCarga ? (
                <div className="mt-2 pt-2.5 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-400 bg-slate-950/40 p-2 rounded-xl">
                  <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>
                    <strong>Carga inicial de referencia:</strong> El tanque se llenó aquí. En la próxima carga sabremos cuánto rindió este combustible.
                  </span>
                </div>
              ) : carga.errorCalculo ? (
                <div className="mt-2 pt-2.5 border-t border-slate-800/80 flex items-center gap-2 text-xs text-rose-400 bg-rose-950/30 p-2 rounded-xl">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>{carga.errorCalculo}</span>
                </div>
              ) : (
                <div className="mt-2 pt-2.5 border-t border-slate-800/80 grid grid-cols-2 gap-2">
                  {/* Tarjeta de Rendimiento (km/galón) */}
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                        Rendimiento
                      </span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-base font-extrabold text-indigo-400 font-mono">
                          {carga.kmPorGalon?.toFixed(1)}
                        </span>
                        <span className="text-[10px] text-slate-400">km/gal</span>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-indigo-400 opacity-60" />
                  </div>

                  {/* Tarjeta de Costo por Kilómetro ($/km) */}
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                        Costo por km
                      </span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-base font-extrabold text-emerald-400 font-mono">
                          ${carga.costoPorKm?.toFixed(4)}
                        </span>
                        <span className="text-[10px] text-slate-400">/km</span>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">USD</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
