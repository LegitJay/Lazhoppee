import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Product } from '../models/product';

@Injectable({ providedIn: 'root' })
export class CartService {
  private apiCheckoutUrl = environment.apiUrl + '/checkout';
  private apiCartUrl = environment.apiUrl + '/cart';

  private cartCountSubject = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  addToCart(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiCartUrl, product).pipe(
      tap(() => this.refreshCartCount())
    );
  }

  getCartItems(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiCartUrl).pipe(
      tap(items => this.cartCountSubject.next(items.length))
    );
  }

  updateQuantity(id: number, quantity: number): Observable<Product> {
    return this.http.patch<Product>(`${this.apiCartUrl}/${id}`, { quantity }).pipe(
      tap(() => this.refreshCartCount())
    );
  }

  removeItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiCartUrl}/${id}`).pipe(
      tap(() => this.refreshCartCount())
    );
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(this.apiCartUrl).pipe(
      tap(() => this.cartCountSubject.next(0))
    );
  }

  checkout(products: Product[]): Observable<void> {
    return this.http.post<void>(this.apiCheckoutUrl, products).pipe(
      tap(() => this.cartCountSubject.next(0))
    );
  }

  // Call this on logout to immediately zero out the badge and
  // drop any in-memory state from the previous session.
  reset(): void {
    this.cartCountSubject.next(0);
  }

  // Call this after login so the new user's cart is fetched immediately.
  refreshCartCount(): void {
    this.getCartItems().subscribe({ error: () => this.cartCountSubject.next(0) });
  }
}