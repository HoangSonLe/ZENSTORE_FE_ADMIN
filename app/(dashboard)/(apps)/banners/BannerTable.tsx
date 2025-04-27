"use client";

import bannerApi from "@/apis/banner/banner.api";
import { IBanner } from "@/apis/banner/banner.interface";
import { CommonTable, CommonTableResponse } from "@/components/table/CommonTable";
import { DataTableColumnHeader } from "@/components/table/advanced/components/data-table-column-header";
import { renderDate, renderImage, renderText } from "@/components/table/cell-renderers";
import { EBannerOrder } from "@/constants/enum";
import { ColumnDef } from "@tanstack/react-table";
import { Fragment, useCallback, useState } from "react";
import {
    BasicDialog as Dialog,
    BasicDialogContent as DialogContent,
    BasicDialogHeader as DialogHeader,
    BasicDialogTitle as DialogTitle,
} from "@/components/ui/basic-dialog";
import { toast } from "sonner";
import UpdateBannerDetail from "./components/update-banner-detail";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

export default function BannerTable() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [selectedBanner, setSelectedBanner] = useState<IBanner | null>(null);
    const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

    // Function to fetch banners from API - using useCallback to prevent infinite re-renders
    const fetchBanners = useCallback(async (): Promise<CommonTableResponse<IBanner>> => {
        try {
            const response = await bannerApi.getBannerList({});
            
            // Adapt the API response to match CommonTableResponse interface
            return {
                data: Array.isArray(response.data) ? response.data : [],
                total: Array.isArray(response.data) ? response.data.length : 0,
            };
        } catch (error) {
            console.error("Error fetching banners:", error);
            toast.error("Lỗi khi tải danh sách banner");
            throw error;
        }
    }, []);

    // Function to handle banner update
    const handleUpdateBanner = (banner: IBanner) => {
        setSelectedBanner(banner);
        setIsUpdateDialogOpen(true);
    };

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
            size: 200,
        },
        {
            accessorKey: "bannerName",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Tên banner" />,
            cell: ({ row }) => renderText(row, "bannerName"),
            size: 200,
        },
        {
            accessorKey: "bannerTitle",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Tiêu đề" />,
            cell: ({ row }) => renderText(row, "bannerTitle"),
            size: 200,
        },
        {
            accessorKey: "bannerSubTitle",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Mô tả" />,
            cell: ({ row }) => renderText(row, "bannerSubTitle"),
            size: 200,
        },
        {
            accessorKey: "bannerTypeName",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Vị trí" />,
            cell: ({ row }) => {
                const bannerTypeCode = row.getValue("bannerTypeCode") as EBannerOrder;
                const bannerTypeName = row.getValue("bannerTypeName") as string;
                
                return (
                    <div className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 inline-block">
                        {bannerTypeName || bannerTypeCode}
                    </div>
                );
            },
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
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleUpdateBanner(row.original)}
                    className="hover:bg-primary/10"
                >
                    <Edit className="h-4 w-4" />
                </Button>
            ),
            size: 80,
        },
    ];

    return (
        <Fragment>
            {/* Update Banner Dialog */}
            <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
                <DialogContent size="3xl" className="w-full max-w-[800px]">
                    <DialogHeader>
                        <DialogTitle>Cập nhật banner</DialogTitle>
                    </DialogHeader>
                    {selectedBanner && (
                        <UpdateBannerDetail
                            banner={selectedBanner}
                            onClose={() => setIsUpdateDialogOpen(false)}
                            onSuccess={() => {
                                setRefreshTrigger((prev) => prev + 1);
                                setIsUpdateDialogOpen(false);
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <CommonTable<IBanner, any>
                columns={columns}
                fetchData={fetchBanners}
                initialFilters={{}}
                defaultPageSize={10}
                key={refreshTrigger} // Add key to force re-render when data changes
            />
        </Fragment>
    );
}
