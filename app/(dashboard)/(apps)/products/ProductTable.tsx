"use client";

import { Fragment, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { IProduct, IProductQuery } from "@/apis/product/product.interface";
import { DataTableColumnHeader } from "@/components/table/advanced/components/data-table-column-header";
import productApi from "@/apis/product/product.api";
import { EProductStatus } from "@/constants/enum";
import { CommonTable } from "@/components/table/CommonTable";
import { ActionButtons } from "@/components/table/action-buttons";
import {
    renderImage,
    renderBadge,
    renderColor,
    renderPrice,
    renderDate,
    renderText,
    BadgeColor,
} from "@/components/table/cell-renderers";
// Action buttons are now imported directly
import UpdateProductDetail from "./components/update-product-detail";
import CreateProductDetail from "./components/create-product-detail";
import { toast } from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Define filter options
const statusOptions = Object.values(EProductStatus).map((status) => ({
    value: status,
    label: status.replace("_", " "),
}));

const spaceOptions = [
    { value: "LIVING", label: "Living Room" },
    { value: "BEDROOM", label: "Bedroom" },
    { value: "KITCHEN", label: "Kitchen" },
    { value: "BATHROOM", label: "Bathroom" },
];

const seriesOptions = [
    { value: "MODERN", label: "Modern" },
    { value: "CLASSIC", label: "Classic" },
    { value: "VINTAGE", label: "Vintage" },
    { value: "MINIMALIST", label: "Minimalist" },
];

const colorOptions = [
    { value: "BLACK", label: "Black" },
    { value: "WHITE", label: "White" },
    { value: "BROWN", label: "Brown" },
    { value: "GRAY", label: "Gray" },
];

// Define the ProductTable component
export default function ProductTable() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    // Function to fetch products from the API
    const fetchProducts = async (params: IProductQuery) => {
        console.log("Fetching products with params:", params);

        try {
            // Map the parameters to match what the API expects
            // If your API expects 'current' instead of 'pageNumber'
            const apiParams = {
                ...params,
                current: params.pageNumber, // Map pageNumber to current if your API expects 'current'
                // Keep pageNumber for backward compatibility
            };

            console.log("Mapped API params:", apiParams);

            // Call the real API
            const response = await productApi.getProductList({
                params: apiParams,
            });

            console.log("API response:", response);
            console.log("Total items:", response.data.total);
            console.log("Page size:", response.data.pageSize);
            console.log("Page number:", response.data.pageNumber);
            console.log(
                "Number of pages:",
                Math.ceil(response.data.total / response.data.pageSize)
            );

            return {
                data: response.data.data,
                total: response.data.total,
            };
        } catch (error) {
            console.error("Error fetching products:", error);
            toast.error("Failed to load products");
            return {
                data: [],
                total: 0,
            };
        }
    };

    // Handler for deleting a product
    const handleDeleteProduct = async (product: IProduct) => {
        try {
            console.log("Deleting product:", product);

            // Call the API to delete the product
            await productApi.deleteProductById({
                params: { productId: product.productId },
            });

            // Trigger a refresh of the table data
            setRefreshTrigger((prev) => prev + 1);

            toast.success("Product deleted successfully");
        } catch (error) {
            console.error("Error deleting product:", error);
            toast.error("Failed to delete product");
            throw error;
        }
    };

    // Define columns for the product table
    const columns: ColumnDef<IProduct>[] = [
        {
            accessorKey: "productId",
            header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
            cell: ({ row }) => renderText(row, "productId", "center"),
            enableSorting: false,
            enableHiding: false,
            size: 80,
        },
        {
            accessorKey: "listImage",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Image" />,
            cell: ({ row }) => renderImage(row, "listImage", "productName"),
            enableSorting: false,
            size: 100,
        },
        {
            accessorKey: "productName",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
            cell: ({ row }) => renderText(row, "productName"),
            size: 200,
        },
        {
            accessorKey: "productStatusCode",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
            cell: ({ row }) => {
                // Define color mapping for status badges
                const colorMapping: Record<string, BadgeColor> = {
                    [EProductStatus.BEST_SELL]: "success",
                    [EProductStatus.SALE]: "warning",
                    [EProductStatus.SALE10]: "warning",
                    [EProductStatus.SALE20]: "warning",
                    [EProductStatus.SALE30]: "warning",
                    [EProductStatus.OUT_STOCK]: "destructive",
                    [EProductStatus.NEW]: "info",
                };
                // Use productStatusName for display if available, otherwise use code
                const displayValue =
                    row.original.productStatusName || row.getValue("productStatusCode");
                return (
                    <div className="flex justify-center items-center">
                        <Badge
                            color={
                                colorMapping[row.getValue("productStatusCode") as string] ||
                                "default"
                            }
                            variant="soft"
                        >
                            {displayValue}
                        </Badge>
                    </div>
                );
            },
            size: 120,
        },
        {
            accessorKey: "productSpaceName",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Space" />,
            cell: ({ row }) => renderBadge(row, "productSpaceName", "info"),
            size: 120,
        },
        {
            accessorKey: "productColorName",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Color" />,
            cell: ({ row }) => {
                // Define color mapping for color circles
                const colorMapping: Record<string, string> = {
                    BLACK: "#000",
                    WHITE: "#fff",
                    BROWN: "#8B4513",
                    GRAY: "#808080",
                };
                return renderColor(row, "productColorName", "productColorCode", colorMapping);
            },
            size: 120,
        },
        {
            accessorKey: "productPriceSale",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Price" />,
            cell: ({ row }) => renderPrice(row, "productPriceSale", "productPrice"),
            size: 120,
        },
        {
            accessorKey: "productSeriesName",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Series" />,
            cell: ({ row }) => renderBadge(row, "productSeriesName", "secondary"),
            size: 120,
        },
        {
            accessorKey: "updatedAt",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Last Updated" />,
            cell: ({ row }) => renderDate(row, "updatedAt", "HH:mm DD/MM/YYYY", "right"),
            size: 140,
        },
        {
            id: "actions",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Actions" />,
            cell: ({ row }) => (
                <ActionButtons
                    row={row.original}
                    renderUpdateForm={(product, onClose) => (
                        <UpdateProductDetail
                            product={product}
                            onClose={onClose}
                            onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
                        />
                    )}
                    onDelete={handleDeleteProduct}
                />
            ),
            size: 100,
        },
    ];

    // Define sort mapping for the product table
    const sortMapping: Record<string, number> = {
        productId: 1,
        productName: 2,
        // Add more mappings as needed
    };

    // Define initial filters
    const initialFilters = {
        status: [] as string[], // Use UI filter names, not API parameter names
        space: "",
        series: "",
        color: "",
    };

    // Define filter options for the CommonTable
    const filterOptions = {
        status: statusOptions,
        space: spaceOptions,
        series: seriesOptions,
        color: colorOptions,
    };

    // Map filter keys to API parameter names
    const filterMapping = {
        status: "statusCode",
        space: "spaceCode",
        series: "seriCode",
        color: "colorCode",
    };

    return (
        <Fragment>
            {/* Create Product Button */}
            <div className="flex justify-end mb-4">
                <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="flex items-center gap-2"
                >
                    <PlusCircle className="h-4 w-4" />
                    Create Product
                </Button>
            </div>

            {/* Create Product Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent size="5xl" className="w-full max-w-[1200px]">
                    <DialogHeader>
                        <DialogTitle>Create New Product</DialogTitle>
                    </DialogHeader>
                    <CreateProductDetail
                        onClose={() => setIsCreateDialogOpen(false)}
                        onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
                    />
                </DialogContent>
            </Dialog>

            <CommonTable<IProduct, IProductQuery>
                columns={columns}
                fetchData={fetchProducts}
                initialFilters={initialFilters}
                filterOptions={filterOptions}
                filterMapping={filterMapping}
                sortMapping={sortMapping}
                title="Product List"
                defaultPageSize={2}
                key={refreshTrigger} // Add key to force re-render when data changes
            />
        </Fragment>
    );
}
