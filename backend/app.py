import threading
import time
import requests
import MetaTrader5 as mt5
import pandas as pd
import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from logic.indicators import calculate_indicators, check_strategy

# 1. Cargar las variables del archivo .env
load_dotenv()

app = Flask(__name__)
CORS(app)

# 2. Configuración Segura (Lee del archivo .env)
TELEGRAM_TOKEN = os.getenv('TELEGRAM_TOKEN')
CHAT_ID = os.getenv('TELEGRAM_CHAT_ID')
SYMBOLS = ['EURUSD', 'GBPUSD', 'USDJPY']

latest_data = []
# Tracker para evitar spam de mensajes
notification_tracker = {symbol: {"state": "NEUTRAL", "last_msg": 0} for symbol in SYMBOLS}

def send_telegram(msg):
    if not TELEGRAM_TOKEN or not CHAT_ID:
        print("⚠️ Error: No se han encontrado credenciales en el .env")
        return
    try:
        url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
        data = {"chat_id": CHAT_ID, "text": msg, "parse_mode": "HTML"}
        requests.post(url, json=data, timeout=5)
    except Exception as e:
        print(f"⚠️ Error Telegram: {e}")

def get_mt5_data(symbol, timeframe, n=250):
    rates = mt5.copy_rates_from_pos(symbol, timeframe, 0, n)
    if rates is None or len(rates) == 0:
        return None
    df = pd.DataFrame(rates)
    df.rename(columns={'tick_volume': 'volume'}, inplace=True)
    return df

def background_scanner():
    global latest_data
    
    if not mt5.initialize():
        print("❌ Error al conectar con MT5")
        return

    # Manda un saludo inicial para confirmar que el bot vive
    send_telegram("<b>¡Escáner Online!</b>\nConexión con MT5 establecida. Vigilando mercados...")
    print("Scanner con Telegram Activo")
    
    while True:
        temp_results = []
        for symbol in SYMBOLS:
            mt5.symbol_select(symbol, True)
            df_1h = get_mt5_data(symbol, mt5.TIMEFRAME_H1)
            df_15m = get_mt5_data(symbol, mt5.TIMEFRAME_M15)
            
            if df_1h is not None and df_15m is not None:
                df_1h_p = calculate_indicators(df_1h)
                df_15m_p = calculate_indicators(df_15m)
                signal = check_strategy(df_1h_p, df_15m_p)
                
                current_time = time.time()
                
                # --- LÓGICA DE NOTIFICACIONES ---
                if signal in ['BUY', 'SELL'] and notification_tracker[symbol]["state"] != signal:
                    msg = f"🟢 <b>¡ENTRADA CONFIRMADA!</b>\n\n<b>Par:</b> {symbol}\n<b>Señal:</b> {signal}\n<b>Precio:</b> {df_15m_p.iloc[-1]['close']}"
                    send_telegram(msg)
                    notification_tracker[symbol] = {"state": signal, "last_msg": current_time}

                elif "ESPERANDO" in signal and signal != "ESPERANDO TENDENCIA":
                    if notification_tracker[symbol]["state"] != "PRE-ALERTA" or (current_time - notification_tracker[symbol]["last_msg"] > 900):
                        msg = f"🟠 <b>PRE-ALERTA: {symbol}</b>\n\n<b>Estado:</b> {signal}\n<b>Nota:</b> El precio ha testeado la zona de valor. Prepárate."
                        send_telegram(msg)
                        notification_tracker[symbol] = {"state": "PRE-ALERTA", "last_msg": current_time}
                
                elif signal in ["ESPERANDO TENDENCIA", "NEUTRAL"]:
                    notification_tracker[symbol]["state"] = "NEUTRAL"

                temp_results.append({
                    'symbol': symbol,
                    'signal': signal,
                    'price': float(df_15m_p.iloc[-1]['close']),
                    'rsi': round(float(df_15m_p.iloc[-1]['rsi']), 2),
                    'ema50_1h': round(float(df_1h_p.iloc[-1]['ema50']), 5),
                    'ema200_1h': round(float(df_1h_p.iloc[-1]['ema200']), 5),
                    'status': 'success'
                })
        
        latest_data = temp_results
        time.sleep(1)

@app.route('/api/signals', methods=['GET'])
def get_signals():
    return jsonify(latest_data)

if __name__ == '__main__':
    threading.Thread(target=background_scanner, daemon=True).start()
    app.run(host='127.0.0.1', port=5000, debug=False)