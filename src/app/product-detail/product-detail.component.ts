import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from '../cart/cart.service';
import { ProductService } from '../product/product.service';
import { AuthService, AuthUser } from '../auth/auth.service';
import { Product } from '../models/product';
import { MessageService } from '../messages/message.service';
import { CheckoutService } from '../checkout/checkout.service';
import { WishlistService } from '../services/wishlist.service';
import { ReviewService } from '../services/review.service';
import { Review } from '../models/review';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  seller: (AuthUser & { storeDetails?: any }) | null = null;
  storeName: string = '';
  loading = true;
  sellerLoading = true;
  quantity = 1;
  isAddingToCart = false;
  reviews: Review[] = [];

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private cartService: CartService,
    private productService: ProductService,
    private authService: AuthService,
    private messageService: MessageService,
    private checkoutService: CheckoutService,
    private wishlistService: WishlistService,
    private reviewService: ReviewService,
    private storeService: StoreService
  ) { }

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.loadProduct(productId);
    }
  }

  private loadProduct(id: string): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.product = products.find(p => (p._id === id || p.id?.toString() === id)) || null;
        this.loading = false;

        if (this.product?.sellerId) {
          const sellerId = (this.product.sellerId as any)._id ?? this.product.sellerId;
          this.loadSeller(sellerId);
          this.loadStoreName(sellerId);
        } else {
          this.sellerLoading = false;
        }

        if (this.product) {
          const productId = this.product._id || this.product.id?.toString();
          if (productId) this.loadReviews(productId);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/']);
      }
    });
  }

  private loadSeller(sellerId: string): void {
    this.authService.getSellerById(sellerId).subscribe({
      next: (sellerData) => {
        this.seller = sellerData;
        this.sellerLoading = false;
      },
      error: () => {
        this.sellerLoading = false;
        this.seller = null;
      }
    });
  }

  /** Fetches the store name from the dedicated Store collection. */
  private loadStoreName(sellerId: string): void {
    this.storeService.getStoreByOwnerId(sellerId).subscribe({
      next: (store) => {
        this.storeName = store?.storeName || '';
      },
      error: () => {
        this.storeName = '';
      }
    });
  }

  viewSellerProfile(): void {
    if (this.seller) {
      const sellerId = (this.product?.sellerId as any)?._id ?? this.product?.sellerId;
      this.router.navigate(['/store', sellerId]);
    }
  }

  increaseQuantity(): void {
    if (this.product?.stock && this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) this.quantity--;
  }

  addToCart(): void {
    if (!this.product) return;
    this.isAddingToCart = true;
    const cartItem: Partial<Product> = { ...this.product, quantity: this.quantity };
    this.cartService.addToCart(cartItem as Product).subscribe({
      next: () => { this.isAddingToCart = false; alert('Added to cart successfully!'); },
      error: () => { this.isAddingToCart = false; alert('Failed to add to cart. Please try again.'); }
    });
  }

  buyNow(): void {
    if (!this.product) return;
    const productToCheckout = { ...this.product, quantity: this.quantity };
    this.checkoutService.setCheckoutItems([productToCheckout], 'buyNow');
    this.router.navigate(['/checkout']);
  }

  addToWishlist(): void {
    if (!this.product) return;
    const productId = this.product._id || this.product.id;
    if (!productId) return;
    this.wishlistService.addToWishlist(productId.toString()).subscribe({
      next: () => { alert('Added to wishlist successfully!'); },
      error: (err) => { alert(err.error.message || 'Failed to add to wishlist.'); }
    });
  }

  getImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('data:')) return imageUrl;
    if (imageUrl.startsWith('/uploads/')) return 'http://localhost:3002' + imageUrl;
    return '/' + imageUrl;
  }

  messageSeller(): void {
    if (!this.seller || !this.product) return;
    const sellerId = (this.seller as any)._id;
    this.messageService.startConversation(sellerId, this.product._id)
      .subscribe((convo: any) => {
        this.router.navigate(['/messages'], { queryParams: { conversation: convo._id } });
      });
  }

  /** Uses the store name from the Store collection; falls back to username. */
  getSellerDisplayName(): string {
    return this.storeName || this.seller?.username || 'Store';
  }

  loadReviews(productId: string): void {
    this.reviewService.getReviewsForProduct(productId).subscribe({
      next: (reviews) => { this.reviews = reviews; }
    });
  }
}