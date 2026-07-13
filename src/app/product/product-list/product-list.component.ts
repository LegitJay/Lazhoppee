import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Product } from 'src/app/models/product';
import { ProductService } from '../product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { CategoryService } from 'src/app/services/category.service';
import { ReviewService } from '../../services/review.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  allProducts: Product[] = [];
  products: Product[] = [];
  flashSaleProducts: Product[] = [];

  categories: string[] = [];
  selectedCategory: string = 'All';
  searchTerm: string = '';
  private ratingMap: Record<string, { avg: number; count: number }> = {};


  currentYear = new Date().getFullYear();

  // Maps category name -> emoji icon shown on the category tiles.
  // Swap these for real icon assets/mat-icons whenever you want.
  private categoryIconMap: Record<string, string> = {
    All: '🛍️',
    Shirts: '👕',
    Shorts: '🩳',
    Accessories: '🧢',
    Electronics: '🎧',
    Fashion: '👟',
    Beauty: '💄',
    Home: '🏠',
    Sports: '🏀',
    Food: '🍔',
    Gaming: '🎮'
  };

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private categoryService: CategoryService,
    private reviewService: ReviewService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchTerm = params['q'] || '';
      this.applyFilters();
    });

    this.productService.getProducts().subscribe(data => {
      this.allProducts = data;
      this.applyFilters();
    });

    this.loadCategories();
    this.loadRatings();
  }

  private loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (backendCategories) => {
        // Extract just the names and prepend 'All'
        this.categories = ['All', ...backendCategories.map(c => c.name)];
      },
      error: (err) => {
        console.error('Failed to load categories, using fallback.', err);
        // Keep the hardcoded list as a fallback in case of API error
        this.categories = ['All', 'Shirts', 'Shorts', 'Accessories'];
      }
    });
  }

  private loadRatings(): void {
    this.reviewService.getRatingAverages().subscribe({
      next: (map) => { this.ratingMap = map; },
      error: (err) => console.error('Failed to load ratings', err)
    });
  }


  // ============================================================
  // EXISTING FUNCTIONALITY (unchanged behavior)
  // ============================================================

  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  addToCart(product: Product): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth']);
      return;
    }
    this.cartService.addToCart(product).subscribe();
  }

  applyFilters(): void {
    let result = this.allProducts;

    if (this.selectedCategory !== 'All') {
      result = result.filter(p => p.category === this.selectedCategory);
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.trim().toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(term));
    }

    this.products = result;
    this.flashSaleProducts = this.allProducts
      .filter(p => this.getDiscountPercent(p) > 0)
      .slice(0, 10);
  }

  getImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    // Seller-uploaded images start with /uploads/ — serve from backend
    if (imageUrl.startsWith('/uploads/')) return 'http://localhost:3002' + imageUrl;
    // Sample/seed products use assets/images/ — serve from Angular
    return '/' + imageUrl;
  }

  trackByProductId(_index: number, product: Product): string {
    return product._id ?? '';
  }

  getCategoryIcon(category: string): string {
    return this.categoryIconMap[category] || '🏷️';
  }

  /** Reads an optional `originalPrice` field; falls back to no discount. */
  getOriginalPrice(product: Product): number {
    return (product as any).originalPrice ?? product.price;
  }

  getDiscountPercent(product: Product): number {
    const original = this.getOriginalPrice(product);
    if (!original || original <= product.price) return 0;
    return Math.round(((original - product.price) / original) * 100);
  }

  /** Reads an optional `rating` field; falls back to a neutral 4.5. */
  getRating(product: Product): number {
    return this.ratingMap[product._id ?? '']?.avg ?? 0;
  }

  getRatingCount(product: Product): number {
    return this.ratingMap[product._id ?? '']?.count ?? 0;
  }

  getStarString(rating: number): string {
    const full = Math.round(rating);
    return '★★★★★'.slice(0, full) + '☆☆☆☆☆'.slice(0, 5 - full);
  }

  /** Reads an optional `soldCount` field; falls back to 0. */
  getSoldLabel(product: Product): string {
    const sold = (product as any).soldCount ?? 0;
    if (sold >= 1000) return `${(sold / 1000).toFixed(1)}k sold`;
    if (sold > 0) return `${sold} sold`;
    // Fall back to review count
    const count = this.getRatingCount(product);
    return count > 0 ? `${count} reviews` : 'No reviews yet';
  }

  /** Reads an optional `stock` field; falls back to "in stock" (999). */
  getStock(product: Product): number {
    return (product as any).stock ?? 999;
  }

  /** Rough urgency bar for flash sale cards — % of a 999 baseline. */
  getStockUrgency(product: Product): number {
    const stock = this.getStock(product);
    return Math.max(8, Math.min(100, 100 - (stock / 999) * 100));
  }

  /** Reads an optional `storeName` field; falls back to "Krossover". */
  getStoreName(product: Product): string {
    return (product as any).storeName ?? 'Krossover Official';
  }

  getStoreInitial(product: Product): string {
    return this.getStoreName(product).charAt(0).toUpperCase();
  }

  isVerifiedSeller(product: Product): boolean {
    return (product as any).isVerified ?? true;
  }

  /** Reads an optional `location` field; falls back to a default city. */
  getLocation(product: Product): string {
    const seller = (product as any).sellerId;
    if (seller?.addresses?.length > 0) {
      return seller.addresses[0].city;
    }
    return 'Metro Manila'; // Fallback if no address is found
  }

  hasFreeShipping(product: Product): boolean {
    return (product as any).freeShipping ?? (product.price >= 1500);
  }

  isNew(product: Product): boolean {
    const createdAt = (product as any).createdAt;
    if (!createdAt) return false;
    const ageMs = Date.now() - new Date(createdAt).getTime();
    return ageMs < 14 * 24 * 60 * 60 * 1000; // 14 days
  }

}
