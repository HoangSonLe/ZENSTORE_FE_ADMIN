"use client";

import blogApi from "@/apis/blog/blog.api";
import { IBlog, IBlogQuery } from "@/apis/blog/blog.interface";
import { CommonTable } from "@/components/table/CommonTable";
import { ActionButtons } from "@/components/table/action-buttons";
import { DataTableColumnHeader } from "@/components/table/advanced/components/data-table-column-header";
import {
    renderDate,
    renderImage,
    renderText,
    renderHtmlContent,
} from "@/components/table/cell-renderers";
import { ColumnDef } from "@tanstack/react-table";
import { Fragment, useState, useCallback } from "react";
import { useApi } from "@/hooks/useApi";
import {
    BasicDialog as Dialog,
    BasicDialogContent as DialogContent,
    BasicDialogHeader as DialogHeader,
    BasicDialogTitle as DialogTitle,
} from "@/components/ui/basic-dialog";
import { toast } from "sonner";
import CreateBlogDetail from "./components/create-blog-detail";
import UpdateBlogDetail from "./components/update-blog-detail";
import { CommonTableResponse } from "@/components/table/CommonTable";

export default function BlogTable() {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Set up API hooks
    const { request: getBlogList } = useApi(blogApi.getBlogList);
    const { request: deleteBlog } = useApi(blogApi.deleteBlog);

    // Function to fetch blogs from API - using useCallback to prevent infinite re-renders
    const fetchBlogs = useCallback(
        async (params: IBlogQuery): Promise<CommonTableResponse<IBlog>> => {
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

                // Create a properly typed response
                const result: CommonTableResponse<IBlog> = {
                    data: [],
                    total: 0,
                };

                // Use the useApi hook to make the API call
                await getBlogList(
                    { params: queryParams },
                    // Success callback
                    (response: any) => {
                        // Safely extract data if it exists
                        if (response.data && response.isSuccess) {
                            // Extract the blog array from the nested data structure
                            // Use type assertion to handle the complex nested structure
                            const blogs = response.data.data as unknown as IBlog[];
                            if (Array.isArray(blogs)) {
                                result.data = blogs;
                            }

                            // Extract the total count
                            if (typeof response.data.total === "number") {
                                result.total = response.data.total;
                            }
                        }
                    },
                    // Error callback
                    (error) => {
                        console.error("Error fetching blogs:", error);
                        toast.error("Lỗi khi tải danh sách bài viết");
                    }
                );

                return result;
            } catch (error) {
                console.error("Error in fetchBlogs:", error);
                toast.error("Lỗi khi tải danh sách bài viết");
                return {
                    data: [],
                    total: 0,
                };
            }
        },
        [getBlogList] // Add getBlogList to dependencies
    );

    // Function to handle blog deletion
    const handleDeleteBlog = async (blog: IBlog) => {
        try {
            // Use the useApi hook to delete the blog
            await deleteBlog(
                { params: { newId: blog.newsId } },
                // Success callback
                () => {
                    toast.success("Xóa bài viết thành công");
                    setRefreshTrigger((prev) => prev + 1);
                },
                // Error callback
                (error) => {
                    console.error("Error deleting blog:", error);
                    toast.error("Lỗi khi xóa bài viết");
                }
            );
        } catch (error) {
            console.error("Error in handleDeleteBlog:", error);
            toast.error("Lỗi khi xóa bài viết");
        }
    };

    // Define columns for the blog table
    const columns: ColumnDef<IBlog>[] = [
        {
            accessorKey: "newsId",
            header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
            cell: ({ row }) => renderText(row, "newsId", "center"),
            enableSorting: false,
            enableHiding: false,
            size: 80,
        },
        {
            accessorKey: "newsThumbnail",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Ảnh" />,
            cell: ({ row }) => renderImage(row, "newsThumbnail", "newsTitle"),
            enableSorting: false,
            size: 100,
        },
        {
            accessorKey: "newsTitle",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Tiêu đề" />,
            cell: ({ row }) => renderText(row, "newsTitle"),
            size: 200,
            enableSorting: false,
        },
        {
            accessorKey: "newsShortContent",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Mô tả ngắn" />,
            cell: ({ row }) => renderHtmlContent(row, "newsShortContent", 80),
            size: 300,
            enableSorting: false,
        },
        {
            accessorKey: "state",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
            cell: ({ row }) => {
                const state = row.getValue("state") as boolean;
                return (
                    <div
                        className={`px-2 py-1 text-center rounded-full text-xs font-medium ${
                            state ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                    >
                        {state ? "Hiển thị" : "Ẩn"}
                    </div>
                );
            },
            size: 100,
        },
        {
            accessorKey: "updatedAt",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày tạo" />,
            cell: ({ row }) => renderDate(row, "updatedAt", "HH:mm DD/MM/YYYY", "right"),
            size: 140,
        },
        {
            id: "actions",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Thao tác" />,
            cell: ({ row }) => (
                <ActionButtons
                    row={row.original}
                    renderUpdateForm={(blog, onClose) => (
                        <UpdateBlogDetail
                            blog={blog as IBlog}
                            onClose={onClose}
                            onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
                        />
                    )}
                    onDelete={(blog) => handleDeleteBlog(blog as IBlog)}
                />
            ),
            size: 100,
        },
    ];

    // Define sort mapping for the blog table using the model-based approach
    // Only include columns that are actually sortable (not explicitly disabled with enableSorting: false)
    const sortMapping: Record<string, string> = {
        state: "state",
        updatedAt: "updatedAt",
    };

    // Define state filter options
    const stateOptions = [
        { label: "Hiển thị", value: "true" },
        { label: "Ẩn", value: "false" },
    ];

    // Define initial filters
    const initialFilters = {
        pageNumber: 1,
        pageSize: 10,
        state: "", // Add state filter
    };

    return (
        <Fragment>
            {/* Create Blog Button */}
            {/* <div className="flex justify-end mb-4">
                <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="flex items-center gap-2"
                >
                    <PlusCircle className="h-4 w-4" />
                    Tạo mới
                </Button>
            </div> */}

            {/* Create Blog Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent size="5xl" className="w-full max-w-[1200px] max-h-[90vh] p-6">
                    <DialogHeader>
                        <DialogTitle>Tạo mới bài viết</DialogTitle>
                    </DialogHeader>
                    <CreateBlogDetail
                        onClose={() => setIsCreateDialogOpen(false)}
                        onSuccess={() => {
                            setRefreshTrigger((prev) => prev + 1);
                            setIsCreateDialogOpen(false);
                        }}
                    />
                </DialogContent>
            </Dialog>

            {/* Define filter options for the CommonTable */}
            <CommonTable<IBlog, IBlogQuery>
                columns={columns}
                fetchData={fetchBlogs}
                initialFilters={initialFilters}
                filterOptions={{
                    state: {
                        options: stateOptions,
                        title: "Trạng thái",
                    },
                }}
                filterMapping={{
                    state: "state",
                }}
                sortMapping={sortMapping}
                defaultPageSize={10}
                key={refreshTrigger} // Add key to force re-render when data changes
            />
        </Fragment>
    );
}
