/**
 * APLICACIÓN: RENDIMIENTO
 * Versión con Persistencia Local (localStorage) y Exportación CSV/JSON.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Fuel, Download, FileSpreadsheet, FileJson, RotateCcw, AlertCircle, Database } from 'lucide-react';
import { CargaCombustible } from './types';
import { FormularioCarga } from './components/FormularioCarga';
import { ListaCargas } from './components/ListaCargas';
import { GraficoMensual } from './components/GraficoMensual';
import { calcularRendimientoCargas, agruparRendimientoPorMes } from './utils/calculos';
import {
  obtenerCargas,
  guardarCargas,
  eliminarCarga as eliminarCargaStorage,
  exportarAJson,
  exportarACsv,
  CARGAS_EJEMPLO_INICIALES,
} from './utils/almacenamiento';

export default function App() {
  // Inicialización con lectura desde localStorage (o 3 cargas de ejemplo si es nuevo)
  const [cargas, setCargas] = useState<CargaCombustible[]>(() => {
    return obtenerCargas();
  });

  const [mostrarMenuExportar, setMostrarMenuExportar] = useState(false);

  // Sincronización automática a localStorage ante cualquier cambio
  useEffect(() => {
    guardarCargas(cargas);
  }, [cargas]);

  /**
   * Cálculo reactivo de rendimiento según el método de tanque lleno
   */
  const cargasCalculadas = useMemo(() => {
    return calcularRendimientoCargas(cargas);
  }, [cargas]);

  /**
   * Agregación mensual ponderada para el gráfico
   */
  const datosMensuales = useMemo(() => {
    return agruparRendimientoPorMes(cargasCalculadas);
  }, [cargasCalculadas]);

  // Odómetro más alto para guiar al usuario
  const ultimoKilometraje = useMemo(() => {
    if (cargas.length === 0) return null;
    return Math.max(...cargas.map((c) => c.kilometraje));
  }, [cargas]);

  // Registrar nueva carga
  const handleAgregarCarga = (nuevaCarga: Omit<CargaCombustible, 'id'>) => {
    const registro: CargaCombustible = {
      ...nuevaCarga,
      id: `carga_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };
    setCargas((prev) => [...prev, registro]);
  };

  // Eliminar carga individual
  const handleEliminarCarga = (id: string) => {
    const actualizadas = eliminarCargaStorage(id);
    setCargas(actualizadas);
  };

  // Restaurar las 3 cargas de ejemplo
  const handleRestaurarEjemplos = () => {
    if (window.confirm('¿Deseas restaurar las 3 cargas de ejemplo iniciales?')) {
      setCargas(CARGAS_EJEMPLO_INICIALES);
      setMostrarMenuExportar(false);
    }
  };

  // Limpiar todos los registros
  const handleLimpiarTodo = () => {
    if (window.confirm('¿Seguro que deseas vaciar toda la bitácora de cargas?')) {
      setCargas([]);
      setMostrarMenuExportar(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Encabezado fijo optimizado para celular */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Fuel className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-wider text-white">
                RENDIMIENTO
              </h1>
              <p className="text-[10px] text-slate-400 font-medium -mt-1 tracking-tight flex items-center gap-1">
                <Database className="w-2.5 h-2.5 text-emerald-400" />
                Bitácora guardada en el dispositivo
              </p>
            </div>
          </div>

          {/* Menú de respaldo y opciones */}
          <div className="relative">
            <button
              onClick={() => setMostrarMenuExportar((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-xs font-medium text-slate-200 shadow-sm transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Respaldar</span>
            </button>

            {mostrarMenuExportar && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95">
                <div className="px-2.5 py-1.5 text-[10px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 mb-1">
                  Exportar Bitácora
                </div>

                <button
                  onClick={() => {
                    exportarACsv(cargas);
                    setMostrarMenuExportar(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2.5 transition cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="font-medium block">Exportar a CSV</span>
                    <span className="text-[10px] text-slate-400">Para Excel y Google Sheets</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    exportarAJson(cargas);
                    setMostrarMenuExportar(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2.5 transition cursor-pointer"
                >
                  <FileJson className="w-4 h-4 text-indigo-400" />
                  <div>
                    <span className="font-medium block">Exportar a JSON</span>
                    <span className="text-[10px] text-slate-400">Respaldo técnico completo</span>
                  </div>
                </button>

                <div className="border-t border-slate-800 my-1" />

                <button
                  onClick={handleRestaurarEjemplos}
                  className="w-full text-left px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200 flex items-center gap-2 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Restaurar 3 ejemplos</span>
                </button>

                <button
                  onClick={handleLimpiarTodo}
                  className="w-full text-left px-3 py-1.5 rounded-xl text-xs text-rose-400 hover:bg-rose-950/30 flex items-center gap-2 transition cursor-pointer"
                >
                  <span>Vaciar toda la bitácora</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Contenido principal Mobile-First */}
      <main className="flex-1 max-w-2xl mx-auto px-4 py-5 w-full space-y-6">
        {/* 1. Formulario para registrar carga */}
        <section aria-label="Formulario de Carga">
          <FormularioCarga
            onAgregarCarga={handleAgregarCarga}
            ultimoKilometraje={ultimoKilometraje}
          />
        </section>

        {/* 3. Gráfico simple de rendimiento mes a mes */}
        <section aria-label="Gráfico de Rendimiento Mensual">
          <GraficoMensual datosMensuales={datosMensuales} />
        </section>

        {/* 2. Lista de cargas con cálculo de km/galón y $/km */}
        <section aria-label="Historial de Cargas">
          <ListaCargas
            cargas={cargasCalculadas}
            onEliminarCarga={handleEliminarCarga}
          />
        </section>

        {/* Información educativa sobre el método de tanque lleno y persistencia */}
        <footer className="pt-2 pb-6 text-center text-xs text-slate-500 space-y-1">
          <p className="flex items-center justify-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
            Tus datos se guardan automáticamente en este navegador con <strong>localStorage</strong>.
          </p>
          <p className="text-[11px] text-slate-600">
            Fórmulas: (km actual - km anterior) / galones &bull; costo / km recorridos
          </p>
        </footer>
      </main>
    </div>
  );
}
