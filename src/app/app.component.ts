import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from './cart/cart.service';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'online-selling-app';
  cartCount: number = 0;
  searchTerm: string = '';

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartService.cartCount$.subscribe((count: number) => {
      this.cartCount = count;
    });

    // If a user is already logged in when the app boots (e.g. page refresh),
    // fetch their cart so the badge is accurate immediately.
    if (this.authService.isLoggedIn()) {
      this.cartService.refreshCartCount();
    }
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
    this.cartService.reset();        // ← zero the badge immediately
    this.router.navigate(['/auth']);
  }
}