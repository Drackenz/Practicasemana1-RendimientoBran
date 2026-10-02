# RENDIMIENTO

> Calcula cuánto rinde tu moto o carro por galón y cuánto te cuesta cada kilómetro, y avisa cuándo empezó a rendir menos.

## 1. Probala ahora
- **App publicada:** https://drackenz.github.io/Practicasemana1-RendimientoBran/
- **Código QR:** ![QR](evidencias/qr.png)
- **Usuario de prueba:** no requiere (los datos se guardan de forma local en tu dispositivo)

## 2. Capturas
| Inicio | En uso | Con la IA trabajando |
|---|---|---|
| ![](evidencias/E3-celular.png) | ![](evidencias/E1-despues.png) | ![](evidencias/E5-app.png) |

## 3. Qué hace
- Registra cargas de combustible con fecha, monto, galones y kilometraje.
- Calcula kilómetros por galón y costo por kilómetro según el método físico de tanque lleno.
- Muestra un gráfico del rendimiento mes a mes con detección de tendencia.
- La IA detecta el mes en que cayó el rendimiento y sugiere qué revisar primero, ordenado por costo.

## 4. Cómo correrlo en tu máquina
```bash
git clone https://github.com/Drackenz/Practicasemana1-RendimientoBran.git
cd Practicasemana1-RendimientoBran
# si usa API:
cp .env.example .env      # y escribí tu propia llave GEMINI_API_KEY
npm install
npm run dev
```

## 5. Tecnologías
- **Lenguaje:** TypeScript y JavaScript moderno (ESNext).
- **Interfaz y diseño:** React 19, Tailwind CSS v4, Lucide React.
- **Backend Proxy & Servidor:** Express.js y Node.js (`server.ts`) para llamadas seguras y protegidas a la IA.
- **Persistencia:** `localStorage` nativo del navegador (sin base de datos externa obligatoria).
- **Modelo de IA:** Gemini 3.8 Flash (`gemini-3.8-flash`) vía SDK oficial `@google/genai` con respuesta estructurada estricta (`responseSchema` en JSON).

## 6. La escalera de mejoras
| Peldaño | Qué cambió | Commit | Evidencia |
|---|---|---|---|
| P0 | Versión inicial generada con IA | `90f6678` | E0-inicial.png |
| M1 | Gráfico de rendimiento mes a mes | `f5d727b` | E1-antes / E1-despues |
| M2 | Persistencia de la bitácora de cargas | `cdbb2b2` | E2-antes / E2-despues |
| M3 | Experiencia en celular | `8724918` | E3-celular / E3-vacio |
| M4 | Validaciones y manejo de errores | `0b7e174` | E4-error.png |
| M5 | Inteligencia con JSON y diagnóstico Gemini | `df9a673` | E5-json / E5-app / E5-falla |

## 7. Prueba con usuarios reales
| Quién | Qué intentó | Dónde se trabó | Lo que dijo, textual | ¿Corregido? |
|---|---|---|---|---|
| Compañero de clase | Ingresar dos cargas consecutivas con el mismo kilometraje | División entre cero en costo/km | «Me dio infinito en el costo por kilómetro y se rompió la tarjeta» | Sí, en M4 |
| Motociclista del centro | Registrar una carga al mediodía bajo el sol desde su teléfono | Letras pequeñas y poco contraste | «No se lee bien con el reflejo del sol y las letras están muy chicas» | Sí, en M3 |
| Conductor particular | Registrar una carga comprada en litros | Unidad de volumen fija en galones | «Aquí en la bomba cargamos por litros, me tocó sacar la calculadora» | No, queda pendiente para siguiente versión |

## 8. Declaración de uso de inteligencia artificial
- **Herramienta y modelo:** Google Gemini 3.8 Flash (`gemini-3.8-flash`) y Google AI Studio.
- **Qué hizo la IA:** Generó la estructura reactiva de componentes, apoyó en el diseño accesible de alto contraste y procesa el análisis mecánico estructurado en JSON.
- **Qué hice yo:** Diseñé los casos de prueba de QA, supervisé los criterios de aceptación mecánicos, implementé la protección del backend proxy y validé los límites numéricos.
- **Qué verifiqué y cómo:** Verifiqué que la primera carga funcione estrictamente como punto base (sin calcular km/gal erróneos); probé la persistencia en `localStorage` al recargar; y verifiqué que las fallas de red no bloqueen la app.
- **Qué corregí de lo que la IA entregó:** Corregí el intento inicial de calcular rendimiento en la primera carga sin datos previos; ajusté el tamaño de fuente mínimo a 16 px para evitar el auto-zoom intrusivo de iOS; y separé la API key en el backend para evitar su exposición pública.

## 9. Tarjeta anti-alucinación
| Afirmación de la IA | Cómo la verifiqué | Resultado |
|---|---|---|
| "Se puede calcular el rendimiento desde la primera carga dividiendo el odómetro entre galones" | Revisé la física del método de tanque lleno: no sabemos cuántos km rindió ese combustible hasta volver a llenar | Falso. La primera carga solo fija el punto de partida. Corregido en `calculos.ts`. |
| "Guardar la GEMINI_API_KEY en variables de cliente (VITE_) es seguro para producción" | Abrí las herramientas de desarrollo del navegador (DevTools / Red / Fuentes) | Falso. La clave se puede extraer del código cliente. Se migró a proxy backend en `server.ts`. |
| "Un kilometraje menor al anterior es un error de digitación que debe bloquearse" | Verifiqué el funcionamiento estándar de odómetros mecánicos y digitales | Verdadero. Se bloqueó para evitar distancias negativas y desbordamientos. |

## 10. Limitaciones conocidas
- Solo admite galones y dólares estadounidenses ($ USD); aún no incluye conversión a litros ni monedas locales.
- Bitácora para un solo vehículo activo en el navegador (no admite perfiles simultáneos para flota).
- La llamada a la IA requiere conexión a internet (aunque dispone de modo de prueba simulado para desarrollo y emergencias).

## 11. Próximo paso
- Selector dinámico de unidades (Litros / Galones y Kilómetros / Millas).
- Gestión multivehículo (guardar moto y carro por separado en la misma cuenta).
- Exportación a reporte PDF para presentar en mantenimientos mecánicos.
- PWA instalable con Service Worker para funcionamiento 100% offline.

## 12. Autor
Brandon · 3.er año Desarrollo de Software · INDEL · octubre de 2026

## 13. Licencia
MIT License (Código abierto para la comunidad estudiantil y motera).
