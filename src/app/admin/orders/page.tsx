import { supabase } from "@/utils/supabase";
import { Order } from "@/types/admin";
import OrdersDashboard from "@/components/admin/OrdersDashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Next.js Server Component
export default async function AdminOrdersPage() {
  
  let orders: Order[] = [];

  try {
    // Perform relational fetch with item count
    const { data: rawOrders, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (count)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Normalize the data format to fit our Order type explicitly checking order_status
    orders = (rawOrders || []).map((order: any) => ({
      ...order,
      order_status: order.order_status,
      items_count: order.order_items?.[0]?.count || 0
    }));

  } catch (error: any) {
    console.error("Critical Admin Fetch Failure:", error.message || error);
    return (
      <div className="p-12 text-center text-red-500">
        Failed to load orders: {error.message || "Unknown error"}
      </div>
    );
  }

  return (
    <div className="py-12 px-6 lg:px-12 bg-neutral-50/50 min-h-screen">
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-3xl font-serif text-neutral-900">Order Management</h1>
        <p className="text-neutral-500 mt-2">Real-time fulfillment and status tracking.</p>
      </div>

      <OrdersDashboard initialOrders={orders} />
    </div>
  );
}
