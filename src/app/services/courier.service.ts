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

  /**
   * Helper utility to safely construct contextual headers.
   * Checks standard token first, then falls back to adminToken 
   * if your backend handles couriers within the administrative workspace scope.
   */
  private getAuthHeaders() {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  }

  getMyDeliveries(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders/courier`, this.getAuthHeaders());
  }

  updateOrderStatus(id: string, status: string, note: string): Observable<Order> {
    return this.http.patch<Order>(
      `${this.apiUrl}/orders/${id}/status`, 
      { status, note }, 
      this.getAuthHeaders()
    );
  }
}