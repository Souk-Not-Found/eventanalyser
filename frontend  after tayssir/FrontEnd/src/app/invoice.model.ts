export interface Invoice {
  id: number;
  invoiceNumber: string;
  issuedAt: string; // Utiliser string pour LocalDateTime
  userId: number;
  eventId: number;
  amount: number;
  pdfPath: string;
  payment: Payment | null;
}

export interface Payment {
  paymentid: number;
  // Ajoutez d'autres champs si besoin
} 