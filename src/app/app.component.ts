import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'online-selling-app';
  shouldShowCustomerHeader: boolean = true;
  shouldShowCourierHeader: boolean = false;

  constructor(private router: Router, private authService: AuthService) {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const isAuthOrAdmin = event.urlAfterRedirects.startsWith('/auth') || event.urlAfterRedirects.startsWith('/admin');
      this.shouldShowCustomerHeader = !isAuthOrAdmin && !this.isCourier;
      this.shouldShowCourierHeader = !isAuthOrAdmin && this.isCourier;
    });
  }

  get isCourier(): boolean {
    return this.authService.getUser()?.role === 'courier';
  }
}