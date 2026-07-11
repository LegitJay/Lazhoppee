import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SellerProductService, SellerProduct } from './seller-product.service';
import { AuthService } from '../auth/auth.service';
import { CategoryService, Category } from '../category.service';
import { OrderListComponent } from './order-list/order-list.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

const BACKEND = 'http://localhost:3002';

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, OrderListComponent],
  templateUrl: './seller-dashboard.component.html',
  styleUrls: ['./seller-dashboard.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SellerDashboardComponent implements OnInit {
  activeTab: 'products' | 'orders' = 'products';

  products: SellerProduct[] = [];
  isLoading = false;
  showForm = false;
  editingProduct: SellerProduct | null = null;
  errorMessage = '';

  get overviewCards(): Array<{ label: string; value: string; hint: string }> {
    return [
      { label: 'Products', value: this.products.length.toString(), hint: 'Listed' },
      { label: 'Orders', value: '0', hint: 'This month' },
      { label: 'Revenue', value: '₱0', hint: 'Sales' },
    ];
  }

  get lowStockCount(): number {
    return this.products.filter((p) => (p.stock ?? 0) <= 5).length;
  }

  categories: Category[] = [];

  form = { name: '', price: 0, category: '', stock: 0, description: '' };

  selectedFile: File | null = null;
  imagePreview: string | null = null;

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private sellerProductService: SellerProductService,
    private authService: AuthService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.sellerProductService.getMyProducts().subscribe({
      next: (p) => { this.products = p; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (cats) => { this.categories = cats; },
      error: () => { this.errorMessage = 'Could not load categories.'; }
    });
  }

  // Builds the full URL for displaying a product image from the backend
  imageUrl(product: SellerProduct): string {
    if (!product.imageUrl) return '';
    // imageUrl stored as /uploads/filename — prefix with backend origin
    return `${BACKEND}${product.imageUrl}`;
  }

  openAddForm(): void {
    this.editingProduct = null;
    this.form = { name: '', price: 0, category: '', stock: 0, description: '' };
    this.resetImageState();
    this.showForm = true;
    this.errorMessage = '';
  }

  openEditForm(product: SellerProduct): void {
    this.editingProduct = product;
    this.form = {
      name: product.name,
      price: product.price,
      category: product.category,
      stock: product.stock,
      description: (product as any).description || ''
    };
    this.imagePreview = product.imageUrl ? `${BACKEND}${product.imageUrl}` : null;
    this.selectedFile = null;
    this.showForm = true;
    this.errorMessage = '';
  }

  closeForm(): void {
    this.showForm = false;
    this.editingProduct = null;
    this.resetImageState();
  }

  triggerFileUpload(): void { this.fileInput.nativeElement.click(); }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Please select a valid image file.';
      return;
    }
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = (e) => { this.imagePreview = e.target?.result as string; };
    reader.readAsDataURL(file);
  }

  private resetImageState(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    if (this.fileInput) this.fileInput.nativeElement.value = '';
  }

  onSubmit(): void {
    if (!this.form.name || this.form.price <= 0) {
      this.errorMessage = 'Name and price are required.'; return;
    }
    if (!this.form.category.trim()) {
      this.errorMessage = 'Please enter a category.'; return;
    }
    if (!this.editingProduct && !this.selectedFile) {
      this.errorMessage = 'Please upload a product image.'; return;
    }

    const formData = new FormData();
    formData.append('name', this.form.name);
    formData.append('price', String(this.form.price));
    formData.append('category', String(this.form.category));
    formData.append('stock', String(this.form.stock));
    formData.append('description', this.form.description);
    if (this.selectedFile) formData.append('image', this.selectedFile);

    const action = this.editingProduct
      ? this.sellerProductService.updateProduct(this.editingProduct._id, formData)
      : this.sellerProductService.createProduct(formData);

    action.subscribe({
      next: () => { this.closeForm(); this.loadProducts(); },
      error: (err) => { this.errorMessage = err?.error?.message || 'Something went wrong.'; }
    });
  }

  deleteProduct(product: SellerProduct): void {
    if (!confirm(`Delete "${product.name}"?`)) return;
    this.sellerProductService.deleteProduct(product._id).subscribe(() => this.loadProducts());
  }
}