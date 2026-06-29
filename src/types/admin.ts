export type OrderStatus =
  | "Pending Verification"
  | "Processing / In Workshop"
  | "Out for Delivery"
  | "Delivered & Completed"
  | "Cancelled";

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  product_title: string;
  quantity: number;
  price_at_purchase: number;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_notes: string | null;
  total_amount: number;
  order_status: OrderStatus;
  created_at: string;
  order_items?: [{ count: number }]; // For joined count
  items_count?: number; // Normalized count
}
