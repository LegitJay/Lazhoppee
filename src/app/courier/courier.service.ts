import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models/order';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CourierService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getMyDeliveries(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders/courier`);
  }

  updateOrderStatus(id: string, status: string, note: string): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/orders/${id}/status`, { status, note });
  }
}