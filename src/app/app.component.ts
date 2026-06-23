import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from './cart/cart.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'online-selling-app';
  cartCount: number = 0;
  searchTerm: string = '';

  constructor(private cartService: CartService, private router: Router) {}

  ngOnInit(): void {
    this.cartService.cartCount$.subscribe((count: number) => {
      this.cartCount = count;
    });
  }

  onSearch(): void {
    this.router.navigate(['/products'], { queryParams: { q: this.searchTerm } });
  }
}