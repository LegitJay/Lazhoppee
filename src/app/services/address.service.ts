import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Address } from '../models/address';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private apiUrl = `${environment.apiUrl}/profile/addresses`;

  constructor(private http: HttpClient) { }

  getAddresses(): Observable<Address[]> {
    return this.http.get<Address[]>(this.apiUrl);
  }

  addAddress(address: Address): Observable<Address[]> {
    return this.http.post<Address[]>(this.apiUrl, address);
  }

  updateAddress(address: Address): Observable<Address[]> {
    return this.http.put<Address[]>(`${this.apiUrl}/${address._id}`, address);
  }

  deleteAddress(addressId: string): Observable<Address[]> {
    return this.http.delete<Address[]>(`${this.apiUrl}/${addressId}`);
  }
}