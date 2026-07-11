import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CustomerHeaderComponent } from './header/customer-header/customer-header.component';

@NgModule({
  declarations: [
    CustomerHeaderComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  exports: [
    CustomerHeaderComponent
  ]
})
export class SharedModule { }