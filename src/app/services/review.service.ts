import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review } from '../models/review';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private baseUrl = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) { }

  createReview(review: Partial<Review>): Observable<Review> {
    return this.http.post<Review>(this.baseUrl, review);
  }

  getReviewsForProduct(productId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}/product/${productId}`);
  }

  getReviewsForSeller(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}/seller`);
  }
}