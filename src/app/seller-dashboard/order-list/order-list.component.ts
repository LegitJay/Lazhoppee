import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order } from '../../models/order';
import { Product } from '../../models/product';
import { User } from '../../models/user';
import { SellerService } from '../../services/seller.service';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  isLoading = true;

  constructor(private sellerService: SellerService) { }

  ngOnInit(): void {
    this.sellerService.getOrders().subscribe({
      next: (orders: Order[]) => {
        this.orders = orders;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Failed to load orders:', err);
        this.isLoading = false;
      }
    });
  }

  /** Order.buyer is User | string depending on whether the backend populated it. */
  isPopulatedBuyer(buyer: User | string | undefined): buyer is User {
    return typeof buyer === 'object' && buyer !== null;
  }

  /** Order.items[].product is Product | string, same populated/unpopulated split. */
  isPopulatedProduct(product: Product | string): product is Product {
    return typeof product !== 'string';
  }
}