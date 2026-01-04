import pandas as pd
import pandas_ta as ta

def calculate_indicators(df):
    # Aseguramos que los datos sean de tipo float
    df['close'] = df['close'].astype(float)
    df['high'] = df['high'].astype(float)
    df['low'] = df['low'].astype(float)

    # Cálculo de EMAs (Exactamente como en MT5: Exponencial)
    df['ema50'] = ta.ema(df['close'], length=50)
    df['ema200'] = ta.ema(df['close'], length=200)
    
    # Cálculo de RSI
    df['rsi'] = ta.rsi(df['close'], length=14)
    
    # Cálculo de MACD (12, 26, 9)
    macd = ta.macd(df['close'], fast=12, slow=26, signal=9)
    df = pd.concat([df, macd], axis=1)
    
    return df

def check_strategy(df_1h, df_15m):
    # Obtenemos la última vela cerrada y la actual
    l1h = df_1h.iloc[-1]
    l15 = df_15m.iloc[-1]
    
    # --- 1. FILTRO DE TENDENCIA 1H ---
    # Para Compras: Precio > EMA50 > EMA200
    compras_1h = l1h['close'] > l1h['ema50'] > l1h['ema200']
    # Para Ventas: Precio < EMA50 < EMA200
    ventas_1h = l1h['close'] < l1h['ema50'] < l1h['ema200']

    if not compras_1h and not ventas_1h:
        return "ESPERANDO TENDENCIA"

    # --- 2. LÓGICA DE REBOTE EN 15M (PRECISIÓN MÁXIMA) ---
    # Margen de 0.2 pips para evitar errores de redondeo (0.00002)
    margen = 0.00002 

    # Condición de toque de EMA en 15 minutos
    # En compras buscamos que el LOW toque la parte superior de la EMA
    toca_ema_c = (l15['low'] <= l15['ema50'] + margen) or (l15['low'] <= l15['ema200'] + margen)
    
    # En ventas buscamos que el HIGH toque la parte inferior de la EMA
    toca_ema_v = (l15['high'] >= l15['ema50'] - margen) or (l15['high'] >= l15['ema200'] - margen)

    # --- 3. VERIFICACIÓN DE INDICADORES (GATILLO) ---
    
    # Lógica para COMPRAS
    if compras_1h:
        if not toca_ema_c:
            return "ESPERANDO TENDENCIA" # Silencio si está lejos de la EMA
        
        # Si toca la EMA, verificamos confirmaciones
        if l15['rsi'] < 50:
            return "RSI < 50"
        
        # MACD_12_26_9 es la línea azul, MACDs_12_26_9 es la señal (naranja/roja)
        if l15['MACD_12_26_9'] < l15['MACDs_12_26_9']:
            return "ESPERANDO MACD"
            
        return "BUY"

    # Lógica para VENTAS
    if ventas_1h:
        if not toca_ema_v:
            return "ESPERANDO TENDENCIA" # Silencio si está lejos de la EMA
        
        # Si toca la EMA, verificamos confirmaciones
        if l15['rsi'] > 50:
            return "RSI > 50"
            
        if l15['MACD_12_26_9'] > l15['MACDs_12_26_9']:
            return "ESPERANDO MACD"
            
        return "SELL"

    return "NEUTRAL"