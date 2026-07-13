import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SellerOrderService } from '../../services/seller-order.service';
import { Order } from '../../models/order';
import { User } from '../../models/user';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];

  constructor(private sellerOrderService: SellerOrderService) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  isUser(buyer: string | User | undefined): buyer is User {
    return buyer !== undefined && buyer !== null && typeof buyer !== 'string';
  }

  loadOrders(): void {
    this.sellerOrderService.getOrders().subscribe((orders: Order[]) => {
      this.orders = orders;
    });
  }

  confirmOrder(order: Order): void {
    this.sellerOrderService.updateOrderStatus(order._id!, 'confirmed').subscribe(() => {
      this.loadOrders();
    });
  }

  rejectOrder(order: Order): void {
    this.sellerOrderService.updateOrderStatus(order._id!, 'cancelled').subscribe(() => {
      this.loadOrders();
    });
  }
}