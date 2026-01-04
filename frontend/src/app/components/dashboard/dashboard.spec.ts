import { Component, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { ForexService } from '../../services/forex.service';
import { Forex } from '../../models/forex.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgClass],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {

  signals: Forex[] = [];
  loading = true;

  constructor(private forexService: ForexService) {}

  ngOnInit(): void {
    console.log('DashboardComponent inicializado');

    this.forexService.getSignals().subscribe({
      next: (data) => {
        console.log('Datos recibidos del backend:', data);
        this.signals = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al obtener señales', err);
        this.loading = false;
      }
    });
  }
}
