import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-courier-header',
  templateUrl: './courier-header.component.html',
  styleUrls: ['./courier-header.component.css']
})
export class CourierHeaderComponent {
  constructor(private authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}