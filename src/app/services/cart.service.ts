import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Product } from '../models/product';

export interface CartItem extends Product {
  productId: string;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private apiCheckoutUrl = environment.apiUrl + '/checkout';
  private apiCartUrl = environment.apiUrl + '/cart';

  private cartCountSubject = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  addToCart(product: Product): Observable<CartItem> {
    return this.http.post<CartItem>(this.apiCartUrl, product).pipe(
      tap(() => this.refreshCartCount())
    );
  }

  getCartItems(): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(this.apiCartUrl).pipe(
      tap(items => this.cartCountSubject.next(items.length))
    );
  }

  // productId is now a string (works for both seed and seller products)
  updateQuantity(productId: string, quantity: number): Observable<CartItem> {
    return this.http.patch<CartItem>(`${this.apiCartUrl}/${productId}`, { quantity }).pipe(
      tap(() => this.refreshCartCount())
    );
  }

  removeItem(productId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiCartUrl}/${productId}`).pipe(
      tap(() => this.refreshCartCount())
    );
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(this.apiCartUrl).pipe(
      tap(() => this.cartCountSubject.next(0))
    );
  }

  checkout(products: CartItem[]): Observable<void> {
    return this.http.post<void>(this.apiCheckoutUrl, products).pipe(
      tap(() => this.cartCountSubject.next(0))
    );
  }

  reset(): void { this.cartCountSubject.next(0); }

  refreshCartCount(): void {
    this.getCartItems().subscribe({ error: () => this.cartCountSubject.next(0) });
  }
}