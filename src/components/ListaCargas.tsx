import React from 'react';
import { Trash2, Fuel, Sparkles, ArrowRight, Gauge, DollarSign } from 'lucide-react';
import { CargaCalculada } from '../types';

interface Props {
  cargas: CargaCalculada[];
  onEliminarCarga: (id: string) => void;
  onCargarEjemplos?: () => void;
}

export const ListaCargas: React.FC<Props> = ({ cargas, onEliminarCarga, onCargarEjemplos }) => {
  // 5. ESTADO VACÍO: cuando todavía no hay ninguna carga registrada
  if (cargas.length === 0) {
    return (
      <div className="bg-slate-900 border-2 border-dashed border-slate-700 rounded-3xl p-6 sm:p-8 text-center shadow-xl">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 border-2 border-emerald-500/30">
          <Fuel className="w-8 h-8 stroke-[2.5]" />
        </div>
        <h3 className="text-xl font-black text-white mb-2">
          Bitácora sin cargas todavía
        </h3>
        <p className="text-base text-slate-200 max-w-md mx-auto leading-relaxed font-medium mb-6">
          Registrá tu primera carga de combustible para ver cuánto rinde tu moto o carro todos los días.
        </p>

        {onCargarEjemplos && (
          <button
            onClick={onCargarEjemplos}
            type="button"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border-2 border-slate-600 text-base font-bold transition cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>Ver con 3 cargas de prueba</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
          <span>Historial de Cargas</span>
          <span className="text-base font-bold font-mono text-emerald-400 bg-slate-800 px-3 py-1 rounded-xl border border-slate-700">
            {cargas.length} {cargas.length === 1 ? 'carga' : 'cargas'}
          </span>
        </h3>
      </div>

      <div className="space-y-4">
        {cargas.map((carga, index) => {
          return (
            <div
              key={carga.id}
              className={`bg-slate-900 border-2 rounded-3xl p-5 shadow-xl transition-all ${
                carga.esPrimeraCarga
                  ? 'border-slate-700'
                  : carga.errorCalculo
                  ? 'border-rose-500 bg-rose-950/20'
                  : 'border-slate-700'
              }`}
            >
              {/* Encabezado con Odómetro y Fecha */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-white font-mono">
                      {carga.kilometraje.toLocaleString()} km
                    </span>
                    <span className="text-base font-bold text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-lg">
                      #{cargas.length - index}
                    </span>
                  </div>

                  <span className="text-base text-slate-300 font-semibold block mt-1">
                    {new Date(carga.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                {/* Botón secundario para eliminar registro */}
                <button
                  onClick={() => {
                    if (window.confirm('¿Deseas eliminar esta carga de tu bitácora?')) {
                      onEliminarCarga(carga.id);
                    }
                  }}
                  title="Eliminar esta carga"
                  className="p-3 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl border border-slate-700 transition cursor-pointer"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Datos de la carga repostada */}
              <div className="grid grid-cols-2 gap-3 mb-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-base text-slate-400 font-bold block">Pagado:</span>
                  <span className="text-lg font-black text-white font-mono">
                    ${carga.monto.toFixed(2)} USD
                  </span>
                </div>
                <div>
                  <span className="text-base text-slate-400 font-bold block">Combustible:</span>
                  <span className="text-lg font-black text-white font-mono">
                    {carga.galones.toFixed(2)} gal
                  </span>
                </div>
              </div>

              {/* Métricas calculadas o mensaje informativo */}
              {carga.esPrimeraCarga ? (
                <div className="mt-3 p-3.5 rounded-2xl bg-indigo-950/40 border-2 border-indigo-500/40 text-indigo-100 text-base font-medium">
                  <strong>Punto de partida:</strong> Llenaste el tanque en este kilometraje. El rendimiento se calculará en la próxima carga cuando sepamos cuánta distancia recorriste.
                </div>
              ) : carga.errorCalculo ? (
                <div className="mt-3 p-3.5 rounded-2xl bg-rose-950/40 border-2 border-rose-500/40 text-rose-100 text-base font-medium">
                  {carga.errorCalculo}
                </div>
              ) : (
                <div className="mt-3 space-y-2">
                  <div className="text-base text-indigo-300 font-bold flex items-center gap-1.5">
                    <ArrowRight className="w-5 h-5 text-indigo-400" />
                    <span>Recorriste <strong>{carga.kmRecorridos?.toLocaleString()} km</strong> con esta carga</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Tarjeta de Rendimiento (km por galón) */}
                    <div className="bg-slate-950 border-2 border-indigo-500/50 rounded-2xl p-4 flex items-center justify-between">
                      <div>
                        <span className="text-base text-slate-300 font-bold block flex items-center gap-1.5">
                          <Gauge className="w-4 h-4 text-indigo-400" /> Rendimiento
                        </span>
                        <div className="text-2xl font-black text-indigo-400 font-mono mt-0.5">
                          {carga.kmPorGalon?.toFixed(1)}{' '}
                          <span className="text-base font-bold text-slate-300">km/gal</span>
                        </div>
                      </div>
                    </div>

                    {/* Tarjeta de Costo por Kilómetro */}
                    <div className="bg-slate-950 border-2 border-emerald-500/50 rounded-2xl p-4 flex items-center justify-between">
                      <div>
                        <span className="text-base text-slate-300 font-bold block flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4 text-emerald-400" /> Costo por km
                        </span>
                        <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
                          ${carga.costoPorKm?.toFixed(4)}{' '}
                          <span className="text-base font-bold text-slate-300">USD</span>
                        </div>
                      </div>
                    </div>
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
