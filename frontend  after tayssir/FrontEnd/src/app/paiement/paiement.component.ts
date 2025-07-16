import { Component, AfterViewInit } from '@angular/core';
import { loadStripe, StripeCardElement, StripeElements } from '@stripe/stripe-js';
import { PaiementService } from '../services/paiement.service';

@Component({
  selector: 'app-paiement',
  templateUrl: './paiement.component.html',
  styleUrls: ['./paiement.component.css'] 
})
export class PaiementComponent implements AfterViewInit {
  stripePromise = loadStripe('pk_test_51RSN342f122SUwOdcO9HkGO6cgOzwCLVTF9MpivMniL3hdjBymVSjvJMNanu6CiporjX6jKDs0AcWJQqLx4mucWg00GlruNH3d'); // Ta clé publique
  elements!: StripeElements;
  card!: StripeCardElement;

  constructor(private paiementService: PaiementService) {}

  async ngAfterViewInit() {
    const stripe = await this.stripePromise;
    if (!stripe) return;

    this.elements = stripe.elements();
    this.card = this.elements.create('card');
    this.card.mount('#card-element');
  }

  async payer() {
    const stripe = await this.stripePromise;
    if (!stripe || !this.card) return;

    // Envoie la requête au backend
    const data = {
      amount: 2000, // En cents
      userId: 1,
      eventId: 123,
      ticketQuantity: 2,
      ticketType: 'VIP'
    };

    this.paiementService.createPaymentIntent(data).subscribe(async (res) => {
      const clientSecret = res.clientSecret;
      const paymentId = res.paymentId;
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: this.card
        }
      });

      if (result.error) {
        alert('Erreur : ' + result.error.message);
      } else if (result.paymentIntent?.status === 'succeeded') {
        alert('✅ Paiement réussi !');
         this.openInvoice(paymentId);
      }
    });
  }
  openInvoice(paymentId: number) {
  const url = `http://localhost:8099/api/payments/api/invoices/${paymentId}/download`;
  window.open(url, '_blank'); 
}

}
