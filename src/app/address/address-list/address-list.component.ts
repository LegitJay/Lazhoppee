import { Component, OnInit } from '@angular/core';
import { Address } from '../../models/address';
import { AddressService } from '../../services/address.service';

@Component({
  selector: 'app-address-list',
  templateUrl: './address-list.component.html',
  styleUrls: ['./address-list.component.css']
})
export class AddressListComponent implements OnInit {
  addresses: Address[] = [];
  selectedAddress: Address | null = null;
  showForm = false;

  constructor(private addressService: AddressService) { }

  ngOnInit(): void {
    this.loadAddresses();
  }

  loadAddresses(): void {
    this.addressService.getAddresses().subscribe((addresses) => {
      this.addresses = addresses;
    });
  }

  onAdd(): void {
    this.selectedAddress = null;
    this.showForm = true;
  }

  onEdit(address: Address): void {
    this.selectedAddress = { ...address };
    this.showForm = true;
  }

  onDelete(addressId: string): void {
    this.addressService.deleteAddress(addressId).subscribe(() => {
      this.loadAddresses();
    });
  }

  onSave(address: Address): void {
    const operation = address._id
      ? this.addressService.updateAddress(address)
      : this.addressService.addAddress(address);

    operation.subscribe(() => {
      this.loadAddresses();
      this.showForm = false;
      this.selectedAddress = null;
    });
  }
}