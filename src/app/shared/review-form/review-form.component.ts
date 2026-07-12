import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReviewService } from '../../services/review.service';

@Component({
  selector: 'app-review-form',
  templateUrl: './review-form.component.html',
  styleUrls: ['./review-form.component.css']
})
export class ReviewFormComponent implements OnInit {
  @Input() productId!: string;
  @Input() orderId!: string;
  @Output() reviewSubmitted = new EventEmitter<void>();
  reviewForm: FormGroup;
  rating: number = 0;

  constructor(
    private fb: FormBuilder,
    private reviewService: ReviewService
  ) {
    this.reviewForm = this.fb.group({
      comment: ['', Validators.required]
    });
  }

  ngOnInit(): void {
  }

  setRating(rating: number): void {
    this.rating = rating;
  }

  onSubmit(): void {
    if (this.reviewForm.valid && this.rating > 0) {
      const review = {
        product: this.productId,
        order: this.orderId,
        rating: this.rating,
        comment: this.reviewForm.value.comment
      };
      this.reviewService.createReview(review).subscribe(() => {
        this.reviewSubmitted.emit();
      });
    }
  }
}