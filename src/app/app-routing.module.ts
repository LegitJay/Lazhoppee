import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductListComponent } from './product/product-list/product-list.component';
import { CartListComponent } from './cart/cart-list/cart-list.component';
import { AuthComponent } from './auth/auth.component';
import { ProfileComponent } from './profile/profile.component';
import { BecomeSellerComponent } from './become-seller/become-seller.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { authGuard } from './auth/auth.guard';
import { adminGuard } from './admin/admin.guard';
import { ProductDetailComponent } from './product/product-detail/product-detail.component';
import { StoreProfileComponent } from './product/store/store-profile.component';
import { MessagesComponent } from './messages/messages.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { OrderHistoryComponent } from './order-history/order-history.component';
import { AddressListComponent } from './address/address-list/address-list.component';
import { SellerDashboardComponent } from './seller-dashboard/seller-dashboard.component';
import { CourierDashboardComponent } from './courier/courier-dashboard/courier-dashboard.component';
import { CourierGuard } from './courier/courier.guard';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';


const routes: Routes = [
  { path: '', redirectTo: '/products', pathMatch: 'full' },
  { path: 'products', component: ProductListComponent },
  { path: 'cart', component: CartListComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'admin/login', component: AuthComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password/:token', component: ResetPasswordComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'addresses', component: AddressListComponent, canActivate: [authGuard] },
  { path: 'order-history', component: OrderHistoryComponent, canActivate: [authGuard] },
  { path: 'orders', component: OrderHistoryComponent, canActivate: [authGuard] },
  { path: 'become-seller', component: BecomeSellerComponent, canActivate: [authGuard] },
  { path: 'seller/dashboard', component: SellerDashboardComponent, canActivate: [authGuard] },
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: 'product/:id', component: ProductDetailComponent },
  { path: 'store/:sellerId', component: StoreProfileComponent },
  { path: 'messages', component: MessagesComponent, canActivate: [authGuard] },
  { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard] },
  { path: 'courier/dashboard', component: CourierDashboardComponent, canActivate: [CourierGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }