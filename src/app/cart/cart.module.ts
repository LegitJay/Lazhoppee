import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartListComponent } from './cart-list/cart-list.component';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list'
import { MatButtonModule } from '@angular/material/button';


@NgModule({
  declarations: [
    CartListComponent
  ],
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatButtonModule
  ]
})
export class CartModule { }
