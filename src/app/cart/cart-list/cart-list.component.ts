import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/models/product';
import { CartService } from '../cart.service';

@Component({
  selector: 'app-cart-list',
  templateUrl: './cart-list.component.html',
  styleUrls: ['./cart-list.component.css']
})
export class CartListComponent implements OnInit{
  products: Product[] = []

  constructor(private productService: CartService) {

  }

  ngOnInit(): void {
    this.productService.getCart().subscribe(data => {
      this.products = data;
    })
  }
}
