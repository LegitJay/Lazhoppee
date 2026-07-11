import { Component, OnInit } from '@angular/core';
import { Order } from '../models/order';
import { Product } from '../models/product';
import { OrderService } from '../services/order.service';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit {
  orders: Order[] = [];
  isLoading = true;

  constructor(private orderService: OrderService) { }

  ngOnInit(): void {
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load order history:', err);
        this.isLoading = false;
      }
    });
  }

  /** Type guard: item.product is Product | string depending on whether the backend
   *  populated it for this request. The template must check this before reading
   *  Product-only fields like imageUrl/name. */
  isPopulatedProduct(product: Product | string): product is Product {
    return typeof product !== 'string';
  }

  /** Same pattern used in checkout/cart: relative /uploads/ paths resolve against
   *  the Angular dev server unless prefixed with the backend origin. */
  getImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('data:')) return imageUrl;
    if (imageUrl.startsWith('/uploads/')) return 'http://localhost:3002' + imageUrl;
    return '/' + imageUrl;
  }
}