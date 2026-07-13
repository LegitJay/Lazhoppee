import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewsComponent } from './reviews/reviews.component';

@NgModule({
  declarations: [ReviewsComponent],
  exports: [ReviewsComponent],
  imports: [
    CommonModule,
  ]
})
export class SellerDashboardModule { }