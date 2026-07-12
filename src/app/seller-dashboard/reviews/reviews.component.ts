import { Component, OnInit } from '@angular/core';
import { Review } from '../../models/review';
import { ReviewService } from '../../services/review.service';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css']
})
export class ReviewsComponent implements OnInit {
  reviews: Review[] = [];
  isLoading = true;

  constructor(private reviewService: ReviewService) { }

  ngOnInit(): void {
    this.reviewService.getReviewsForSeller().subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}