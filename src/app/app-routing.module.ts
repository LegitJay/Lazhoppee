import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductListComponent } from './product/product-list/product-list.component';
import { CartListComponent } from './cart/cart-list/cart-list.component';
import { AuthComponent } from './auth/auth.component';
import { ProfileComponent } from './profile/profile.component';
import { BecomeSellerComponent } from './become-seller/become-seller.component';
import { authGuard } from './auth/auth.guard';
import { AdminLoginComponent } from './admin/admin-login/admin-login.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { adminGuard } from './admin/admin.guard';

const routes: Routes = [
  { path: '', redirectTo: '/products', pathMatch: 'full' },
  { path: 'products', component: ProductListComponent },
  { path: 'cart', component: CartListComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'become-seller', component: BecomeSellerComponent, canActivate: [authGuard] },
  { path: 'admin/login', component: AdminLoginComponent },
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [adminGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }