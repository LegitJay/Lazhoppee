import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductListComponent } from './product-list/product-list.component';
import {MatCardModule} from '@angular/material/card';
import { FlexModule } from '@angular/flex-layout';
import { RouterLink } from '@angular/router';

@NgModule({
  declarations: [
    ProductListComponent
  ],
  imports: [
    CommonModule,
    MatCardModule,
    FlexModule,
    RouterLink
  ]
})
export class ProductModule { }
