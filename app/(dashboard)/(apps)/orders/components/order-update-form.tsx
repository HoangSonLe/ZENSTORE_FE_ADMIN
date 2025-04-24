"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define the Order interface
interface IOrder {
  orderId: number;
  orderNumber: string;
  customerName: string;
  orderDate: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  shippingMethod: string;
}

interface OrderUpdateFormProps {
  order: IOrder;
  onClose: () => void;
  onUpdate?: (updatedOrder: IOrder) => Promise<void>;
}

export default function OrderUpdateForm({
  order,
  onClose,
  onUpdate,
}: OrderUpdateFormProps) {
  const [formData, setFormData] = useState<Partial<IOrder>>({
    customerName: order.customerName,
    totalAmount: order.totalAmount,
    status: order.status,
    paymentMethod: order.paymentMethod,
    shippingMethod: order.shippingMethod,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "totalAmount" ? Number(value) : value,
    }));
  };

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      status: value,
    }));
  };

  const handlePaymentMethodChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethod: value,
    }));
  };

  const handleShippingMethodChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      shippingMethod: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (onUpdate) {
        const updatedOrder = {
          ...order,
          ...formData,
        };
        await onUpdate(updatedOrder);
      }
      toast.success("Order updated successfully");
      onClose();
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="customerName" className="text-right">
            Customer
          </Label>
          <Input
            id="customerName"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="totalAmount" className="text-right">
            Amount
          </Label>
          <Input
            id="totalAmount"
            name="totalAmount"
            type="number"
            value={formData.totalAmount}
            onChange={handleChange}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="status" className="text-right">
            Status
          </Label>
          <Select
            value={formData.status}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PROCESSING">Processing</SelectItem>
              <SelectItem value="SHIPPED">Shipped</SelectItem>
              <SelectItem value="DELIVERED">Delivered</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="paymentMethod" className="text-right">
            Payment
          </Label>
          <Select
            value={formData.paymentMethod}
            onValueChange={handlePaymentMethodChange}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
              <SelectItem value="PAYPAL">PayPal</SelectItem>
              <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
              <SelectItem value="CASH_ON_DELIVERY">Cash on Delivery</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="shippingMethod" className="text-right">
            Shipping
          </Label>
          <Select
            value={formData.shippingMethod}
            onValueChange={handleShippingMethodChange}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select shipping method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="STANDARD">Standard</SelectItem>
              <SelectItem value="EXPRESS">Express</SelectItem>
              <SelectItem value="OVERNIGHT">Overnight</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? "Saving..." : "Save changes"}
        </Button>
      </DialogFooter>
    </form>
  );
}
