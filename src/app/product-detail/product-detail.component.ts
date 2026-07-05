import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService, CartItem } from '../cart/cart.service';
import { ProductService } from '../product/product.service';
import { AuthService, AuthUser } from '../auth/auth.service';
import { Product } from '../models/product';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  seller: (AuthUser & { storeDetails?: any }) | null = null;
  loading = true;
  sellerLoading = true;
  quantity = 1;
  isAddingToCart = false;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private cartService: CartService,
    private productService: ProductService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.loadProduct(productId);
    }
  }

  private loadProduct(id: string): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        // Find product by either _id (seller products) or id (seed products)
        this.product = products.find(p => (p._id === id || p.id?.toString() === id)) || null;
        this.loading = false;

        // If product has a sellerId, load their profile details (Amazon-style store owner card)
        console.log('Product loaded:', this.product);
        if (this.product?.sellerId) {
          console.log('Found sellerId on product:', this.product.sellerId);
          this.loadSeller(this.product.sellerId);
        } else {
          console.log('No sellerId found on product, seller card will be hidden');
          this.sellerLoading = false;
        }

        if (!this.product) {
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
    console.log('Trying to load seller with ID:', sellerId);
    this.authService.getSellerById(sellerId).subscribe({
      next: (sellerData) => {
        console.log('Seller loaded successfully:', sellerData);
        this.seller = sellerData;
        this.sellerLoading = false;
      },
      error: (err) => {
        console.error('Failed to load seller, ID might be invalid:', sellerId, err);
        this.sellerLoading = false;
        // Hide the seller card completely if we can't load the seller
        this.seller = null;
      }
    });
  }

  // Navigate to store owner's public profile page (like Amazon's seller store)
  viewSellerProfile(): void {
    if (this.seller) {
      this.router.navigate(['/store', this.product?.sellerId]);
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
    
    // Create cart item matching your existing CartItem interface
    const cartItem: Partial<Product> = {
      ...this.product,
      quantity: this.quantity
    };
    
    this.cartService.addToCart(cartItem as Product).subscribe({
      next: () => {
        this.isAddingToCart = false;
        alert('Added to cart successfully!');
      },
      error: () => {
        this.isAddingToCart = false;
        alert('Failed to add to cart. Please try again.');
      }
    });
  }

  buyNow(): void {
    if (!this.product) return;
    // First add to cart, then redirect to checkout
    this.addToCart();
    setTimeout(() => this.router.navigate(['/checkout']), 500);
  }

  // Helper to get image URL (matches product-list component EXACTLY)
  getImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    // Seller-uploaded images start with /uploads/ — serve from backend server (port 3002)
    if (imageUrl.startsWith('/uploads/')) return 'http://localhost:3002' + imageUrl;
    // Sample/seed products use assets/images/ — serve from Angular
    return '/' + imageUrl;
  }
}