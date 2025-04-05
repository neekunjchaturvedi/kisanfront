// components/orders/order-details.tsx
import { useState } from "react";
import axios from "axios";
import { User, Package, MapPin, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";


interface OrderDetailsProps {
  order: any;
  onClose: () => void;
  onOrderUpdate?: (updatedOrder: any) => void;
}

function OrderDetails({ order, onClose, onOrderUpdate }: OrderDetailsProps) {
  const [selectedStatus, setSelectedStatus] = useState(order.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [note, setNote] = useState("");
  const { toast } = useToast(); // shadcn/ui toast hook

  // Format the date nicely
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handle status update
  const handleStatusUpdate = async () => {
    if (selectedStatus === order.status && !note.trim()) {
      return; // No changes to save
    }

    setIsUpdating(true);
    setUpdateError("");

    try {
      const response = await axios.put(
        `http://www.localhost:5000/api/admin/orders/update/${order._id}`,
        {
          status: selectedStatus,
          notes: note.trim() ? note : undefined,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Update response:", response.data);

      // Successful update
      const updatedOrder = response.data.order || {
        ...order,
        status: selectedStatus,
        updatedAt: new Date().toISOString(),
      };

      // Call the update callback if provided
      if (onOrderUpdate) {
        onOrderUpdate(updatedOrder);
      }

      // Show success toast using shadcn/ui toast
      toast({
        description: `Order #${order._id.substr(-5)} updated successfully.`,
      });

      // Clear note field after successful update
      setNote("");
    } catch (error: any) {
      console.error("Failed to update order status:", error);

      // Get detailed error message from response if available
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update order status. Please try again.";

      setUpdateError(errorMessage);

      // Show error toast
      toast({
        variant: "destructive",
        description: errorMessage,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Status badge variant helper
  const getStatusBadgeVariant = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "delivered") return "default";
    if (statusLower === "cancelled") return "destructive";
    if (statusLower === "shipped") return "default";
    return "secondary";
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-auto p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">
                Order Details
              </h1>
              <p className="text-sm text-gray-500">
                Order ID: #{order._id.substr(-5)}
                <span className="mx-2">•</span>
                {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                disabled={isUpdating}
              >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <Button
                onClick={handleStatusUpdate}
                disabled={
                  isUpdating ||
                  (selectedStatus === order.status && !note.trim())
                }
                variant="default"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isUpdating ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>

          {updateError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {updateError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="bg-gray-200 p-2 rounded-lg mr-3">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Customer</h3>
                    <p className="text-sm text-gray-600">
                      {order.shippingAddress?.name || "Customer"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Phone: {order.shippingAddress?.phone}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="bg-gray-200 p-2 rounded-lg mr-3">
                    <Package className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Order Info</h3>
                    <p className="text-sm text-gray-600">
                      Payment Method: {order.paymentMethod}
                    </p>
                    <p className="text-sm text-gray-600">
                      Status:{" "}
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </p>
                    <p className="text-sm text-gray-600">
                      Payment Status: {order.paymentStatus}
                    </p>
                    <p className="text-sm text-gray-600">
                      Last Updated: {formatDate(order.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="bg-gray-200 p-2 rounded-lg mr-3">
                    <MapPin className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Deliver to</h3>
                    <p className="text-sm text-gray-600">
                      {order.shippingAddress?.address},{" "}
                      {order.shippingAddress?.city},{" "}
                      {order.shippingAddress?.pincode}
                    </p>
                    {order.shippingAddress?.notes && (
                      <p className="text-sm text-gray-600">
                        Notes: {order.shippingAddress.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {order.specialInstructions && (
            <div className="mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Special Instructions</h3>
                <p className="text-sm text-gray-600">
                  {order.specialInstructions}
                </p>
              </div>
            </div>
          )}

          <div className="mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Add Notes</h3>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="Type some notes about this order"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={isUpdating}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg">
            <h3 className="font-medium mb-4">Products</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.items.map((item: any, index: number) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {item.image && (
                            <div className="h-10 w-10 bg-gray-200 rounded-md mr-3 overflow-hidden">
                              <img
                                src={item.image}
                                alt={item.productName}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                          {!item.image && (
                            <div className="h-10 w-10 bg-gray-200 rounded-md mr-3"></div>
                          )}
                          <div className="text-sm text-gray-900">
                            {item.productName}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.productType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{Number(item.price).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{Number(item.totalPrice).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-gray-200 mt-4 pt-4">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">
                      ₹{Number(order.totalAmount).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-lg font-medium pt-2 border-t">
                    <span>Total</span>
                    <span>₹{Number(order.totalAmount).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose} disabled={isUpdating}>
              Close
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={
                isUpdating || (selectedStatus === order.status && !note.trim())
              }
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isUpdating ? "Updating..." : "Update Order"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;
