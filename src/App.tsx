/**
 * APLICACIÓN: RENDIMIENTO
 * M3: Experiencia de uso en celular (mobile-first, 320px+, alto contraste, texto >= 16px).
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Fuel, Download, FileSpreadsheet, FileJson, RotateCcw, AlertCircle, X } from 'lucide-react';
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
  const [cargas, setCargas] = useState<CargaCombustible[]>(() => {
    return obtenerCargas();
  });

  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Sincronización continua en el almacenamiento local del teléfono
  useEffect(() => {
    guardarCargas(cargas);
  }, [cargas]);

  // Cálculos reactivos según método de tanque lleno
  const cargasCalculadas = useMemo(() => {
    return calcularRendimientoCargas(cargas);
  }, [cargas]);

  // Datos mensuales para el gráfico
  const datosMensuales = useMemo(() => {
    return agruparRendimientoPorMes(cargasCalculadas);
  }, [cargasCalculadas]);

  // Odómetro más alto registrado
  const ultimoKilometraje = useMemo(() => {
    if (cargas.length === 0) return null;
    return Math.max(...cargas.map((c) => c.kilometraje));
  }, [cargas]);

  // Manejo de nueva carga con mensaje de éxito visible y amigable
  const handleAgregarCarga = (nuevaCarga: Omit<CargaCombustible, 'id'>) => {
    const registro: CargaCombustible = {
      ...nuevaCarga,
      id: `carga_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };
    setCargas((prev) => [...prev, registro]);

    // Mensaje de éxito claro sin tecnicismos
    setMensajeExito('¡Carga guardada con éxito! Ya puedes ver el cálculo actualizado.');
    setTimeout(() => {
      setMensajeExito(null);
    }, 4500);
  };

  // Eliminar carga individual
  const handleEliminarCarga = (id: string) => {
    const actualizadas = eliminarCargaStorage(id);
    setCargas(actualizadas);
  };

  // Cargar las 3 cargas de prueba
  const handleCargarEjemplos = () => {
    setCargas(CARGAS_EJEMPLO_INICIALES);
    setMostrarOpciones(false);
    setMensajeExito('Se cargaron las 3 cargas de prueba.');
    setTimeout(() => setMensajeExito(null), 3000);
  };

  // Vaciar la bitácora
  const handleLimpiarTodo = () => {
    if (window.confirm('¿Deseas vaciar todas las cargas de tu bitácora?')) {
      setCargas([]);
      setMostrarOpciones(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-emerald-400 selection:text-black">
      {/* 
        Encabezado accesible con texto >= 16px y botones secundarios 
      */}
      <header className="border-b-2 border-slate-700 bg-slate-950 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-400 text-slate-950 flex items-center justify-center shadow-lg">
              <Fuel className="w-7 h-7 stroke-[3]" />
            </div>
            <div>
              <h1 className="font-black text-xl sm:text-2xl tracking-wide text-white">
                RENDIMIENTO
              </h1>
              <p className="text-base text-slate-300 font-bold">
                Moto y Carro al día
              </p>
            </div>
          </div>

          {/* Botón secundario para opciones de respaldo */}
          <button
            onClick={() => setMostrarOpciones(true)}
            type="button"
            className="min-h-[48px] px-4 py-2 rounded-2xl bg-slate-900 border-2 border-slate-600 text-slate-200 hover:text-white text-base font-bold flex items-center gap-2 active:bg-slate-800 transition cursor-pointer"
          >
            <Download className="w-5 h-5 text-emerald-400" />
            <span>Opciones</span>
          </button>
        </div>
      </header>

      {/* 
        Contenedor Mobile-First: adaptado desde 320px de ancho para uso con una sola mano 
      */}
      <main className="flex-1 max-w-lg mx-auto px-3.5 sm:px-4 py-6 w-full space-y-7">
        {/* 1. Formulario de registro (con el ÚNICO botón principal de la pantalla: «Guardar carga») */}
        <section aria-label="Formulario de Carga">
          <FormularioCarga
            onAgregarCarga={handleAgregarCarga}
            ultimoKilometraje={ultimoKilometraje}
            mensajeExito={mensajeExito}
          />
        </section>

        {/* 3. Gráfico de rendimiento mes a mes */}
        <section aria-label="Gráfico de Rendimiento">
          <GraficoMensual datosMensuales={datosMensuales} />
        </section>

        {/* 2. Lista de cargas o Estado Vacío */}
        <section aria-label="Historial de Cargas">
          <ListaCargas
            cargas={cargasCalculadas}
            onEliminarCarga={handleEliminarCarga}
            onCargarEjemplos={handleCargarEjemplos}
          />
        </section>

        {/* Pie informativo claro */}
        <footer className="pt-4 pb-10 text-center space-y-2">
          <p className="text-base text-slate-300 font-bold flex items-center justify-center gap-2">
            <AlertCircle className="w-5 h-5 text-emerald-400" />
            Tus datos quedan guardados en este celular.
          </p>
        </footer>
      </main>

      {/* 
        Modal / Menú de opciones secundarias (Respaldar, Exportar, Restaurar) 
      */}
      {mostrarOpciones && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-3">
          <div className="bg-slate-900 border-2 border-slate-600 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in slide-in-from-bottom">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <h3 className="text-xl font-black text-white">
                Opciones y Respaldo
              </h3>
              <button
                onClick={() => setMostrarOpciones(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-base text-slate-300 font-medium leading-relaxed">
              Descargá tu bitácora de combustible para guardarla o abrirla en Excel:
            </p>

            <div className="space-y-3 pt-1">
              <button
                onClick={() => {
                  exportarACsv(cargas);
                  setMostrarOpciones(false);
                }}
                className="w-full min-h-[50px] px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 text-left text-base font-bold text-white flex items-center gap-3 transition cursor-pointer"
              >
                <FileSpreadsheet className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <span className="block">Descargar archivo para Excel (CSV)</span>
                  <span className="text-base text-slate-400 font-normal">Ideal para ver tus gastos en hoja de cálculo</span>
                </div>
              </button>

              <button
                onClick={() => {
                  exportarAJson(cargas);
                  setMostrarOpciones(false);
                }}
                className="w-full min-h-[50px] px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 text-left text-base font-bold text-white flex items-center gap-3 transition cursor-pointer"
              >
                <FileJson className="w-6 h-6 text-indigo-400 shrink-0" />
                <div>
                  <span className="block">Descargar respaldo completo (JSON)</span>
                  <span className="text-base text-slate-400 font-normal">Copia de seguridad técnica</span>
                </div>
              </button>

              <button
                onClick={handleCargarEjemplos}
                className="w-full min-h-[48px] px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 text-left text-base font-bold text-cyan-300 flex items-center gap-3 transition cursor-pointer"
              >
                <RotateCcw className="w-5 h-5 text-cyan-400 shrink-0" />
                <span>Restaurar 3 cargas de prueba</span>
              </button>

              {cargas.length > 0 && (
                <button
                  onClick={handleLimpiarTodo}
                  className="w-full min-h-[48px] px-4 py-3 rounded-2xl bg-rose-950/60 hover:bg-rose-900 border-2 border-rose-500 text-left text-base font-bold text-rose-200 transition cursor-pointer"
                >
                  Vaciar todas las cargas de la bitácora
                </button>
              )}
            </div>

            <button
              onClick={() => setMostrarOpciones(false)}
              className="mt-2 w-full min-h-[48px] py-3 rounded-2xl bg-slate-800 border border-slate-700 text-base font-bold text-slate-300 text-center block"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
