import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface AuthUser {
  id: string;
  email: string;
  role: 'customer' | 'pendingSeller' | 'storeOwner' | 'admin';
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface BecomeSellerRequest {
  storeName: string;
  storeDescription: string;
  location: { lat: number; lng: number };
}

export interface SellerApplication {
  _id: string;
  userId: string | { _id: string; email: string };
  storeName: string;
  storeDescription: string;
  location: { lat: number; lng: number };
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BecomeSellerResponse extends AuthResponse {
  application: SellerApplication;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://localhost:3002/auth';
  private sellerUrl = 'http://localhost:3002/seller';

  constructor(private http: HttpClient) {}

  register(email: string, password: string, role?: 'customer' | 'storeOwner'): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/register`, { email, password, role })
      .pipe(tap((res) => this.setSession(res)));
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, { email, password })
      .pipe(tap((res) => this.setSession(res)));
  }

  becomeSeller(payload: BecomeSellerRequest): Observable<BecomeSellerResponse> {
    return this.http
      .post<BecomeSellerResponse>(`${this.sellerUrl}/apply`, payload, { headers: this.authHeader() })
      .pipe(tap((res) => this.setSession(res)));
  }

  // Lets the logged-in user check their latest application status, for the progress bar
  getMyApplication(): Observable<SellerApplication | null> {
    return this.http.get<SellerApplication | null>(`${this.sellerUrl}/apply/me`, { headers: this.authHeader() });
  }

  // ---------- Admin ----------
  getApplications(status?: 'pending' | 'approved' | 'rejected'): Observable<SellerApplication[]> {
    const url = status ? `${this.sellerUrl}/applications?status=${status}` : `${this.sellerUrl}/applications`;
    return this.http.get<SellerApplication[]>(url, { headers: this.authHeader() });
  }

  approveApplication(id: string): Observable<SellerApplication> {
    return this.http.patch<SellerApplication>(`${this.sellerUrl}/applications/${id}/approve`, {}, { headers: this.authHeader() });
  }

  rejectApplication(id: string, reason?: string): Observable<SellerApplication> {
    return this.http.patch<SellerApplication>(`${this.sellerUrl}/applications/${id}/reject`, { reason }, { headers: this.authHeader() });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): AuthUser | null {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private authHeader() {
    return { Authorization: `Bearer ${this.getToken()}` };
  }

  private setSession(res: AuthResponse): void {
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
  }
}