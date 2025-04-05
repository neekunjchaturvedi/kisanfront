import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Order } from "@/types/order";
import { MoreHorizontal } from "lucide-react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useMemo } from "react";

interface OrdersTableProps {
  orders: Order[];
  selectedOrders: string[];
  onSelectOrder: (orderId: string) => void;
  onSelectAllOrders: (selected: boolean) => void;
  onViewOrderDetails: (order: Order) => void;
  onOrderUpdate?: (updatedOrder: any) => void;
}

export function OrdersTable({
  orders,
  selectedOrders,
  onSelectOrder,
  onSelectAllOrders,
  onViewOrderDetails,
  onOrderUpdate,
}: OrdersTableProps) {
  const { toast } = useToast();

  // Create a sorted version of the orders array (newest first)
  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      // Extract the date objects for comparison
      const dateA = new Date(a.fullOrder?.createdAt || a.date);
      const dateB = new Date(b.fullOrder?.createdAt || b.date);

      // Sort in descending order (newest first)
      return dateB.getTime() - dateA.getTime();
    });
  }, [orders]);

  const handleCancel = async (order: Order) => {
    try {
      const response = await axios.put(
        `http://www.localhost:5000/api/admin/orders/update/${order.fullOrder._id}`,
        {
          status: "Cancelled",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Show success toast
      toast({
        description: `Order ${order.orderId} has been cancelled successfully.`,
      });

      // Update the parent component if callback is provided
      if (onOrderUpdate && response.data.order) {
        onOrderUpdate(response.data.order);
      }

      // Reload the page
      setTimeout(() => location.reload(), 1000);
    } catch (error) {
      console.error("Failed to cancel order:", error);

      toast({
        variant: "destructive",
        description: "Failed to cancel order. Please try again.",
      });
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]">
            <Checkbox
              checked={
                sortedOrders.length > 0 &&
                selectedOrders.length === sortedOrders.length
              }
              onCheckedChange={(checked) => onSelectAllOrders(!!checked)}
              disabled={sortedOrders.length === 0}
            />
          </TableHead>
          <TableHead>Product</TableHead>
          <TableHead>Order ID</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Customer Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedOrders.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={8}
              className="text-center py-6 text-muted-foreground"
            >
              No orders found
            </TableCell>
          </TableRow>
        ) : (
          sortedOrders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                <Checkbox
                  checked={selectedOrders.includes(order.id)}
                  onCheckedChange={() => onSelectOrder(order.id)}
                />
              </TableCell>
              <TableCell>{order.product}</TableCell>
              <TableCell>{order.orderId}</TableCell>
              <TableCell>{order.date}</TableCell>
              <TableCell>{order.customerName}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    order.status === "delivered"
                      ? "default"
                      : order.status === "cancelled"
                      ? "destructive"
                      : "default"
                  }
                >
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">₹{order.amount}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewOrderDetails(order)}>
                      View Details
                    </DropdownMenuItem>

                    {order.status !== "cancelled" && (
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleCancel(order)}
                      >
                        Cancel Order
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
