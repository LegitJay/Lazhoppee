import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
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
  isAdminRoute: boolean = false;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router) {}

  ngOnInit(): void {
    this.cartService.cartCount$.subscribe((count: number) => {
      this.cartCount = count;
    });

    // Hide the storefront header whenever we're anywhere under /admin
    this.isAdminRoute = this.router.url.startsWith('/admin');
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this.isAdminRoute = event.urlAfterRedirects.startsWith('/admin');
    });
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  onSearch(): void {
    this.router.navigate(['/products'], { queryParams: { q: this.searchTerm } });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}