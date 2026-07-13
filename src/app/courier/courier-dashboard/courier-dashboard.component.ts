import { Component, OnInit, OnDestroy } from '@angular/core'; // 1. Import OnDestroy
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
export class CourierDashboardComponent implements OnInit, OnDestroy { // 2. Implement OnDestroy
  deliveries: Order[] = [];
  selectedOrder: Order | null = null;
  updateNote = '';
  updateStatus: 'in_transit' | 'delivered' | 'unsuccessful' | null = null;
  private pollingInterval: any;

  constructor(private courierService: CourierService) { }

  ngOnInit(): void {
    this.loadDeliveries();
    this.pollingInterval = setInterval(() => {
      // 3. Prevent running if user logged out right before this interval tick
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      if (!token) {
        this.clearPolling();
        return;
      }
      this.loadDeliveries();
    }, 5000);
  }

  // 4. This fires automatically when the component is destroyed (e.g., routing away on logout)
  ngOnDestroy(): void {
    this.clearPolling();
  }

  private clearPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  isUser(buyer: string | User | undefined): buyer is User {
    return buyer !== undefined && typeof buyer !== 'string';
  }

  loadDeliveries(): void {
    this.courierService.getMyDeliveries().subscribe({
      next: (orders) => {
        this.deliveries = orders;
      },
      error: (err) => {
        // 5. Catch block to cleanly kill polling if a 401 leaks through
        if (err.status === 401) {
          this.clearPolling();
        }
      }
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