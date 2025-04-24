"use client";

import { Fragment, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/table/advanced/components/data-table-column-header";
import { CommonTable } from "@/components/table/CommonTable";
import {
    renderBadge,
    renderDate,
    renderPrice,
    renderText,
    BadgeColor,
} from "@/components/table/cell-renderers";
import { ActionButtons } from "@/components/table/action-buttons";
import OrderUpdateForm from "./components/order-update-form";
import { toast } from "react-hot-toast";

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

// Define the OrderQuery interface
interface IOrderQuery {
    pageNumber: number;
    pageSize: number;
    searchString?: string;
    sorter?: number;
    status?: string[];
    paymentMethod?: string;
    shippingMethod?: string;
    dateFrom?: string;
    dateTo?: string;
}

// Define filter options
const statusOptions = [
    { value: "PENDING", label: "Pending" },
    { value: "PROCESSING", label: "Processing" },
    { value: "SHIPPED", label: "Shipped" },
    { value: "DELIVERED", label: "Delivered" },
    { value: "CANCELLED", label: "Cancelled" },
];

const paymentOptions = [
    { value: "CREDIT_CARD", label: "Credit Card" },
    { value: "PAYPAL", label: "PayPal" },
    { value: "BANK_TRANSFER", label: "Bank Transfer" },
    { value: "CASH_ON_DELIVERY", label: "Cash on Delivery" },
];

const shippingOptions = [
    { value: "STANDARD", label: "Standard" },
    { value: "EXPRESS", label: "Express" },
    { value: "OVERNIGHT", label: "Overnight" },
];

// Define the OrderTable component
export default function OrderTable() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Handler for updating an order
    const handleUpdateOrder = async (updatedOrder: IOrder) => {
        try {
            // In a real application, you would call an API to update the order
            // For now, we'll just simulate a successful update
            console.log("Updating order:", updatedOrder);

            // Simulate API call delay
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Trigger a refresh of the table data
            setRefreshTrigger((prev) => prev + 1);

            toast.success("Order updated successfully");
        } catch (error) {
            console.error("Error updating order:", error);
            toast.error("Failed to update order");
            throw error;
        }
    };

    // Handler for deleting an order
    const handleDeleteOrder = async (order: IOrder) => {
        try {
            // In a real application, you would call an API to delete the order
            // For now, we'll just simulate a successful deletion
            console.log("Deleting order:", order);

            // Simulate API call delay
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Trigger a refresh of the table data
            setRefreshTrigger((prev) => prev + 1);
        } catch (error) {
            console.error("Error deleting order:", error);
            toast.error("Failed to delete order");
            throw error;
        }
    };

    // Function to fetch orders from the API (mock implementation)
    const fetchOrders = async (params: IOrderQuery) => {
        console.log("Fetching orders with params:", params);

        try {
            // Simulate API call delay
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Mock data
            const mockOrders: IOrder[] = Array.from({ length: 50 }, (_, i) => ({
                orderId: i + 1,
                orderNumber: `ORD-${1000 + i}`,
                customerName: `Customer ${i + 1}`,
                orderDate: new Date(2023, 0, i + 1).toISOString(),
                totalAmount: (Math.floor(Math.random() * 10000) / 100) * 100,
                status: statusOptions[Math.floor(Math.random() * statusOptions.length)].value,
                paymentMethod:
                    paymentOptions[Math.floor(Math.random() * paymentOptions.length)].value,
                shippingMethod:
                    shippingOptions[Math.floor(Math.random() * shippingOptions.length)].value,
            }));

            // Apply filters to the full dataset first
            let filteredOrders = [...mockOrders];

            // Apply search if provided
            if (params.searchString) {
                const searchLower = params.searchString.toLowerCase();
                filteredOrders = filteredOrders.filter(
                    (order) =>
                        order.orderNumber.toLowerCase().includes(searchLower) ||
                        order.customerName.toLowerCase().includes(searchLower)
                );
            }

            // Apply status filter if provided
            if (params.status && params.status.length > 0) {
                filteredOrders = filteredOrders.filter((order) =>
                    params.status!.includes(order.status)
                );
            }

            // Apply payment method filter if provided
            if (params.paymentMethod) {
                filteredOrders = filteredOrders.filter(
                    (order) => order.paymentMethod === params.paymentMethod
                );
            }

            // Apply shipping method filter if provided
            if (params.shippingMethod) {
                filteredOrders = filteredOrders.filter(
                    (order) => order.shippingMethod === params.shippingMethod
                );
            }

            // Apply sorting if provided
            if (params.sorter) {
                const sortField = Object.entries(sortMapping).find(
                    ([_, value]) => Math.abs(params.sorter!) === value
                )?.[0];

                if (sortField) {
                    const sortDirection = params.sorter > 0 ? 1 : -1;
                    filteredOrders.sort((a, b) => {
                        const aValue = a[sortField as keyof IOrder];
                        const bValue = b[sortField as keyof IOrder];

                        if (typeof aValue === "string" && typeof bValue === "string") {
                            return sortDirection * aValue.localeCompare(bValue);
                        } else {
                            return sortDirection * ((aValue as any) - (bValue as any));
                        }
                    });
                }
            }

            // Get the total count before pagination
            const totalCount = filteredOrders.length;

            // Apply pagination after filtering
            const startIndex = (params.pageNumber - 1) * params.pageSize;
            const endIndex = startIndex + params.pageSize;
            const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

            // When you have a real API, replace the mock implementation with this:
            // const response = await orderApi.getOrderList({
            //     params,
            // });
            // return {
            //     data: response.data.data,
            //     total: response.data.total,
            // };

            return {
                data: paginatedOrders,
                total: totalCount,
            };
        } catch (error) {
            console.error("Error fetching orders:", error);
            toast.error("Failed to load orders");
            return {
                data: [],
                total: 0,
            };
        }
    };

    // Define columns for the order table
    const columns: ColumnDef<IOrder>[] = [
        {
            accessorKey: "orderId",
            header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
            cell: ({ row }) => renderText(row, "orderId", "center"),
            enableSorting: false,
            enableHiding: false,
            size: 80,
        },
        {
            accessorKey: "orderNumber",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Order #" />,
            cell: ({ row }) => renderText(row, "orderNumber"),
            size: 120,
        },
        {
            accessorKey: "customerName",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
            cell: ({ row }) => renderText(row, "customerName"),
            size: 200,
        },
        {
            accessorKey: "orderDate",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
            cell: ({ row }) => renderDate(row, "orderDate", "DD/MM/YYYY", "center"),
            size: 120,
        },
        {
            accessorKey: "totalAmount",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
            cell: ({ row }) => renderPrice(row, "totalAmount"),
            size: 120,
        },
        {
            accessorKey: "status",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
            cell: ({ row }) => {
                // Define color mapping for status badges
                const colorMapping: Record<string, BadgeColor> = {
                    PENDING: "warning",
                    PROCESSING: "info",
                    SHIPPED: "secondary",
                    DELIVERED: "success",
                    CANCELLED: "destructive",
                };
                return renderBadge(row, "status", "default", "status", colorMapping);
            },
            size: 120,
        },
        {
            accessorKey: "paymentMethod",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Payment" />,
            cell: ({ row }) => renderText(row, "paymentMethod"),
            size: 120,
        },
        {
            accessorKey: "shippingMethod",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Shipping" />,
            cell: ({ row }) => renderText(row, "shippingMethod"),
            size: 120,
        },
        {
            id: "actions",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Actions" />,
            cell: ({ row }) => (
                <ActionButtons
                    row={row.original}
                    renderUpdateForm={(order, onClose) => (
                        <OrderUpdateForm
                            order={order}
                            onClose={onClose}
                            onUpdate={handleUpdateOrder}
                        />
                    )}
                    onDelete={handleDeleteOrder}
                />
            ),
            size: 100,
        },
    ];

    // Define sort mapping for the order table
    const sortMapping: Record<string, number> = {
        orderId: 1,
        orderDate: 2,
        totalAmount: 3,
    };

    // Define initial filters
    const initialFilters = {
        status: [] as string[],
        paymentMethod: "",
        shippingMethod: "",
    };

    // Define filter options for the CommonTable
    const filterOptions = {
        status: statusOptions,
        payment: paymentOptions,
        shipping: shippingOptions,
    };

    return (
        <Fragment>
            <CommonTable<IOrder, IOrderQuery>
                columns={columns}
                fetchData={fetchOrders}
                initialFilters={initialFilters}
                filterOptions={filterOptions}
                sortMapping={sortMapping}
                title="Orders"
                defaultPageSize={10}
                key={refreshTrigger} // Add key to force re-render when data changes
            />
        </Fragment>
    );
}
