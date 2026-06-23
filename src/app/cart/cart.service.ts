import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiCheckoutUrl = environment.apiUrl + "/checkout"
  private apiCartUrl = environment.apiUrl + "/cart"

  // Tracks how many items are in the cart so the header badge can react live.
  private cartCountSubject = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCountSubject.asObservable();

  constructor(private http: HttpClient) {
    this.refreshCartCount();
  }

  addToCart(product: Product): Observable<Product>{
    return this.http.post<Product>(this.apiCartUrl, product).pipe(
      tap(() => this.refreshCartCount())
    )
  }
  getCartItems(): Observable<Product[]>{
    return this.http.get<Product[]>(this.apiCartUrl).pipe(
      tap(items => this.cartCountSubject.next(items.length))
    )
  }
  clearCart(): Observable<void>{
    return this.http.delete<void>(this.apiCartUrl).pipe(
      tap(() => this.cartCountSubject.next(0))
    )
  }
  checkout(products: Product[]) : Observable<void>{
    return this.http.post<void>(this.apiCheckoutUrl, products).pipe(
      tap(() => this.cartCountSubject.next(0))
    )
  }

  // Call this whenever the cart might have changed outside a direct add/clear,
  // e.g. on app startup, so the header badge starts with the correct count.
  refreshCartCount(): void {
    this.getCartItems().subscribe();
  }
}