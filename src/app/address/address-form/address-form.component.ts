import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Address } from '../../models/address';

@Component({
  selector: 'app-address-form',
  templateUrl: './address-form.component.html',
  styleUrls: ['./address-form.component.css']
})
export class AddressFormComponent implements OnInit {
  @Input() address: Address | null = null;
  @Output() save = new EventEmitter<Address>();
  addressForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.addressForm = this.fb.group({
      fullName: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      region: ['', Validators.required],
      city: ['', Validators.required],
      barangay: ['', Validators.required],
      streetAddress: ['', Validators.required],
      postalCode: ['', Validators.required],
      isDefault: [false],
    });
  }

  ngOnInit(): void {
    if (this.address) {
      this.addressForm.patchValue(this.address);
    }
  }

  onSubmit(): void {
    if (this.addressForm.valid) {
      this.save.emit(this.addressForm.value);
    }
  }
}