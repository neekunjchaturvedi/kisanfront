// pages/admin/orders.tsx
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { OrderFilters } from "@/components/orders/order-filters";
import { OrdersTable } from "@/components/orders/orders-table";
import { Order, OrderFilterOptions } from "@/types/order";
import { Button } from "@/components/ui/button";
import { Download, Loader2, RefreshCw, Upload } from "lucide-react";
import OrderDetails from "@/components/orders/order-details";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { startOfMonth, endOfMonth, format } from "date-fns";

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  const { toast } = useToast();

  // Get the current month's date range
  const currentMonth = new Date();
  const firstDayOfMonth = startOfMonth(currentMonth);
  const lastDayOfMonth = endOfMonth(currentMonth);

  const [filters, setFilters] = useState<OrderFilterOptions>({
    dateRange: {
      from: firstDayOfMonth,
      to: lastDayOfMonth,
    },
    status: "",
  });

  // Fetch orders from the API
  const fetchOrders = async (showLoadingState = true) => {
    try {
      if (showLoadingState) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const response = await axios.get(
        "http://www.localhost:5000/api/admin/orders/all"
      );

      // Map the API response to match the Order interface
      const formattedOrders: Order[] = response.data.orders.map(
        (order: any) => ({
          id: order._id,
          orderId: `#${order._id.substr(-5)}`,
          date: new Date(order.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          rawDate: new Date(order.createdAt), // Store raw date for filtering
          customerName: order.shippingAddress?.name || "Customer",
          product:
            order.items.length > 0
              ? order.items[0].productName
              : "Multiple Items",
          status: order.status.toLowerCase(),
          amount: order.totalAmount,
          fullOrder: order,
        })
      );

      // Sort orders - newest first
      formattedOrders.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());

      setOrders(formattedOrders);
      setError(null);

      if (!showLoadingState) {
        toast({
          description: "Orders refreshed successfully",
        });
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setError("Failed to load orders. Please try again later.");

      if (!showLoadingState) {
        toast({
          variant: "destructive",
          description: "Failed to refresh orders",
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAllOrders = (selected: boolean) => {
    setSelectedOrders(selected ? filteredOrders.map((order) => order.id) : []);
  };

  // Handler for viewing order details
  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order.fullOrder);
    setShowOrderDetails(true);
  };

  // Handler for closing the order details modal
  const handleCloseOrderDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  };

  // Handler for when an order is updated
  const handleOrderUpdated = (updatedOrder: any) => {
    // Update the orders list with the updated order
    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id === updatedOrder._id) {
          return {
            ...order,
            status: updatedOrder.status.toLowerCase(),
            fullOrder: updatedOrder,
          };
        }
        return order;
      })
    );

    // Update the selected order in the modal
    if (selectedOrder && selectedOrder._id === updatedOrder._id) {
      setSelectedOrder(updatedOrder);
    }
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Update the status filter based on the selected tab
    if (value === "all") {
      setFilters({ ...filters, status: "" });
    } else {
      setFilters({ ...filters, status: value });
    }
  };

  // Filter orders based on selected filters
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Filter by status if specified
      if (filters.status && order.status !== filters.status) {
        return false;
      }

      // Filter by date range
      if (filters.dateRange?.from && filters.dateRange?.to) {
        const orderDate = order.rawDate;
        // Add time to the from date (beginning of day)
        const fromDate = new Date(filters.dateRange.from);
        fromDate.setHours(0, 0, 0, 0);

        // Add time to the to date (end of day)
        const toDate = new Date(filters.dateRange.to);
        toDate.setHours(23, 59, 59, 999);

        if (orderDate < fromDate || orderDate > toDate) {
          return false;
        }
      }

      return true;
    });
  }, [orders, filters]);

  // Get count of orders by status for displaying in tabs
  const orderCounts = useMemo(() => {
    const counts = {
      all: orders.length,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    orders.forEach((order) => {
      if (counts.hasOwnProperty(order.status)) {
        counts[order.status as keyof typeof counts]++;
      }
    });

    return counts;
  }, [orders]);

  // Handle bulk order actions (for future implementation)
  const handleBulkAction = (action: string) => {
    if (selectedOrders.length === 0) {
      toast({
        variant: "destructive",
        description: "No orders selected",
      });
      return;
    }

    // Implement bulk actions here
    toast({
      description: `${action} ${selectedOrders.length} orders - Feature coming soon`,
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      dateRange: {
        from: firstDayOfMonth,
        to: lastDayOfMonth,
      },
      status: "",
    });
    setActiveTab("all");
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-semibold">Orders Management</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchOrders(false)}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          {selectedOrders.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleBulkAction("Cancel")}
            >
              Cancel Selected ({selectedOrders.length})
            </Button>
          )}
        </div>
      </div>

      {/* Status tabs */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4">
          <TabsTrigger value="all">All ({orderCounts.all})</TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({orderCounts.pending})
          </TabsTrigger>
          <TabsTrigger value="processing">
            Processing ({orderCounts.processing})
          </TabsTrigger>
          <TabsTrigger value="shipped">
            Shipped ({orderCounts.shipped})
          </TabsTrigger>
          <TabsTrigger value="delivered">
            Delivered ({orderCounts.delivered})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled ({orderCounts.cancelled})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          <OrderFilters
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={clearFilters}
          />

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading orders...</p>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-md bg-red-50 p-4 text-red-800">
              <p>{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => fetchOrders()}
              >
                Retry
              </Button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center p-10 border rounded-md">
              <p className="text-gray-500">
                No orders found matching your filters
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <OrdersTable
                orders={filteredOrders}
                selectedOrders={selectedOrders}
                onSelectOrder={handleSelectOrder}
                onSelectAllOrders={handleSelectAllOrders}
                onViewOrderDetails={handleViewOrderDetails}
                onOrderUpdate={handleOrderUpdated}
              />

              <div className="flex justify-between items-center p-4 border-t">
                <div className="text-sm text-gray-500">
                  Showing {filteredOrders.length} of {orders.length} orders
                </div>
                {/* Pagination can be added here in the future */}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <OrderDetails
          order={selectedOrder}
          onClose={handleCloseOrderDetails}
          onOrderUpdate={handleOrderUpdated}
        />
      )}
    </div>
  );
}

export default OrdersPage;
