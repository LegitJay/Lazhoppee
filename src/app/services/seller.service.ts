import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SellerService {
  private apiUrl = 'http://localhost:3002/seller';

  constructor(private http: HttpClient) { }

  getApplicationByUserId(userId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/application/${userId}`);
  }

  getOrders(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/orders`);
  }
}