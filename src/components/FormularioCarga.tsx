import React, { useState } from 'react';
import { PlusCircle, Fuel, DollarSign, Gauge, Calendar, AlertCircle } from 'lucide-react';
import { CargaCombustible } from '../types';

interface Props {
  onAgregarCarga: (carga: Omit<CargaCombustible, 'id'>) => void;
  ultimoKilometraje?: number | null;
}

export const FormularioCarga: React.FC<Props> = ({ onAgregarCarga, ultimoKilometraje }) => {
  // Fecha predeterminada de hoy en formato local YYYY-MM-DD
  const hoy = new Date().toISOString().split('T')[0];

  const [fecha, setFecha] = useState(hoy);
  const [monto, setMonto] = useState('');
  const [galones, setGalones] = useState('');
  const [kilometraje, setKilometraje] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const montoNum = parseFloat(monto);
    const galonesNum = parseFloat(galones);
    const kmNum = parseFloat(kilometraje);

    // Validaciones estrictas para evitar datos corruptos
    if (!fecha) {
      setError('Por favor selecciona una fecha válida.');
      return;
    }
    if (isNaN(kmNum) || kmNum <= 0) {
      setError('El kilometraje del tablero debe ser un número mayor a 0.');
      return;
    }
    if (isNaN(galonesNum) || galonesNum <= 0) {
      setError('Los galones deben ser mayores a 0.');
      return;
    }
    if (isNaN(montoNum) || montoNum <= 0) {
      setError('El monto pagado debe ser mayor a $0.');
      return;
    }

    // Advertencia no bloqueante si el usuario ingresa un km menor al último conocido
    if (ultimoKilometraje !== undefined && ultimoKilometraje !== null && kmNum <= ultimoKilometraje) {
      const confirmar = window.confirm(
        `El kilometraje ingresado (${kmNum.toLocaleString()} km) es igual o menor al último registrado (${ultimoKilometraje.toLocaleString()} km). ¿Deseas guardarlo de todas formas? (Esto puede ser una carga pasada).`
      );
      if (!confirmar) return;
    }

    onAgregarCarga({
      fecha,
      monto: montoNum,
      galones: galonesNum,
      kilometraje: kmNum,
    });

    // Limpiar campos para la próxima carga, manteniendo la fecha de hoy
    setMonto('');
    setGalones('');
    setKilometraje('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm"
    >
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Fuel className="w-4 h-4" />
          </div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Registrar Carga de Combustible
          </h2>
        </div>
        <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full font-mono">
          Tanque lleno
        </span>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Kilometraje del Tablero */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-indigo-400" />
            Kilometraje del tablero (km)
          </label>
          <input
            type="number"
            step="any"
            inputMode="numeric"
            value={kilometraje}
            onChange={(e) => setKilometraje(e.target.value)}
            placeholder={ultimoKilometraje ? `Ej: > ${ultimoKilometraje}` : 'Ej: 12450'}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white text-sm font-mono placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            required
          />
          {ultimoKilometraje !== undefined && ultimoKilometraje !== null && (
            <p className="text-[10px] text-slate-500 mt-1">
              Último registrado: <span className="text-slate-300 font-mono">{ultimoKilometraje.toLocaleString()} km</span>
            </p>
          )}
        </div>

        {/* Galones cargados */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
            <Fuel className="w-3.5 h-3.5 text-emerald-400" />
            Galones cargados (gal)
          </label>
          <input
            type="number"
            step="0.001"
            inputMode="decimal"
            value={galones}
            onChange={(e) => setGalones(e.target.value)}
            placeholder="Ej: 2.5"
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white text-sm font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
            required
          />
        </div>

        {/* Monto pagado en dólares */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
            Monto pagado (USD $)
          </label>
          <input
            type="number"
            step="0.01"
            inputMode="decimal"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="Ej: 9.50"
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white text-sm font-mono placeholder:text-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
            required
          />
        </div>

        {/* Fecha */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            Fecha de carga
          </label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition cursor-pointer"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        className="mt-4 w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-[0.99] text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-sm transition cursor-pointer"
      >
        <PlusCircle className="w-4 h-4" />
        <span>Guardar Carga de Combustible</span>
      </button>
    </form>
  );
};
