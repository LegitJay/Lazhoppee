import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../services/notification.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {
  notification$: Observable<Notification | null>;

  constructor(private notificationService: NotificationService) {
    this.notification$ = this.notificationService.notification$;
  }

  ngOnInit(): void {
    this.notification$.subscribe(notification => {
      if (notification) {
        setTimeout(() => {
          this.notificationService.hide();
        }, 3000);
      }
    });
  }

  getIcon(type: string): string {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      default:
        return 'ℹ';
    }
  }
}