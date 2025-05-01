"use client";

import productApi from "@/apis/product/product.api";
import categoryApi from "@/apis/category/category.api";
import { IProduct, IProductCreateOrUpdate, IProductQuery } from "@/apis/product/product.interface";
import { CommonTable } from "@/components/table/CommonTable";
import { ActionButtons } from "@/components/table/action-buttons";
import { DataTableColumnHeader } from "@/components/table/advanced/components/data-table-column-header";
import {
    BadgeColor,
    renderBadge,
    renderColor,
    renderDate,
    renderImage,
    renderPrice,
    renderText,
} from "@/components/table/cell-renderers";
import { ECategoryType, EProductStatus } from "@/constants/enum";
import { ColumnDef } from "@tanstack/react-table";
import { Fragment, useState } from "react";
// Action buttons are now imported directly
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    BasicDialog as Dialog,
    BasicDialogContent as DialogContent,
    BasicDialogHeader as DialogHeader,
    BasicDialogTitle as DialogTitle,
} from "@/components/ui/basic-dialog";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import CreateProductDetail from "./components/create-product-detail";
import UpdateProductDetail from "./components/update-product-detail";
import { ISelectOption } from "@/apis/base/base.interface";
import { useApi } from "@/hooks/useApi";
import _ from "lodash";
import { IApiResponseTable } from "@/apis/interface";
import { ICategory } from "@/apis/category/category.interface";
import { useAsyncEffect } from "@/hooks";

// Define the ProductTable component
export default function ProductTable() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    const [seriesCodeDataOptions, setSeriesCodeDataOptions] = useState<ISelectOption[]>([]);
    const [colorCodeDataOptions, setColorCodeDataOptions] = useState<ISelectOption[]>([]);
    const [spaceCodeDataOptions, setSpaceCodeDataOptions] = useState<ISelectOption[]>([]);
    const [statusCodeDataOptions, setStatusCodeDataOptions] = useState<ISelectOption[]>([]);
    const { request: getCategoryDataOptions } = useApi(categoryApi.getCategoryDataOptions);

    useAsyncEffect(async () => {
        await getDataOptions();
    });

    const getDataOptions = async () => {
        try {
            await getCategoryDataOptions(undefined, (response: any) => {
                const { data } = response as IApiResponseTable<ICategory>;

                // Map API response
                const apiOptions: ISelectOption[] = data.data
                    .filter((i) => i.categoryCode !== "ALL")
                    .map((item: ICategory) => ({
                        label: _.get(item, "categoryName"),
                        value: _.get(item, "categoryCode"),
                        type: _.get(item, "categoryType"),
                    }));

                setSeriesCodeDataOptions(
                    apiOptions.filter((item) => item.type === ECategoryType.SERIES)
                );
                setColorCodeDataOptions(
                    apiOptions.filter((item) => item.type === ECategoryType.COLOR)
                );
                setSpaceCodeDataOptions(
                    apiOptions.filter((item) => item.type === ECategoryType.SPACE)
                );
                setStatusCodeDataOptions(
                    apiOptions.filter((item) => item.type === ECategoryType.STATUS)
                );
            });
        } catch (error) {
            console.error("Error fetching series code data options:", error);
        }
    };

    // Function to fetch products from the API
    const fetchProducts = async (params: IProductQuery) => {
        // console.log("Fetching products with params:", params);

        try {
            // Map the parameters to match what the API expects
            // If your API expects 'current' instead of 'pageNumber'
            const apiParams = {
                ...params,
                current: params.pageNumber, // Map pageNumber to current if your API expects 'current'
                // Keep pageNumber for backward compatibility
            };

            // console.log("Mapped API params:", apiParams);

            // Call the real API
            const response = await productApi.getProductList({
                params: apiParams,
            });
            return {
                data: response.data.data,
                total: response.data.total,
            };
        } catch (error) {
            console.error("Error fetching products:", error);
            toast.error("Tải dữ liệu sản phẩm lỗi");
            return {
                data: [],
                total: 0,
            };
        }
    };

    // Handler for deleting a product
    const handleDeleteProduct = async (product: IProduct) => {
        try {
            // Call the API to delete the product
            await productApi.deleteProductById({
                params: { productId: product.productId },
            });

            // Trigger a refresh of the table data
            setRefreshTrigger((prev) => prev + 1);

            toast.success("Xóa sản phẩm thành công");
        } catch (error) {
            console.error("Error deleting product:", error);
            // toast.error("Lỗi xóa sản phẩm");
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
            header: ({ column }) => <DataTableColumnHeader column={column} title="Ảnh" />,
            cell: ({ row }) => renderImage(row, "listImage", "productName"),
            enableSorting: false,
            size: 100,
        },
        {
            accessorKey: "productName",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Tên sản phẩm" />,
            cell: ({ row }) => renderText(row, "productName"),
            size: 200,
        },
        {
            accessorKey: "productStatusCode",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
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
            header: ({ column }) => <DataTableColumnHeader column={column} title="Dung lượng" />,
            cell: ({ row }) => renderBadge(row, "productSpaceName", "info"),
            size: 120,
        },
        {
            accessorKey: "productColorName",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Màu" />,
            cell: ({ row }) => {
                return renderText(row, "productColorName");
            },
            size: 120,
        },
        {
            accessorKey: "productPriceSale",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Giá" />,
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
            header: ({ column }) => <DataTableColumnHeader column={column} title="Cập nhật cuối" />,
            cell: ({ row }) => renderDate(row, "updatedAt", "HH:mm DD/MM/YYYY", "right"),
            size: 140,
        },
        {
            id: "actions",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Thao tác" />,
            cell: ({ row }) => (
                <ActionButtons
                    row={row.original}
                    renderUpdateForm={(product, onClose) => (
                        <UpdateProductDetail
                            product={product as IProductCreateOrUpdate}
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
        status: [] as string[], // Use UI filter names, not API parameter names,
        space: "",
        series: "",
        color: "",
    };

    // Define filter options for the CommonTable with explicit titles
    const filterOptions = {
        status: {
            options: statusCodeDataOptions,
            title: "Trạng thái",
        },
        space: {
            options: spaceCodeDataOptions,
            title: "Dung lượng",
        },
        series: {
            options: seriesCodeDataOptions,
            title: "Series",
        },
        color: {
            options: colorCodeDataOptions,
            title: "Màu",
        },
    };

    // Map filter keys to API parameter names
    const filterMapping = {
        status: "statusCodes",
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
                    Tạo mới
                </Button>
            </div>

            {/* Create Product Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent size="5xl" className="w-full max-w-[1200px] max-h-[90vh] p-6">
                    <DialogHeader>
                        <DialogTitle>Tạo mới</DialogTitle>
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
                title="Danh sách sản phẩm"
                defaultPageSize={10}
                key={refreshTrigger} // Add key to force re-render when data changes
            />
        </Fragment>
    );
}
