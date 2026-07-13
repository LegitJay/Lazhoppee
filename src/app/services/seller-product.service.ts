import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface SellerProduct {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
}

@Injectable({ providedIn: 'root' })
export class SellerProductService {
  private url = 'http://localhost:3002/seller/products';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private headers() {
    return { Authorization: `Bearer ${this.authService.getToken()}` };
  }

  getMyProducts(): Observable<SellerProduct[]> {
    return this.http.get<SellerProduct[]>(this.url, { headers: this.headers() });
  }

  createProduct(data: FormData): Observable<SellerProduct> {
    return this.http.post<SellerProduct>(this.url, data, {
      headers: this.headers()
    });
  }

  updateProduct(id: string, data: FormData): Observable<SellerProduct> {
    return this.http.patch<SellerProduct>(`${this.url}/${id}`, data, {
      headers: this.headers()
    });
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`, { headers: this.headers() });
  }
}