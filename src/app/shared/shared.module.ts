import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CustomerHeaderComponent } from './header/customer-header/customer-header.component';
import { CourierHeaderComponent } from './header/courier-header/courier-header.component';
import { ReviewFormComponent } from './review-form/review-form.component';

@NgModule({
  declarations: [
    CustomerHeaderComponent,
    CourierHeaderComponent,
    ReviewFormComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    CustomerHeaderComponent,
    CourierHeaderComponent,
    ReviewFormComponent
  ]
})
export class SharedModule { }