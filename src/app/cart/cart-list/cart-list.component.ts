import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/models/product';
import { CartService } from '../cart.service';

@Component({
  selector: 'app-cart-list',
  templateUrl: './cart-list.component.html',
  styleUrls: ['./cart-list.component.css']
})
export class CartListComponent implements OnInit {

  cartItems: (Product & { quantity: number })[] = [];
  totalPrice: number = 0;

  constructor(private cartService: CartService) { }

  ngOnInit(): void { this.loadCart(); }

  private loadCart(): void {
    this.cartService.getCartItems().subscribe(data => {
      this.cartItems = data as (Product & { quantity: number })[];
      this.totalPrice = this.getTotalPrice();
    });
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  increase(item: Product & { quantity: number }): void {
    this.cartService.updateQuantity(item.id, item.quantity + 1).subscribe(() => this.loadCart());
  }

  decrease(item: Product & { quantity: number }): void {
    this.cartService.updateQuantity(item.id, item.quantity - 1).subscribe(() => this.loadCart());
  }

  removeItem(item: Product & { quantity: number }): void {
    this.cartService.removeItem(item.id).subscribe(() => this.loadCart());
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe(() => { this.cartItems = []; this.totalPrice = 0; });
  }

  checkout(): void {
    this.cartService.checkout(this.cartItems).subscribe(() => { this.cartItems = []; this.totalPrice = 0; });
  }
}