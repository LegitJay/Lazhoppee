import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/models/product';
import { CartService } from '../cart.service';

@Component({
  selector: 'app-cart-list',
  templateUrl: './cart-list.component.html',
  styleUrls: ['./cart-list.component.css']
})
export class CartListComponent implements OnInit{

  cartItems: Product[] = []
  totalPrice: number = 0
  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.cartService.getCartItems().subscribe(data => {
      this.cartItems = data
      this.totalPrice = this.getTotalPrice();
    })
  }

  getTotalPrice(): number{
    let total = 0;
    for(let item of this.cartItems){
      total+=item.price
    }
    return total
  }
  clearCart(): void {
    this.cartService.clearCart().subscribe();
  }
  checkout(): void {
    this.cartService.checkout(this.cartItems).subscribe();
  }
}
