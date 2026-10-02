import React, { useState } from 'react';
import { PlusCircle, Fuel, DollarSign, Gauge, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { CargaCombustible } from '../types';

interface Props {
  onAgregarCarga: (carga: Omit<CargaCombustible, 'id'>) => void;
  ultimoKilometraje?: number | null;
  mensajeExito?: string | null;
}

export const FormularioCarga: React.FC<Props> = ({
  onAgregarCarga,
  ultimoKilometraje,
  mensajeExito,
}) => {
  const hoy = new Date().toISOString().split('T')[0];

  const [fecha, setFecha] = useState(hoy);
  const [monto, setMonto] = useState('');
  const [galones, setGalones] = useState('');
  const [kilometraje, setKilometraje] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false); // Evita doble clic

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guardando) return; // Protección contra doble submit
    setError(null);

    // 1. Validación de campos vacíos o solo espacios
    if (!fecha.trim() || !kilometraje.trim() || !galones.trim() || !monto.trim()) {
      setError('Todos los campos son obligatorios. Por favor completa los datos faltantes.');
      return;
    }

    // 8. Validación de fecha futura o absurda (< año 2000)
    if (fecha > hoy) {
      setError('La fecha de la carga no puede ser futura.');
      return;
    }
    if (fecha < '2000-01-01') {
      setError('Por favor ingresa una fecha válida del año 2000 en adelante.');
      return;
    }

    // Conversión segura de números
    const kmNum = Number(kilometraje);
    const galonesNum = Number(galones);
    const montoNum = Number(monto);

    // 2. Validación de textos o NaN
    if (!Number.isFinite(kmNum) || !Number.isFinite(galonesNum) || !Number.isFinite(montoNum)) {
      setError('Solo se permiten números válidos en kilometraje, galones y monto.');
      return;
    }

    // 9. Validación de números gigantes / desbordamiento
    if (kmNum > 2000000) {
      setError('El kilometraje es demasiado grande (máximo 2,000,000 km).');
      return;
    }
    if (galonesNum > 300) {
      setError('La cantidad de galones excede la capacidad normal de un vehículo (máximo 300 gal).');
      return;
    }
    if (montoNum > 10000) {
      setError('El monto pagado excede el límite permitido (máximo $10,000).');
      return;
    }

    // 3. Validación de galones en cero o negativos
    if (galonesNum <= 0) {
      setError('Los galones deben ser un valor mayor a cero.');
      return;
    }

    // 7. Validación de monto negativo o cero
    if (montoNum <= 0) {
      setError('El total pagado en dinero debe ser mayor a $0.');
      return;
    }

    // 4 y 5. Validación de kilometraje menor o igual al anterior
    if (kmNum <= 0) {
      setError('El kilometraje del tablero debe ser un número positivo.');
      return;
    }

    if (ultimoKilometraje !== undefined && ultimoKilometraje !== null) {
      if (kmNum < ultimoKilometraje) {
        setError(
          `El kilometraje ingresado (${kmNum.toLocaleString()} km) no puede ser menor al de la carga anterior (${ultimoKilometraje.toLocaleString()} km).`
        );
        return;
      }
      if (kmNum === ultimoKilometraje) {
        setError(
          `El kilometraje es idéntico al de la carga anterior (${ultimoKilometraje.toLocaleString()} km). Debe haber distancia recorrida para calcular el rendimiento.`
        );
        return;
      }
    }

    // 10. Bloqueo temporal contra doble clic
    setGuardando(true);

    try {
      onAgregarCarga({
        fecha,
        monto: montoNum,
        galones: galonesNum,
        kilometraje: kmNum,
      });

      setMonto('');
      setGalones('');
      setKilometraje('');
    } finally {
      setTimeout(() => setGuardando(false), 600);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl"
    >
      {/* Título de la sección */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
            <Fuel className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Nueva Carga
            </h2>
            <p className="text-base text-slate-300 font-medium">
              Método de tanque lleno
            </p>
          </div>
        </div>
      </div>

      {/* Mensaje de éxito visible */}
      {mensajeExito && (
        <div className="mb-5 p-4 rounded-2xl bg-emerald-950/80 border-2 border-emerald-400 text-emerald-100 flex items-start gap-3 shadow-lg animate-in fade-in">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-base font-bold leading-snug">
            {mensajeExito}
          </div>
        </div>
      )}

      {/* Mensaje de error visible */}
      {error && (
        <div className="mb-5 p-4 rounded-2xl bg-rose-950/80 border-2 border-rose-400 text-rose-100 flex items-start gap-3 shadow-lg animate-in fade-in">
          <AlertCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-base font-bold leading-snug">
            {error}
          </div>
        </div>
      )}

      {/* Campos de entrada con etiquetas visibles y tamaño legible al sol (>= 16px) */}
      <div className="space-y-4">
        {/* 1. Kilometraje del Tablero */}
        <div>
          <label
            htmlFor="campo-kilometraje"
            className="block text-base font-bold text-white mb-2 flex items-center gap-2"
          >
            <Gauge className="w-5 h-5 text-indigo-400" />
            <span>Kilometraje actual del tablero</span>
          </label>
          <input
            id="campo-kilometraje"
            type="number"
            step="any"
            min="1"
            max="2000000"
            inputMode="numeric"
            value={kilometraje}
            onChange={(e) => setKilometraje(e.target.value.slice(0, 10))}
            placeholder={ultimoKilometraje ? `Mayor a ${ultimoKilometraje}` : 'Ejemplo: 12450'}
            className="w-full min-h-[52px] bg-slate-950 border-2 border-slate-600 focus:border-emerald-400 focus:bg-slate-900 rounded-2xl px-4 text-white text-base font-mono placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 transition"
            required
          />
          {ultimoKilometraje !== undefined && ultimoKilometraje !== null && (
            <p className="text-base text-slate-300 mt-1.5 font-medium">
              Último anotado: <strong className="text-white font-mono">{ultimoKilometraje.toLocaleString()} km</strong>
            </p>
          )}
        </div>

        {/* 2. Galones cargados */}
        <div>
          <label
            htmlFor="campo-galones"
            className="block text-base font-bold text-white mb-2 flex items-center gap-2"
          >
            <Fuel className="w-5 h-5 text-emerald-400" />
            <span>Galones cargados hasta llenar</span>
          </label>
          <input
            id="campo-galones"
            type="number"
            step="0.001"
            min="0.001"
            max="300"
            inputMode="decimal"
            value={galones}
            onChange={(e) => setGalones(e.target.value.slice(0, 8))}
            placeholder="Ejemplo: 2.5"
            className="w-full min-h-[52px] bg-slate-950 border-2 border-slate-600 focus:border-emerald-400 focus:bg-slate-900 rounded-2xl px-4 text-white text-base font-mono placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 transition"
            required
          />
        </div>

        {/* 3. Monto pagado */}
        <div>
          <label
            htmlFor="campo-monto"
            className="block text-base font-bold text-white mb-2 flex items-center gap-2"
          >
            <DollarSign className="w-5 h-5 text-amber-400" />
            <span>Total pagado en dólares ($)</span>
          </label>
          <input
            id="campo-monto"
            type="number"
            step="0.01"
            min="0.01"
            max="10000"
            inputMode="decimal"
            value={monto}
            onChange={(e) => setMonto(e.target.value.slice(0, 8))}
            placeholder="Ejemplo: 9.50"
            className="w-full min-h-[52px] bg-slate-950 border-2 border-slate-600 focus:border-amber-400 focus:bg-slate-900 rounded-2xl px-4 text-white text-base font-mono placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/40 transition"
            required
          />
        </div>

        {/* 4. Fecha de carga */}
        <div>
          <label
            htmlFor="campo-fecha"
            className="block text-base font-bold text-white mb-2 flex items-center gap-2"
          >
            <Calendar className="w-5 h-5 text-cyan-400" />
            <span>Fecha de la carga</span>
          </label>
          <input
            id="campo-fecha"
            type="date"
            max={hoy}
            min="2000-01-01"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full min-h-[52px] bg-slate-950 border-2 border-slate-600 focus:border-cyan-400 focus:bg-slate-900 rounded-2xl px-4 text-white text-base placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition cursor-pointer"
            required
          />
        </div>
      </div>

      {/* ÚNICO BOTÓN PRINCIPAL DE LA PANTALLA: «Guardar carga» */}
      <button
        type="submit"
        disabled={guardando}
        className="mt-6 w-full min-h-[58px] bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:opacity-50 text-slate-950 font-black text-lg py-4 px-6 rounded-2xl shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-3 transition cursor-pointer tracking-wide"
      >
        <PlusCircle className="w-6 h-6 stroke-[3]" />
        <span>{guardando ? 'Guardando...' : 'Guardar carga'}</span>
      </button>
    </form>
  );
};
