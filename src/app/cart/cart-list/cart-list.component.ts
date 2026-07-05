import { Component, OnInit } from '@angular/core';
import { CartService, CartItem } from '../cart.service';

@Component({
  selector: 'app-cart-list',
  templateUrl: './cart-list.component.html',
  styleUrls: ['./cart-list.component.css']
})
export class CartListComponent implements OnInit {

  cartItems: CartItem[] = [];
  totalPrice: number = 0;

  constructor(private cartService: CartService) {}

  ngOnInit(): void { this.loadCart(); }

  private loadCart(): void {
    this.cartService.getCartItems().subscribe(data => {
      this.cartItems = data;
      this.totalPrice = this.getTotalPrice();
    });
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  increase(item: CartItem): void {
    this.cartService.updateQuantity(item.productId, item.quantity + 1)
      .subscribe(() => this.loadCart());
  }

  decrease(item: CartItem): void {
    this.cartService.updateQuantity(item.productId, item.quantity - 1)
      .subscribe(() => this.loadCart());
  }

  removeItem(item: CartItem): void {
    this.cartService.removeItem(item.productId).subscribe(() => this.loadCart());
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe(() => { this.cartItems = []; this.totalPrice = 0; });
  }

  checkout(): void {
    this.cartService.checkout(this.cartItems).subscribe(() => { this.cartItems = []; this.totalPrice = 0; });
  }

  getImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('/uploads/')) return 'http://localhost:3002' + imageUrl;
    return '/' + imageUrl;
  }
}