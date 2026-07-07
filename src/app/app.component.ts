import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from './cart/cart.service';
import { AuthService } from './auth/auth.service';
import { MessageService } from './messages/message.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'online-selling-app';
  cartCount: number = 0;
  unreadCount: number = 0;
  searchTerm: string = '';

  constructor(
    private cartService: CartService,
    public authService: AuthService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartService.cartCount$.subscribe((count: number) => {
      this.cartCount = count;
    });

    if (this.authService.isLoggedIn()) {
      this.cartService.refreshCartCount();
      this.refreshUnreadCount();
    }
  }

  refreshUnreadCount(): void {
    this.messageService.getConversations().subscribe((convos: any[]) => {
      this.unreadCount = convos.filter(c => c.hasUnread).length;
    });
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get isStoreOwner(): boolean {
    return this.authService.getUser()?.role === 'storeOwner';
  }

  get isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }

  onSearch(): void {
    this.router.navigate(['/products'], { queryParams: { q: this.searchTerm } });
  }

  logout(): void {
    this.authService.logout();
    this.cartService.reset();
    this.unreadCount = 0;
    this.router.navigate(['/auth']);
  }
}