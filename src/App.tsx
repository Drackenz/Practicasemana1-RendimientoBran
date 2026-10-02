/**
 * APLICACIÓN: RENDIMIENTO
 * Versión 1.0 funcional para control de combustible en moto o carro.
 * 
 * Cumple estrictamente con las 3 funciones solicitadas:
 * 1. Registro de cargas (fecha, monto $, galones, odómetro km).
 * 2. Cálculo de km/galón y costo/km por método de tanque lleno.
 * 3. Gráfico simple de rendimiento mes a mes.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Fuel, RefreshCw, Sparkles, AlertCircle } from 'lucide-react';
import { CargaCombustible } from './types';
import { FormularioCarga } from './components/FormularioCarga';
import { ListaCargas } from './components/ListaCargas';
import { GraficoMensual } from './components/GraficoMensual';
import { calcularRendimientoCargas, agruparRendimientoPorMes } from './utils/calculos';

const CLAVE_LOCALSTORAGE = 'rendimiento_cargas_combustible_v1';

export default function App() {
  // Estado principal de cargas almacenadas en localStorage para persistencia en móvil sin backend
  const [cargas, setCargas] = useState<CargaCombustible[]>(() => {
    try {
      const guardadas = localStorage.getItem(CLAVE_LOCALSTORAGE);
      if (guardadas) {
        return JSON.parse(guardadas);
      }
    } catch (e) {
      console.error('Error al leer de localStorage:', e);
    }
    return [];
  });

  // Guardar en localStorage ante cualquier cambio
  useEffect(() => {
    try {
      localStorage.setItem(CLAVE_LOCALSTORAGE, JSON.stringify(cargas));
    } catch (e) {
      console.error('Error al guardar en localStorage:', e);
    }
  }, [cargas]);

  /**
   * CÁLCULO DE RENDIMIENTO REACTIVO:
   * useMemo reprocesa la cadena de cálculos solo cuando cambia la lista de cargas.
   * Resuelve el método de tanque lleno y previene divisiones por cero.
   */
  const cargasCalculadas = useMemo(() => {
    return calcularRendimientoCargas(cargas);
  }, [cargas]);

  /**
   * AGREGACIÓN MENSUAL PARA EL GRÁFICO:
   * Agrupa los consumos y distancias mes a mes ponderadamente.
   */
  const datosMensuales = useMemo(() => {
    return agruparRendimientoPorMes(cargasCalculadas);
  }, [cargasCalculadas]);

  // Obtener el kilometraje del registro más alto para orientar al usuario en el formulario
  const ultimoKilometraje = useMemo(() => {
    if (cargas.length === 0) return null;
    return Math.max(...cargas.map((c) => c.kilometraje));
  }, [cargas]);

  // Handler para agregar una nueva carga
  const handleAgregarCarga = (nuevaCarga: Omit<CargaCombustible, 'id'>) => {
    const registro: CargaCombustible = {
      ...nuevaCarga,
      id: `carga_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };
    setCargas((prev) => [...prev, registro]);
  };

  // Handler para eliminar un registro
  const handleEliminarCarga = (id: string) => {
    setCargas((prev) => prev.filter((c) => c.id !== id));
  };

  // Acción rápida para cargar los datos exactos del Criterio de Aceptación
  const handleCargarEjemploCriterio = () => {
    const cargasEjemplo: CargaCombustible[] = [
      {
        id: 'ejemplo_1',
        fecha: '2026-09-15',
        monto: 8.50,
        galones: 2.2,
        kilometraje: 12450,
      },
      {
        id: 'ejemplo_2',
        fecha: '2026-09-22',
        monto: 9.50,
        galones: 2.5,
        kilometraje: 12610,
      },
    ];
    setCargas(cargasEjemplo);
  };

  // Limpiar todos los datos
  const handleLimpiarTodo = () => {
    if (window.confirm('¿Seguro que deseas borrar todos los registros guardados?')) {
      setCargas([]);
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
              <p className="text-[10px] text-slate-400 font-medium -mt-1 tracking-tight">
                Control de combustible en moto o carro
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cargas.length > 0 && (
              <button
                onClick={handleLimpiarTodo}
                className="text-xs text-slate-500 hover:text-rose-400 p-2 rounded-lg transition"
                title="Borrar todos los datos"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Contenido principal Mobile-First */}
      <main className="flex-1 max-w-2xl mx-auto px-4 py-5 w-full space-y-6">
        {/* Banner de prueba rápida del criterio de aceptación */}
        {cargas.length === 0 && (
          <div className="bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 text-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white mb-1">
                  ¿Quieres probar el criterio de aceptación rápidamente?
                </p>
                <p className="text-slate-300 leading-relaxed">
                  Carga automáticamente el caso de prueba: <strong>12,450 km</strong> inicial y <strong>12,610 km</strong> con <strong>2.5 galones</strong> y <strong>$9.50</strong>.
                </p>
                <button
                  onClick={handleCargarEjemploCriterio}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium text-xs shadow transition cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  Cargar datos de prueba (12,450 y 12,610 km)
                </button>
              </div>
            </div>
          </div>
        )}

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

        {/* Información educativa sobre el método de tanque lleno */}
        <footer className="pt-2 pb-6 text-center text-xs text-slate-500 space-y-1">
          <p className="flex items-center justify-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
            Método de tanque lleno: el rendimiento se calcula a partir de la 2ª carga.
          </p>
          <p className="text-[11px] text-slate-600">
            Fórmulas: (km actual - km anterior) / galones &bull; costo / km recorridos
          </p>
        </footer>
      </main>
    </div>
  );
}
