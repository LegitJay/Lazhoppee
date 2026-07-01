import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SellerProductService, SellerProduct } from './seller-product.service';

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seller-dashboard.component.html',
  styleUrls: ['./seller-dashboard.component.css'],
})
export class SellerDashboardComponent implements OnInit {
  products: SellerProduct[] = [];
  isLoading = false;
  showForm = false;
  editingProduct: SellerProduct | null = null;
  errorMessage = '';

  // Fixed 'Tees' to 'Shirts' to match your categories array
  categories = ['Shirts', 'Shorts', 'Accessories'];
  form = { name: '', price: 0, category: 'Shirts', stock: 0 };

  // Holds the actual file selected by the user
  selectedFile: File | null = null; 
  // Holds a temporary URL to show a preview of the image before uploading
  imagePreview: string | null = null; 

  // ViewChild to programmatically trigger the hidden file input
  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(private sellerProductService: SellerProductService) {}

  ngOnInit(): void { this.loadProducts(); }

  loadProducts(): void {
    this.isLoading = true;
    this.sellerProductService.getMyProducts().subscribe({
      next: (p) => { this.products = p; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  openAddForm(): void {
    this.editingProduct = null;
    this.form = { name: '', price: 0, category: 'Shirts', stock: 0 };
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
      stock: product.stock
    };
    
    // If editing an existing product, show its current image as the preview
    this.imagePreview = product.imageUrl ? '/' + product.imageUrl : null;
    this.selectedFile = null; // No new file selected yet
    this.showForm = true;
    this.errorMessage = '';
  }

  closeForm(): void { 
    this.showForm = false; 
    this.editingProduct = null; 
    this.resetImageState();
  }

  // Triggered when user clicks the "Upload Image" button
  triggerFileUpload(): void {
    this.fileInput.nativeElement.click();
  }

  // Triggered when a file is actually selected from the device
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      // Basic validation: ensure it's an image
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Please select a valid image file.';
        return;
      }
      this.selectedFile = file;
      
      // Generate a local URL to show the user a preview immediately
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // Helper to clear image data
  private resetImageState(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = ''; // Reset input field
    }
  }

  onSubmit(): void {
    if (!this.form.name || !this.form.price) {
      this.errorMessage = 'Name and price are required.';
      return;
    }

    // Convert standard form object to FormData so we can send files
    const formData = new FormData();
    formData.append('name', this.form.name);
    formData.append('price', this.form.price.toString());
    formData.append('category', this.form.category);
    formData.append('stock', this.form.stock.toString());

    // Append the image if a new one was selected
    if (this.selectedFile) {
      formData.append('image', this.selectedFile, this.selectedFile.name);
    }

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