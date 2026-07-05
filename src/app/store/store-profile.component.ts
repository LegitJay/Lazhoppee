import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, AuthUser } from '../auth/auth.service';
import { ProductService } from '../product/product.service';
import { Product } from '../models/product';

@Component({
  selector: 'app-store-profile',
  templateUrl: './store-profile.component.html',
  styleUrls: ['./store-profile.component.css']
})
export class StoreProfileComponent implements OnInit {
  sellerId: string | null = null;
  seller: (AuthUser & { storeDetails?: any }) | null = null;
  sellerProducts: Product[] = [];
  loading = true;
  productsLoading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private productService: ProductService
  ) { }

  ngOnInit(): void {
    this.sellerId = this.route.snapshot.paramMap.get('sellerId');
    if (!this.sellerId) {
      this.error = 'Invalid store ID';
      this.loading = false;
      return;
    }

    this.loadSellerData();
    this.loadSellerProducts();
  }

  private loadSellerData(): void {
    this.authService.getSellerById(this.sellerId!).subscribe({
      next: (sellerData) => {
        this.seller = sellerData;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load store profile';
        this.loading = false;
      }
    });
  }

  private loadSellerProducts(): void {
    this.productService.getProducts().subscribe({
      next: (allProducts) => {
        this.sellerProducts = allProducts.filter(p => p.sellerId === this.sellerId);
        this.productsLoading = false;
      },
      error: () => {
        this.productsLoading = false;
      }
    });
  }

  getImageUrl(imagePath: string | undefined): string {
    if (!imagePath) return 'assets/images/default-avatar.png';
    if (imagePath.startsWith('http') || imagePath.startsWith('data:image')) {
      return imagePath;
    }
    return `http://localhost:3002/${imagePath.replace(/^\//, '')}`;
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}