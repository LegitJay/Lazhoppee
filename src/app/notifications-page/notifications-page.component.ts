import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications-page.component.html',
  styleUrls: ['./notifications-page.component.css']
})
export class NotificationsPageComponent implements OnInit {

  // Mock data for now
  notifications = [
    { id: 1, read: false, message: 'Your order #12345 has been shipped!', timestamp: '2 hours ago' },
    { id: 2, read: true, message: 'Welcome to Lazhoppee! Complete your profile to get started.', timestamp: '1 day ago' },
    { id: 3, read: false, message: 'A new item was added to your wishlist.', timestamp: '3 days ago' }
  ];

  constructor() { }

  ngOnInit(): void {
  }

  markAsRead(notification: any) {
    notification.read = true;
  }

  deleteNotification(notification: any) {
    this.notifications = this.notifications.filter(n => n.id !== notification.id);
  }
}