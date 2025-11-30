export interface TradeoffOption {
  label: string;      // e.g., "Fastest Delivery", "Balanced", "Best Quality"
  vendor_id: number;
  vendor_name: string;
  summary: string;    // e.g., "3 days" or "Weighted score 0.50"
  rationale: string;  // AI's reasoning
}
