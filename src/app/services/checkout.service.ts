import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../models/product';
import { Order } from '../models/order';
import { environment } from '../../environments/environment';

export type CheckoutSource = 'cart' | 'buyNow';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private checkoutItemsSource = new BehaviorSubject<Product[]>([]);
  checkoutItems$ = this.checkoutItemsSource.asObservable();

  private checkoutSource?: CheckoutSource;

  constructor(private http: HttpClient) { }

  setCheckoutItems(items: Product[], source: CheckoutSource) {
    this.checkoutItemsSource.next(items);
    this.checkoutSource = source;
  }

  getCheckoutSource(): CheckoutSource | undefined {
    return this.checkoutSource;
  }

  createOrder(order: Order) {
    return this.http.post<Order>(`${environment.apiUrl}/orders`, order);
  }
}