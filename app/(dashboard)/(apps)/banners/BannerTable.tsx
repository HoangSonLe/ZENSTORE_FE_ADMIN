"use client";

import bannerApi from "@/apis/banner/banner.api";
import { IBanner, IBannerQuery } from "@/apis/banner/banner.interface";
import { CommonTable } from "@/components/table/CommonTable";
import { ActionButtons } from "@/components/table/action-buttons";
import { DataTableColumnHeader } from "@/components/table/advanced/components/data-table-column-header";
import { renderDate, renderImage, renderText } from "@/components/table/cell-renderers";
import { ColumnDef } from "@tanstack/react-table";
import { Fragment, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
    BasicDialog as Dialog,
    BasicDialogContent as DialogContent,
    BasicDialogHeader as DialogHeader,
    BasicDialogTitle as DialogTitle,
} from "@/components/ui/basic-dialog";
import { toast } from "sonner";
import UpdateBannerDetail from "./components/update-banner-detail";
import { CommonTableResponse } from "@/components/table/CommonTable";
import { EBannerOrder } from "@/constants/enum";

export default function BannerTable() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Function to fetch banners from API - using useCallback to prevent infinite re-renders
    const fetchBanners = useCallback(
        async (params: IBannerQuery): Promise<CommonTableResponse<IBanner>> => {
            try {
                // Convert state string to boolean if it exists
                const queryParams = { ...params };

                // Handle state filter conversion from string to boolean
                if (typeof queryParams.state === "string") {
                    if (queryParams.state !== "") {
                        // Convert string "true"/"false" to boolean
                        queryParams.state = queryParams.state === "true";
                    } else {
                        // If state is empty string, remove it from the query
                        delete queryParams.state;
                    }
                }

                const response = await bannerApi.getBannerList({ params: queryParams });

                // Create a properly typed response
                const result: CommonTableResponse<IBanner> = {
                    data: [],
                    total: 0,
                };

                // Safely extract data if it exists
                if (response.data && response.isSuccess) {
                    // Extract the banner array from the nested data structure
                    // Use type assertion to handle the complex nested structure
                    const banners = response.data.data as unknown as IBanner[];
                    if (Array.isArray(banners)) {
                        result.data = banners;
                    }

                    // Extract the total count
                    if (typeof response.data.total === "number") {
                        result.total = response.data.total;
                    }
                }

                return result;
            } catch (error) {
                console.error("Error fetching banners:", error);
                toast.error("Lỗi khi tải danh sách banner");
                throw error;
            }
        },
        []
    );

    // Define columns for the banner table
    const columns: ColumnDef<IBanner>[] = [
        {
            accessorKey: "bannerId",
            header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
            cell: ({ row }) => renderText(row, "bannerId", "center"),
            enableSorting: false,
            enableHiding: false,
            size: 80,
        },
        {
            accessorKey: "bannerImage",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Ảnh" />,
            cell: ({ row }) => renderImage(row, "bannerImage", "bannerName"),
            enableSorting: false,
            size: 100,
        },
        {
            accessorKey: "bannerName",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Tên" />,
            cell: ({ row }) => renderText(row, "bannerName"),
            size: 200,
            enableSorting: false,
        },
        {
            accessorKey: "bannerTitle",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Tiêu đề" />,
            cell: ({ row }) => renderText(row, "bannerTitle"),
            size: 200,
            enableSorting: false,
        },
        {
            accessorKey: "bannerSubTitle",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Tiêu đề phụ" />,
            cell: ({ row }) => renderText(row, "bannerSubTitle"),
            size: 200,
            enableSorting: false,
        },
        {
            accessorKey: "bannerTypeName",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Vị trí" />,
            cell: ({ row }) => renderText(row, "bannerTypeName"),
            size: 120,
            enableSorting: false,
        },
        {
            accessorKey: "updatedAt",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày cập nhật" />,
            cell: ({ row }) => renderDate(row, "updatedAt", "HH:mm DD/MM/YYYY", "right"),
            size: 140,
        },
        {
            id: "actions",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Thao tác" />,
            cell: ({ row }) => (
                <ActionButtons
                    row={row.original}
                    renderUpdateForm={(banner, onClose) => (
                        <UpdateBannerDetail
                            banner={banner as IBanner}
                            onClose={onClose}
                            onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
                        />
                    )}
                />
            ),
            size: 100,
        },
    ];

    // Define sort mapping for the banner table
    const sortMapping: Record<string, number> = {
        bannerId: 1,
        bannerName: 2,
        updatedAt: 3,
    };

    // Define initial filters
    const initialFilters = {
        state: "",
        bannerTypeCode: "",
    };

    // Define banner type options for filtering
    const bannerTypeOptions = [
        { value: EBannerOrder.ROW_1, label: "Hàng 1" },
        { value: EBannerOrder.ROW_2, label: "Hàng 2" },
        { value: EBannerOrder.ROW_3, label: "Hàng 3" },
        { value: EBannerOrder.ROW_4, label: "Hàng 4" },
        { value: EBannerOrder.ROW_5, label: "Hàng 5" },
    ];

    return (
        <Fragment>
            {/* Define filter options for the CommonTable */}
            <CommonTable<IBanner, IBannerQuery>
                columns={columns}
                fetchData={fetchBanners}
                initialFilters={initialFilters}
                filterOptions={{
                    bannerTypeCode: {
                        options: bannerTypeOptions,
                        title: "Vị trí",
                    },
                }}
                filterMapping={{
                    state: "state",
                    bannerTypeCode: "bannerTypeCode",
                }}
                sortMapping={sortMapping}
                defaultPageSize={10}
                key={refreshTrigger} // Add key to force re-render when data changes
            />
        </Fragment>
    );
}
