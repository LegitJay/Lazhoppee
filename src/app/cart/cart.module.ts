import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartListComponent } from './cart-list/cart-list.component';
import { MatCardModule } from '@angular/material/card';
import { FlexModule } from '@angular/flex-layout';


@NgModule({
  declarations: [
    CartListComponent
  ],
  imports: [
    CommonModule,
    MatCardModule,
    FlexModule
  ]
})
export class CartModule { }
