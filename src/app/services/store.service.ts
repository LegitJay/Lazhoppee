import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private apiUrl = 'http://localhost:3002/api/stores';

  constructor(private http: HttpClient) { }

  getStoreByOwnerId(ownerId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/owner/${ownerId}`);
  }

  updateStore(storeId: string, storeData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${storeId}`, storeData);
  }
}