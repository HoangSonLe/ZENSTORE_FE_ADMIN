"use client";

import { Fragment, useState, useEffect } from "react";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { IProduct, IProductQuery } from "@/apis/product/product.interface";
import { DataTableColumnHeader } from "@/components/table/advanced/components/data-table-column-header";
import { DataTableRowActions } from "@/components/table/advanced/components/data-table-row-actions";
import { DataTable } from "@/components/table/advanced/components/data-table";
import productApi from "@/apis/product/product.api";
import env from "@/constants/env";
import { EProductStatus } from "@/constants/enum";
import { Badge } from "@/components/ui/badge";
import { formatVND } from "@/lib/utils";
import dayjs from "dayjs";

const columns: ColumnDef<IProduct>[] = [
    {
        accessorKey: "productId",
        header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
        cell: ({ row }) => <div>{row.getValue("productId")}</div>,
        enableSorting: false,
        enableHiding: false,
        size: 80, // Fixed width for the column
    },
    {
        accessorKey: "listImage",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Hình ảnh" />,
        size: 100, // Fixed width for the column
        cell: ({ row }) => {
            try {
                const images = row.getValue("listImage");
                let imageUrl = "/images/placeholder.png";

                if (Array.isArray(images) && images.length > 0) {
                    imageUrl = images[0];
                } else if (typeof images === "string") {
                    imageUrl = images;
                }

                // Add error handling for the image
                return (
                    <div className="flex justify-center items-center">
                        <div className="w-12 h-12 relative rounded-md overflow-hidden bg-gray-100">
                            <img
                                src={imageUrl}
                                alt={String(row.getValue("productName") || "Product")}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = "/images/placeholder.png";
                                }}
                            />
                        </div>
                    </div>
                );
            } catch (error) {
                console.error("Error rendering image:", error);
                return (
                    <div className="flex justify-center items-center">
                        <div className="w-12 h-12 relative rounded-md overflow-hidden bg-gray-100">
                            <div className="flex items-center justify-center h-full text-gray-400">
                                N/A
                            </div>
                        </div>
                    </div>
                );
            }
        },
        enableSorting: false,
    },
    {
        accessorKey: "productName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tên" />,
        size: 200, // Allow product name to take more space
    },
    {
        accessorKey: "productStatusName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
        size: 120, // Fixed width for the column
        cell: ({ row }) => {
            try {
                const status = row.getValue("productStatusCode") as string;
                const statusName = (row.getValue("productStatusName") as string) || "Unknown";

                // Determine badge color based on status
                let badgeColor: "default" | "success" | "warning" | "destructive" | "info" =
                    "default";

                if (status) {
                    switch (status) {
                        case EProductStatus.BEST_SELL:
                            badgeColor = "success";
                            break;
                        case EProductStatus.SALE:
                        case EProductStatus.SALE10:
                        case EProductStatus.SALE20:
                        case EProductStatus.SALE30:
                            badgeColor = "warning";
                            break;
                        case EProductStatus.OUT_STOCK:
                            badgeColor = "destructive";
                            break;
                        case EProductStatus.NEW:
                            badgeColor = "info";
                            break;
                        default:
                            badgeColor = "default";
                    }
                }

                return (
                    <div className="flex justify-center items-center">
                        <Badge color={badgeColor} variant="soft">
                            {statusName || "Unknown"}
                        </Badge>
                    </div>
                );
            } catch (error) {
                console.error("Error rendering status:", error);
                return (
                    <div className="flex justify-center items-center">
                        <Badge color="default" variant="soft">
                            Unknown
                        </Badge>
                    </div>
                );
            }
        },
    },
    {
        accessorKey: "productSpaceName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Dung lượng" />,
        size: 120, // Fixed width for the column
        cell: ({ row }) => {
            try {
                const spaceName = row.getValue("productSpaceName") as string;

                return (
                    <div className="flex justify-center items-center">
                        <Badge color="info" variant="soft">
                            {spaceName || "Unknown"}
                        </Badge>
                    </div>
                );
            } catch (error) {
                console.error("Error rendering space name:", error);
                return (
                    <div className="flex justify-center items-center">
                        <Badge color="info" variant="soft">
                            Unknown
                        </Badge>
                    </div>
                );
            }
        },
    },
    {
        accessorKey: "productColorName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Màu sắc" />,
        size: 120, // Fixed width for the column
        cell: ({ row }) => {
            try {
                const colorName = (row.getValue("productColorName") as string) || "Unknown";
                const colorCode = (row.getValue("productColorCode") as string) || "";

                // Map color code to CSS color (this is a simple example, you might need to adjust)
                let cssColor = "#888";
                if (colorCode) {
                    switch (colorCode.toString().toUpperCase()) {
                        case "BLACK":
                            cssColor = "#000";
                            break;
                        case "WHITE":
                            cssColor = "#fff";
                            break;
                        case "BROWN":
                            cssColor = "#8B4513";
                            break;
                        case "GRAY":
                            cssColor = "#808080";
                            break;
                        // Add more colors as needed
                    }
                }

                return (
                    <div className="flex items-center gap-2">
                        <div
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: cssColor }}
                        />
                        <span>{colorName || "Unknown"}</span>
                    </div>
                );
            } catch (error) {
                console.error("Error rendering color:", error);
                return (
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border border-gray-300 bg-gray-300" />
                        <span>Unknown</span>
                    </div>
                );
            }
        },
    },
    {
        accessorKey: "productPriceSale",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Giá" />,
        size: 120, // Fixed width for the column
        cell: ({ row }) => {
            try {
                const priceSale = (row.getValue("productPriceSale") as number) || 0;
                const price = (row.getValue("productPrice") as number) || 0;

                return (
                    <div className="flex flex-col items-end text-right">
                        <span className="font-medium">{formatVND(priceSale)}</span>
                        {priceSale < price && (
                            <span className="text-xs text-gray-500 line-through">
                                {formatVND(price)}
                            </span>
                        )}
                    </div>
                );
            } catch (error) {
                console.error("Error rendering price:", error);
                return (
                    <div className="flex flex-col items-end text-right">
                        <span className="font-medium">{formatVND(0)}</span>
                    </div>
                );
            }
        },
    },
    {
        accessorKey: "productSeriesName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Series" />,
        size: 120, // Fixed width for the column
        cell: ({ row }) => {
            try {
                const seriesName = (row.getValue("productSeriesName") as string) || "Unknown";

                return (
                    <div className="flex justify-center items-center">
                        <Badge color="secondary" variant="soft">
                            {seriesName}
                        </Badge>
                    </div>
                );
            } catch (error) {
                console.error("Error rendering series name:", error);
                return (
                    <div className="flex justify-center items-center">
                        <Badge color="secondary" variant="soft">
                            Unknown
                        </Badge>
                    </div>
                );
            }
        },
    },
    {
        accessorKey: "updatedAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Cập nhật cuối" />,
        size: 140, // Fixed width for the column
        cell: ({ row }) => {
            try {
                const updatedAt = row.getValue("updatedAt") as string;

                if (!updatedAt) return <div className="text-center">N/A</div>;

                const formattedDate = dayjs(updatedAt).format("HH:mm DD/MM/YYYY");

                return <div className="text-right pr-4">{formattedDate}</div>;
            } catch (error) {
                console.error("Error rendering updated date:", error);
                return <div className="text-right pr-4">N/A</div>;
            }
        },
    },
    // {
    //     id: "actions",
    //     cell: ({ row }) => <DataTableRowActions row={row} />,
    //     size: 80, // Fixed width for the column
    // },
];

export default function ProductTable() {
    // Log the API URL to debug
    console.log("API URL from env:", env.API_URL);

    // We don't need to store the full response, just the products
    const [products, setProducts] = useState<IProduct[]>([]);
    const [pagination, setPagination] = useState({
        pageNumber: 1,
        pageSize: 10,
        total: 0,
    });
    const [sorting, setSorting] = useState<SortingState>([]);
    const [searchText, setSearchText] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({
        statusCode: [] as string[],
        spaceCode: "",
        seriCode: "",
        colorCode: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Define filter options
    const statusOptions = Object.values(EProductStatus).map((status) => ({
        value: status,
        label: status.replace("_", " "),
    }));

    // We'll fetch these from API in a real application
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

    const fetchProducts = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Convert TanStack Table sorting to API sorting format
            // For this example, we'll use a simple numeric mapping for sorting:
            // 1 = productId ascending, -1 = productId descending
            // 2 = productName ascending, -2 = productName descending
            // etc.
            let sortParam: number | undefined = undefined;

            if (sorting.length > 0) {
                const column = sorting[0].id;
                const direction = sorting[0].desc ? -1 : 1;

                switch (column) {
                    case "productId":
                        sortParam = 1 * direction;
                        break;
                    case "productName":
                        sortParam = 2 * direction;
                        break;
                    // Add more cases for other sortable columns
                    default:
                        sortParam = undefined;
                }
            }

            // Prepare filter parameters
            const filterParams: IProductQuery = {
                pageNumber: pagination.pageNumber,
                pageSize: pagination.pageSize,
                searchString: searchQuery,
                sorter: sortParam,
                statusCode: filters.statusCode.length > 0 ? filters.statusCode : undefined,
                spaceCode: filters.spaceCode || undefined,
                seriCode: filters.seriCode || undefined,
                colorCode: filters.colorCode || undefined,
            };

            // Log the request parameters
            console.log("Fetching products with params:", filterParams);

            const response = await productApi.getProductList({
                params: filterParams,
            });

            // Process the API response
            setProducts(response.data.data);
            setPagination((prev) => ({
                ...prev,
                total: response.data.total,
            }));
        } catch (err) {
            console.error("Error fetching products:", err);
            setError("Failed to load products. Please try again.");
            // Use empty data for now
            setProducts([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [
        pagination.pageNumber,
        pagination.pageSize,
        JSON.stringify(sorting),
        searchQuery,
        JSON.stringify(filters),
    ]);

    const handlePageChange = (pageNumber: number) => {
        setPagination((prev) => ({
            ...prev,
            pageNumber,
        }));
    };

    const handlePageSizeChange = (pageSize: number) => {
        setPagination((prev) => ({
            ...prev,
            pageSize,
            pageNumber: 1, // Reset to first page when changing page size
        }));
    };

    const handleSortingChange = (newSorting: SortingState) => {
        console.log("Sorting changed:", newSorting);
        setSorting(newSorting);
    };

    const handleSearchChange = (value: string) => {
        console.log("Search text changed:", value);
        setSearchText(value);
        // Don't automatically clear the search query when text is cleared
        // Only update searchQuery when the search button is clicked
    };

    const handleSearchSubmit = () => {
        console.log("Search submitted:", searchText);
        setSearchQuery(searchText);
        // Reset to first page when searching
        setPagination((prev) => ({
            ...prev,
            pageNumber: 1,
        }));
    };

    const handleReload = () => {
        console.log("Reloading data...");
        fetchProducts();
    };

    const handleFilterChange = (filterType: string, value: string | string[]) => {
        console.log(`Filter ${filterType} changed:`, value);
        setFilters((prev) => ({
            ...prev,
            [filterType]: value,
        }));
        // Reset to first page when filtering
        setPagination((prev) => ({
            ...prev,
            pageNumber: 1,
        }));
    };

    return (
        <Fragment>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <DataTable
                data={products}
                columns={columns}
                isLoading={isLoading}
                pagination={{
                    pageIndex: pagination.pageNumber - 1, // TanStack Table uses 0-based indexing
                    pageSize: pagination.pageSize,
                    pageCount: Math.ceil(pagination.total / pagination.pageSize),
                    onPageChange: handlePageChange,
                    onPageSizeChange: handlePageSizeChange,
                }}
                sorting={{
                    initialSorting: sorting,
                    onSortingChange: handleSortingChange,
                }}
                searchText={searchText}
                onSearchChange={handleSearchChange}
                onSearchSubmit={handleSearchSubmit}
                onReload={handleReload}
                filters={{
                    status: {
                        options: statusOptions,
                        value: filters.statusCode,
                        onChange: (value) => handleFilterChange("statusCode", value),
                        multi: true, // Status can have multiple values
                    },
                    space: {
                        options: spaceOptions,
                        value: filters.spaceCode,
                        onChange: (value) => handleFilterChange("spaceCode", value),
                        multi: false, // Space is single-select by default
                    },
                    series: {
                        options: seriesOptions,
                        value: filters.seriCode,
                        onChange: (value) => handleFilterChange("seriCode", value),
                        multi: false, // Series is single-select by default
                    },
                    color: {
                        options: colorOptions,
                        value: filters.colorCode,
                        onChange: (value) => handleFilterChange("colorCode", value),
                        multi: true, // Allow selecting multiple colors
                    },
                }}
            />
        </Fragment>
    );
}
