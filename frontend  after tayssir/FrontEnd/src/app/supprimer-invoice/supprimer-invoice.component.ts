import { Component, OnInit } from '@angular/core';
import { PaiementService } from '../services/paiement.service';
import { Invoice } from '../invoice.model';

@Component({
  selector: 'app-supprimer-invoice',
  templateUrl: './supprimer-invoice.component.html',
  styleUrls: ['./supprimer-invoice.component.css']
})
export class SupprimerInvoiceComponent implements OnInit {
  invoiceId!: number;
  message = '';
  invoices: Invoice[] = [];

  constructor(private paiementService: PaiementService) {}

  ngOnInit() {
    this.paiementService.getAllInvoices().subscribe({
      next: (data) => this.invoices = data,
      error: () => this.message = '❌ Erreur lors du chargement des factures.'
    });
  }

  supprimerFacture() {
    if (!this.invoiceId) {
      this.message = '❌ Veuillez entrer un ID de facture valide.';
      return;
    }

    this.paiementService.deleteInvoice(this.invoiceId).subscribe({
      next: () => {
        this.message = '✅ Facture supprimée avec succès.';
        this.invoices = this.invoices.filter(inv => inv.id !== this.invoiceId);
      },
      error: () => this.message = '❌ Erreur lors de la suppression.'
    });
  }
}
