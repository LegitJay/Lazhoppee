import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../../models/order';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SellerOrderService {
  private baseUrl = `${environment.apiUrl}/seller/orders`;

  constructor(private http: HttpClient) { }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.baseUrl);
  }

  updateOrderStatus(orderId: string, status: 'processing' | 'cancelled' | 'confirmed'): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${orderId}`, { status });
  }
}