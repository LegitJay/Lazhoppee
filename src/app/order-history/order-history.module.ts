import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderHistoryComponent } from './order-history.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [OrderHistoryComponent],
  imports: [
    CommonModule,
    SharedModule
  ]
})
export class OrderHistoryModule { }