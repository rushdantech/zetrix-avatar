export type SubscriptionPlan = "free" | "pro";

/** Mock payment row for Settings history (no real processor). */
export interface MockBillingPayment {
  id: string;
  /** Display date e.g. Apr 13, 2026 */
  date: string;
  item: string;
  amountLabel: string;
  status: "Paid";
  transactionId: string;
  planName: string;
  paymentMethodLabel: string;
  /** ISO timestamp when mock receipt email was “sent” */
  receiptEmailSentAt: string;
  cardholderName: string;
  cardLast4: string;
  /** Optional receipt timestamps (mock; no enforced subscription window). */
  periodStartIso?: string;
  periodEndIso?: string;
}
