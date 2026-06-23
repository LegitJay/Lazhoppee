import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product } from 'src/app/models/product';
import { ProductService } from '../product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  // All products fetched from the backend, unfiltered.
  allProducts: Product[] = [];

  // The subset currently shown, after category + search filtering.
  products: Product[] = [];

  categories: string[] = ['All', 'Tees', 'Shorts', 'Accessories'];
  selectedCategory: string = 'All';
  searchTerm: string = '';

  constructor(private productService: ProductService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchTerm = params['q'] || '';
      this.applyFilters();
    });

    this.productService.getProducts().subscribe(data => {
      this.allProducts = data;
      this.applyFilters();
    });
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  private applyFilters(): void {
    let result = this.allProducts;

    if (this.selectedCategory !== 'All') {
      result = result.filter(p => p.category === this.selectedCategory);
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.trim().toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(term));
    }

    this.products = result;
  }
}