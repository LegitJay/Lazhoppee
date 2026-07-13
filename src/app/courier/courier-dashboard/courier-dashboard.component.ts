import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourierService } from '../../services/courier.service';
import { Order } from '../../models/order';
import { User } from '../../models/user';

@Component({
  selector: 'app-courier-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './courier-dashboard.component.html',
  styleUrls: ['./courier-dashboard.component.css']
})
export class CourierDashboardComponent implements OnInit {
  deliveries: Order[] = [];
  selectedOrder: Order | null = null;
  updateNote = '';
  updateStatus: 'in_transit' | 'delivered' | 'unsuccessful' | null = null;
  private pollingInterval: any;

  constructor(private courierService: CourierService) { }

  ngOnInit(): void {
    this.loadDeliveries();
    this.pollingInterval = setInterval(() => {
      this.loadDeliveries();
    }, 5000); // Poll every 5 seconds
  }

  ngOnDestroy(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  isUser(buyer: string | User | undefined): buyer is User {
    return buyer !== undefined && typeof buyer !== 'string';
  }

  loadDeliveries(): void {
    this.courierService.getMyDeliveries().subscribe(orders => {
      this.deliveries = orders;
    });
  }

  openUpdateModal(order: Order, status: 'in_transit' | 'delivered' | 'unsuccessful'): void {
    this.selectedOrder = order;
    this.updateStatus = status;
  }

  closeUpdateModal(): void {
    this.selectedOrder = null;
    this.updateStatus = null;
    this.updateNote = '';
  }

  confirmUpdate(): void {
    if (this.selectedOrder && this.updateStatus) {
      this.courierService.updateOrderStatus(this.selectedOrder._id!, this.updateStatus, this.updateNote)
        .subscribe(() => {
          this.loadDeliveries();
          this.closeUpdateModal();
        });
    }
  }
}