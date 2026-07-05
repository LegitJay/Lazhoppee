import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface AuthUser {
  id: string;
  email: string;
  role: 'customer' | 'pendingSeller' | 'storeOwner' | 'admin';
  username?: string;
  profileImage?: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface BecomeSellerRequest {
  storeName: string;
  storeDescription: string;
  location: { lat: number; lng: number };
  storeAddress: string;
  storeContact: string;
  storeEmail: string;
}

export interface SellerApplication {
  _id: string;
  userId: string | { _id: string; email: string };
  storeName: string;
  storeDescription: string;
  location: { lat: number; lng: number };
  storeAddress: string;
  storeContact: string;
  storeEmail: string;
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

  constructor(private http: HttpClient) { }

  // ---------- Customer / storeOwner session (unchanged keys: token / user) ----------

  register(payload: { username: string; email: string; password: string; role?: 'customer' | 'storeOwner' }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/register`, payload)
      .pipe(tap((res) => this.setSession(res)));
  }

  login(payload: { email: string; password: string }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, payload)
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

  // Fetches live user data from DB so role is always accurate after approval/rejection
  getMe(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.baseUrl}/me`, { headers: this.authHeader() }).pipe(
      tap((user) => localStorage.setItem('user', JSON.stringify(user)))
    );
  }

  // NEW: Fetch any store owner/seller by their ID to display on product pages
  getSellerById(sellerId: string): Observable<AuthUser & { storeDetails?: any }> {
    return this.http.get<AuthUser & { storeDetails?: any }>(`${this.baseUrl}/users/${sellerId}`, { headers: this.authHeader() });
  }

  private authHeader() {
    return { Authorization: `Bearer ${this.getToken()}` };
  }

  private setSession(res: AuthResponse): void {
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
  }

  // ---------- Admin session (separate keys: adminToken / adminUser) ----------
  // Stored separately so an admin logging in never overwrites a customer/storeOwner
  // session in the same browser, and vice versa.

  adminLogin(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, { email, password })
      .pipe(tap((res) => this.setAdminSession(res)));
  }

  adminLogout(): void {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  }

  getAdminToken(): string | null {
    return localStorage.getItem('adminToken');
  }

  getAdminUser(): AuthUser | null {
    const raw = localStorage.getItem('adminUser');
    return raw ? JSON.parse(raw) : null;
  }

  isAdminLoggedIn(): boolean {
    const user = this.getAdminUser();
    return !!this.getAdminToken() && !!user && user.role === 'admin';
  }

  private setAdminSession(res: AuthResponse): void {
    localStorage.setItem('adminToken', res.token);
    localStorage.setItem('adminUser', JSON.stringify(res.user));
  }

  private adminAuthHeader() {
    return { Authorization: `Bearer ${this.getAdminToken()}` };
  }

  getApplications(status?: 'pending' | 'approved' | 'rejected'): Observable<SellerApplication[]> {
    const url = status ? `${this.sellerUrl}/applications?status=${status}` : `${this.sellerUrl}/applications`;
    return this.http.get<SellerApplication[]>(url, { headers: this.adminAuthHeader() });
  }

  approveApplication(id: string): Observable<SellerApplication> {
    return this.http.patch<SellerApplication>(`${this.sellerUrl}/applications/${id}/approve`, {}, { headers: this.adminAuthHeader() });
  }

  rejectApplication(id: string, reason?: string): Observable<SellerApplication> {
    return this.http.patch<SellerApplication>(`${this.sellerUrl}/applications/${id}/reject`, { reason }, { headers: this.adminAuthHeader() });
  }

  // In auth.service.ts - add this method
  // Add this to your AuthService class
  uploadProfileImage(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/upload-profile-image`, formData);
  }

  updateUserProfile(data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/update-profile`, data, {
      headers: this.authHeader()
    });
  }

  // Delete account and cascade delete all associated products (cascade deletion)
  deleteAccount(): Observable<any> {
    const user = this.getUser();
    return this.http.delete(`${this.baseUrl}/users/${user?.id}`, {
      headers: this.authHeader()
    });
  }
}