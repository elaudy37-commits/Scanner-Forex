# Forex Trend & Pullback Scanner

Sistema profesional de detección de señales de trading basado en confluencia de temporalidades (1H y 15M).

## Estrategia Implementada
- **Filtro de Tendencia (1H):** Precio > EMA 200, EMA 50 > EMA 200 y MACD Histograma > 0.
- **Entrada Pullback (15M):** Precio > EMA 50, RSI en zona de retroceso (~50) y cruce alcista de MACD.

## Requisitos
- Python 3.9+
- Node.js & Angular CLI
- API Key de TwelveData (o similar)

## Instalación

### Backend
1. Ir a carpeta `backend/`.
2. Instalar dependencias: `pip install -r requirements.txt`.
3. Ejecutar: `python app.py`.

### Frontend
1. Ir a carpeta `frontend/`.
2. Instalar dependencias: `npm install`.
3. Ejecutar: `ng serve`.
4. Abrir en navegador: `http://localhost:4200`.

## Tecnologías
- **Backend:** Flask, Pandas (Análisis de datos), Pandas-TA (Indicadores).
- **Frontend:** Angular, Bootstrap 5, RxJS.