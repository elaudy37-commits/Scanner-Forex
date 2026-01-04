import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ForexService } from '../../services/forex.service';
import { PairSignal } from '../../models/forex.model';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-wrapper">
      <div class="galaxy-motion-bg"></div>
      <div class="vignette"></div>

      <div class="container-fluid py-4 content-area">
        <header class="d-flex justify-content-between align-items-center mb-5 header-glass">
          <div class="brand-box">
            <h1 class="glow-text">CORE-SYSTEM <span class="v-line">|</span> <span class="sub-logo">ESCÁNER FOREX</span></h1>
            <div class="market-info" [ngClass]="isMarketOpen ? 'text-cyan' : 'text-danger'">
               <span class="dot" [class.pulse-blue]="isMarketOpen"></span>
               {{ marketLabel }}
            </div>
          </div>
          <div class="time-box">
            <div class="digital-clock">{{ currentTimeES }}</div>
          </div>
        </header>

        <div class="trading-grid">
          <div *ngFor="let pair of signals" class="card-futuristic" [ngClass]="getCardTheme(pair)">
            
            <div class="pair-header">
              <h3 class="symbol-name"><span>🌐</span> {{ pair.symbol }}</h3>
              <div class="current-price" [class.text-up]="pair.signal === 'BUY'" [class.text-down]="pair.signal === 'SELL'">
                {{ pair.price | number:'1.5-5' }}
              </div>
            </div>

            <div class="stats-grid">
              <div class="stat-item">
                <span class="label">📊 TENDENCIA (1H)</span>
                <span class="value" [ngClass]="getTrendClass(pair)">
                  {{ getTrendIcon(pair) }} {{ getTrendText(pair) }}
                </span>
              </div>
              
              <div class="stat-item">
                <span class="label">📈 RSI (15M)</span>
                <div class="rsi-bar-container">
                  <div class="rsi-bar" [style.width.%]="pair.rsi" [ngClass]="getRsiClass(pair.rsi)"></div>
                  <span class="rsi-value">{{ pair.rsi | number:'1.1-1' }}%</span>
                </div>
              </div>
            </div>

            <div class="action-footer">
              <div class="action-badge" [ngClass]="getSignalBtnClass(pair.signal)">
                 {{ getSignalIcon(pair.signal) }} {{ pair.signal }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { --cyan: #00f2ff; --pink: #ff3131; --gold: #ffcc00; --dark: #020408; --card-bg: rgba(15, 23, 42, 0.85); }

    .dashboard-wrapper { background: var(--dark); min-height: 100vh; color: white; font-family: 'Orbitron', sans-serif; position: relative; overflow: hidden; }

    /* GRID FORZADO A 3 COLUMNAS */
    .trading-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; position: relative; z-index: 10; }
    @media (max-width: 1200px) { .trading-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 800px) { .trading-grid { grid-template-columns: 1fr; } }

    /* GALAXIA RÁPIDA */
    .galaxy-motion-bg {
      position: fixed; top: -20%; left: -20%; width: 140%; height: 140%;
      background-image: url('https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=2000&q=80');
      background-size: cover; z-index: 1; animation: galaxyDrift 20s linear infinite alternate; opacity: 0.8;
    }
    @keyframes galaxyDrift { 0% { transform: translate(0, 0) scale(1) rotate(0deg); } 100% { transform: translate(-8%, -5%) scale(1.15) rotate(2deg); } }
    .vignette { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: radial-gradient(circle, transparent 20%, rgba(0,0,0,0.9) 100%); z-index: 2; }

    /* ESTADO LATERAL VISIBLE */
    .text-muted { color: var(--gold) !important; font-weight: 800; text-shadow: 0 0 5px rgba(255, 204, 0, 0.3); }

    /* RESTO DE ESTILOS ORIGINALES */
    .content-area { position: relative; z-index: 10; }
    .header-glass { background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(15px); padding: 20px 40px; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 0 0 20px 20px; }
    .glow-text { font-weight: 800; letter-spacing: 4px; text-shadow: 0 0 10px var(--cyan); }
    .digital-clock { font-size: 1.5rem; color: var(--cyan); text-shadow: 0 0 10px var(--cyan); }
    .market-info { font-size: 0.8rem; font-weight: bold; margin-top: 5px; display: flex; align-items: center; gap: 8px; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
    .card-futuristic { background: var(--card-bg); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 188px; padding: 25px; border-radius: 18px; }
    .current-price { font-size: 2.2rem; font-weight: bold; font-family: 'Courier New', monospace; }
    .stats-grid { display: grid; grid-template-columns: 1fr; gap: 20px; margin-top: 20px; }
    .label { display: block; font-size: 0.75rem; color: #94a3b8; font-weight: bold; margin-bottom: 8px; }
    .rsi-bar-container { height: 10px; background: rgba(0,0,0,0.4); border-radius: 5px; position: relative; }
    .rsi-bar { height: 100%; border-radius: 5px; }
    .rsi-value { position: absolute; right: 0; top: -20px; font-size: 0.85rem; font-weight: bold; color: var(--cyan); }
    .action-badge { text-align: center; padding: 14px; border-radius: 10px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; margin-top: 20px; border: 1px solid transparent; }
    .bg-buy { background: rgba(0, 255, 136, 0.1); color: #00ff88; border-color: #00ff88; }
    .bg-sell { background: rgba(255, 49, 49, 0.1); color: #ff3131; border-color: #ff3131; }
    .bg-neutral { background: rgba(255, 255, 255, 0.05); color: #94a3b8; border-color: rgba(255, 255, 255, 0.1); }
    .text-up { color: #00ff88; }
    .text-down { color: #ff3131; }
    .text-success { color: #00ff88; }
    .text-danger { color: #ff3131; }
    .text-cyan { color: var(--cyan); }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  signals: PairSignal[] = [];
  currentTimeES: string = '';
  marketLabel: string = '';
  isMarketOpen: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(private forexService: ForexService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.updateTick();
    interval(1000).pipe(takeUntil(this.destroy$)).subscribe(() => this.updateTick());
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  updateTick() {
    this.loadData();
    const now = new Date();
    this.currentTimeES = new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(now);
    this.calculateMarketSessions(now);
    this.cdr.detectChanges();
  }

  loadData() {
    this.forexService.getSignals().subscribe(data => {
      this.signals = data;
    });
  }

  calculateMarketSessions(now: Date) {
    const hourES = now.getHours();
    const day = now.getDay();
    const isWeekend = (day === 6) || (day === 5 && hourES >= 23) || (day === 0 && hourES < 23);

    if (isWeekend) {
      this.isMarketOpen = false;
      this.marketLabel = 'MERCADO CERRADO';
    } else {
      this.isMarketOpen = true;
      if (hourES >= 9 && hourES < 18) this.marketLabel = 'SESIÓN LONDRES ABIERTA';
      else if (hourES >= 14 && hourES < 22) this.marketLabel = 'SESIÓN NEW YORK ABIERTA';
      else if (hourES >= 23 || hourES < 9) this.marketLabel = 'SESIÓN ASIA ABIERTA';
      else this.marketLabel = 'MERCADO ABIERTO';
    }
  }

  getTrendText(p: any): string {
    if (p.price > p.ema50_1h && p.ema50_1h > p.ema200_1h) return 'ALCISTA';
    if (p.price < p.ema50_1h && p.ema50_1h < p.ema200_1h) return 'BAJISTA';
    return 'LATERAL';
  }

  getTrendIcon(p: any): string {
    const text = this.getTrendText(p);
    return text === 'ALCISTA' ? '▲' : text === 'BAJISTA' ? '▼' : '◀▶';
  }

  getTrendClass(p: any): string {
    const text = this.getTrendText(p);
    return text === 'ALCISTA' ? 'text-success' : text === 'BAJISTA' ? 'text-danger' : 'text-muted';
  }

  getRsiClass(rsi: number): string {
    if (rsi > 70) return 'bg-danger';
    if (rsi < 30) return 'bg-success';
    return 'bg-info';
  }

  getSignalIcon(s: string): string {
    if (s === 'BUY') return '🟢';
    if (s === 'SELL') return '🔴';
    return '⚪';
  }

  getSignalBtnClass(s: string): string {
    if (s === 'BUY') return 'bg-buy';
    if (s === 'SELL') return 'bg-sell';
    return 'bg-neutral';
  }

  getCardTheme(p: any): string {
    const t = this.getTrendText(p);
    return t === 'ALCISTA' ? 'border-buy' : t === 'BAJISTA' ? 'border-sell' : '';
  }
}