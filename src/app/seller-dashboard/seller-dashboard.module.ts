import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SellerDashboardComponent } from './seller-dashboard.component';
import { SellerDashboardRoutingModule } from './seller-dashboard-routing.module';
import { ReviewsComponent } from './reviews/reviews.component';

@NgModule({
  declarations: [ReviewsComponent],
  imports: [
    CommonModule,
    SellerDashboardRoutingModule,
    SellerDashboardComponent
  ]
})
export class SellerDashboardModule { }