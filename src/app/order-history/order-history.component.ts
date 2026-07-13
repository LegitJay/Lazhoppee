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
  allOrders: Order[] = [];
  toShipOrders: Order[] = [];
  toReceiveOrders: Order[] = [];
  toReviewOrders: Order[] = [];
  completedOrders: Order[] = [];
  unsuccessfulOrders: Order[] = [];
  
  isLoading = true;
  activeTab: string = 'toShip';

  reviewingProductId: string | null = null;

  constructor(private orderService: OrderService) { }

  ngOnInit(): void {
    this.fetchOrders();
  }

  fetchOrders(): void {
  this.isLoading = true;
  this.orderService.getOrders().subscribe({
    next: (orders) => {
      this.allOrders = orders;
      this.toShipOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed');
      this.toReceiveOrders = orders.filter(o => o.status === 'in_transit');
      this.toReviewOrders = orders.filter(o => o.status === 'shipped');
      this.completedOrders = orders.filter(o => o.status === 'completed');
      // Capture courier-flagged failed status changes
      this.unsuccessfulOrders = orders.filter(o => o.status === 'unsuccessful');
      this.isLoading = false;
    },
    error: () => this.isLoading = false
  });
}

  onReviewSubmitted(): void {
    this.reviewingProductId = null;
    this.fetchOrders();
    this.activeTab = 'completed';
  }

  confirmReceipt(orderId: string | undefined): void {
    if (!orderId) {
      return;
    }
    this.orderService.updateOrderStatus(orderId, 'completed').subscribe(() => {
      this.fetchOrders();
    });
  }

  changeTab(tab: string): void {
    this.activeTab = tab;
  }

  toggleReviewForm(productId: string | undefined): void {
    if (!productId) {
      return;
    }
    this.reviewingProductId = this.reviewingProductId === productId ? null : productId;
  }

  

  get orders(): Order[] {
  switch (this.activeTab) {
    case 'toShip':
      return this.toShipOrders;
    case 'toReceive':
      return this.toReceiveOrders;
    case 'toReview':
      return this.toReviewOrders;
    case 'completed':
      return this.completedOrders;
    case 'unsuccessful':
      return this.unsuccessfulOrders;
    default:
      return [];
  }
}

  /** Type guard: item.product is Product | string depending on whether the backend
   *  populated it for this request. The template must check this before reading
   *  Product-only fields like imageUrl/name. */
  isPopulatedProduct(product: Product | string | null): product is Product {
    return product !== null && typeof product !== 'string';
  }

  /** Same pattern used in checkout/cart: relative /uploads/ paths resolve against
   *  the Angular dev server unless prefixed with the backend origin. */
  getImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('data:')) return imageUrl;
    if (imageUrl.startsWith('/uploads/')) return 'http://localhost:3002' + imageUrl;
    return '/' + imageUrl;
  }
}