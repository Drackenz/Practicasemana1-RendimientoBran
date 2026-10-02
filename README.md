# RENDIMIENTO 🏍️🚗

Aplicación web móvil para personas que utilizan moto o carro todos los días y necesitan responder la pregunta: **"¿Mi vehículo rinde igual que el mes pasado?"**

---

## 🚀 Funcionalidades

1. **Registro de Cargas de Combustible:**
   - Fecha de carga.
   - Odómetro / Kilometraje del tablero.
   - Galones cargados.
   - Monto pagado en dólares ($ USD).

2. **Cálculo de Rendimiento (Método de Tanque Lleno):**
   - **Km recorridos:** diferencia entre el kilometraje actual y el de la carga previa.
   - **Rendimiento (km/gal):** $\frac{\text{Km recorridos}}{\text{Galones actuales}}$.
   - **Costo por km ($/km):** $\frac{\text{Monto pagado}}{\text{Km recorridos}}$.

3. **Gráfico de Rendimiento Mes a Mes:**
   - Visualización interactiva en barras SVG nativas.
   - Promedio ponderado de rendimiento de cada mes ($\frac{\sum \text{km}}{\sum \text{gal}}$).
   - Indicador de tendencia (+ o - km/gal vs mes anterior).
   - Selección interactiva de meses para ver detalle de consumo y costo.

4. **Persistencia Local y Respaldo (M2):**
   - Almacenamiento automático y seguro en `localStorage` del navegador.
   - Exportación de la bitácora a formato **CSV** (compatible con Excel / Google Sheets).
   - Exportación a formato **JSON** (para respaldo y migración).

5. **Experiencia de Uso en Celular (M3):**
   - Adaptada para pantallas estrechas desde **320 px de ancho** y operable con una sola mano.
   - Contraste optimizado para lectura bajo el sol en moto/carro; tipografía **nunca menor a 16 px**.
   - Todos los campos con etiquetas visibles sobre los campos.
   - Jerarquía visual estricta: un único botón principal destacado (**«Guardar carga»**).
   - Estado vacío acogedor con invitación clara a registrar la primera carga.
   - Mensajes de éxito y error visibles, en español coloquial y sin tecnicismos.

---

## 🧪 Prueba Manual de 3 Pasos

1. **Paso 1: Estado inicial**
   - Registra una primera carga de referencia (ej. `12,450 km`, `$8.50`, `2.2 gal`, `2026-09-15`).
   - El sistema guarda la base sin calcular km/gal erróneos y el gráfico avisa que se requieren 2 cargas consecutivas.
2. **Paso 2: Rendimiento de la segunda carga**
   - Registra la segunda carga (ej. `12,610 km`, `$9.50`, `2.5 gal`, `2026-09-22`).
   - El historial muestra: **160 km recorridos**, **64.0 km/gal** y **$0.0594 / km**.
   - El gráfico muestra la barra de **Sep 2026** con **64.0 km/gal**.
3. **Paso 3: Comparativa mes a mes**
   - Registra una carga en el mes siguiente (ej. `12,850 km`, `$12.00`, `3.2 gal`, `2026-10-05`).
   - El gráfico despliega dos barras consecutivas (**Sep 2026** y **Oct 2026** a 75.0 km/gal) y el indicador de mejora **"+11.0 km/gal vs mes anterior"**.

---

## 🛡️ Prevención de Errores Matemáticos
- **No promedia promedios:** la agregación mensual suma km totales y divide entre galones totales.
- **División por cero protegida:** validaciones si los galones son $\le 0$ o si el odómetro es menor/igual al anterior.
- **Orden cronológico garantizado:** si el usuario ingresa una carga atrasada, se recalcula automáticamente comparando con la carga contigua en odómetro.
