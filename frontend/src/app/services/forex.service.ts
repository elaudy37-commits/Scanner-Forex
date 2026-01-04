import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PairSignal } from '../models/forex.model';

@Injectable({
  providedIn: 'root'
})
export class ForexService {
  
  private apiUrl = 'http://127.0.0.1:5000/api/signals'; 

  constructor(private http: HttpClient) {}

  getSignals(): Observable<PairSignal[]> {
    return this.http.get<PairSignal[]>(this.apiUrl);
  }
} 