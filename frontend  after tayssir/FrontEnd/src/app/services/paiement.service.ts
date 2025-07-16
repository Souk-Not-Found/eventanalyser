import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invoice } from '../invoice.model';

@Injectable({
  providedIn: 'root'
})
export class PaiementService {

  constructor(private http: HttpClient) {}
createPaymentIntent(data: any): Observable<any> {
    return this.http.post('http://localhost:8099/api/payments/create-payment', data);
  }
deleteInvoice(paymentId: number): Observable<string> {
  return this.http.delete(`http://localhost:8099/api/payments/api/invoices/${paymentId}`, {
    responseType: 'text'
  });
}

getAllInvoices(): Observable<Invoice[]> {
  return this.http.get<Invoice[]>('http://localhost:8099/api/payments/api/invoices');
}

}


