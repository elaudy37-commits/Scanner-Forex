#  Forex Scanner & Telegram Bot

Este proyecto es un escáner de mercados financieros automatizado que utiliza **MetaTrader 5** para obtener datos en tiempo real y analiza estrategias basadas en indicadores técnicos. Cuando se detecta una señal, el sistema envía una notificación automática a un canal de **Telegram**.

##  Características
- **Análisis Multi-Timeframe:** Escaneo en H1 y M15.
- **Estrategia Técnica:** Basada en EMA 50/200, RSI y MACD.
- **Notificaciones en tiempo real:** Alertas directas a Telegram mediante un Bot.
- **Dashboard API:** Backend desarrollado en Flask para servir los datos al Frontend.

##  Tecnologías utilizadas
- **Backend:** Python 3.x, Flask, MetaTrader5 API.
- **Análisis de Datos:** Pandas, Pandas-TA (Technical Analysis Library).
- **Frontend:** Angular.
- **Seguridad:** Variables de entorno para protección de API Keys.

##  Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone [https://github.com/tu-usuario/Scanner-Forex.git](https://github.com/tu-usuario/Scanner-Forex.git)
