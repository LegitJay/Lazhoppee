import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Product } from '../models/product';
import { Order } from '../models/order';
import { Address } from '../models/address';
import { CheckoutService, CheckoutSource } from '../services/checkout.service';
import { AddressService } from '../services/address.service';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit, OnDestroy {
  checkoutItems: Product[] = [];
  addresses: Address[] = [];
  selectedAddress: Address | null = null;

  subtotal = 0;
  shippingFee = 50; // Placeholder
  totalPayment = 0;

  isProcessing = false;
  private checkoutSub!: Subscription;
  private checkoutSource: CheckoutSource | undefined;

  constructor(
    private router: Router,
    private checkoutService: CheckoutService,
    private addressService: AddressService,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    this.checkoutSub = this.checkoutService.checkoutItems$.subscribe(items => {
      if (items && items.length > 0) {
        this.checkoutItems = items;
        this.calculateTotals();
      } else {
        this.router.navigate(['/']);
      }
    });

    this.checkoutSource = this.checkoutService.getCheckoutSource();
    this.loadAddresses();
  }

  ngOnDestroy(): void {
    if (this.checkoutSub) {
      this.checkoutSub.unsubscribe();
    }
  }

  private loadAddresses(): void {
    this.addressService.getAddresses().subscribe(addresses => {
      this.addresses = addresses;
      this.selectedAddress = addresses.find(a => a.isDefault) || addresses[0] || null;
    });
  }

  private calculateTotals(): void {
    this.subtotal = this.checkoutItems.reduce((sum, item) => sum + item.price * (item.quantity ?? 1), 0);
    this.totalPayment = this.subtotal + this.shippingFee;
  }

  onSelectAddress(address: Address): void {
    this.selectedAddress = address;
  }

  private getProductId(product: Product): string {
    if (product.productId) return product.productId;
    if (product._id) return product._id;
    if (product.id) return String(product.id);
    throw new Error('Product is missing an identifier.');
  }

  placeOrder(): void {
    if (!this.selectedAddress || this.checkoutItems.length === 0) {
      alert('Please select a shipping address and ensure your cart is not empty.');
      return;
    }

    this.isProcessing = true;

    const order: Order = {
      items: this.checkoutItems.map(item => {
        if (!item.sellerId) {
          throw new Error(`Product "${item.name}" is missing seller information.`);
        }
        return {
          product: this.getProductId(item),
          seller: item.sellerId,
          quantity: item.quantity ?? 1,
          price: item.price
        };
      }),
      total: this.totalPayment,
      shipping: this.selectedAddress
    };

    this.checkoutService.createOrder(order).subscribe({
      next: () => {
        if (this.checkoutSource === 'cart') {
          this.cartService.clearCart().subscribe();
        }
        this.isProcessing = false;
        alert('Order placed successfully!');
        this.router.navigate(['/order-history']);
      },
      error: (err) => {
        this.isProcessing = false;
        alert(`Failed to place order: ${err.error.message}`);
      }
    });
  }

  getImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('data:')) return imageUrl;
    if (imageUrl.startsWith('/uploads/')) return 'http://localhost:3002' + imageUrl;
    return '/' + imageUrl;
  }
}