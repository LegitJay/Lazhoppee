import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductDetailComponent } from '../product-detail/product-detail.component';
import { StoreProfileComponent } from '../store/store-profile.component';
import {MatCardModule} from '@angular/material/card';
import { FlexModule } from '@angular/flex-layout';
import { RouterLink } from '@angular/router';

@NgModule({
  declarations: [
    ProductListComponent,
    ProductDetailComponent,
    StoreProfileComponent
  ],
  imports: [
    CommonModule,
    MatCardModule,
    FlexModule,
    RouterLink
  ],
  exports: [
    ProductListComponent,
    ProductDetailComponent,
    StoreProfileComponent
  ]
})
export class ProductModule { }