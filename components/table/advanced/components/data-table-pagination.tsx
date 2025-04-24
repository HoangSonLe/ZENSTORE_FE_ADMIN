import {
    ChevronsLeft,
    ChevronRight,
    ChevronLeft,
    ChevronsRight,
    MoreHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Table } from "@tanstack/react-table";

interface DataTablePaginationProps {
    table: Table<any>;
}

export function DataTablePagination({ table }: DataTablePaginationProps) {
    // Function to render page numbers
    const renderPageNumbers = (table: Table<any>) => {
        const currentPage = table.getState().pagination.pageIndex + 1;
        const totalPages = table.getPageCount();
        const maxVisiblePages = 4; // Maximum number of page buttons to show

        // If we have 4 or fewer pages, show all page numbers
        if (totalPages <= maxVisiblePages) {
            return Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    color={currentPage === page ? "primary" : undefined}
                    className="h-8 w-8 p-0"
                    onClick={() => table.setPageIndex(page - 1)}
                >
                    {page}
                </Button>
            ));
        }

        // For more than 4 pages, show a subset with ellipses
        const pages = [];

        // Determine the range of pages to show
        let startPage, endPage;

        if (currentPage <= 3) {
            // If we're on pages 1-3, show pages 1-4
            startPage = 1;
            endPage = Math.min(4, totalPages);
        } else if (currentPage >= totalPages - 2) {
            // If we're on the last 3 pages, show the last 4 pages
            startPage = Math.max(1, totalPages - 3);
            endPage = totalPages;
        } else {
            // Otherwise, show current page, one before, and two after
            startPage = currentPage - 1;
            endPage = currentPage + 2;
        }

        // Show first page and ellipsis if needed
        if (currentPage > 3) {
            // Add first page
            pages.push(
                <Button
                    key={1}
                    variant={currentPage === 1 ? "default" : "outline"}
                    color={currentPage === 1 ? "primary" : undefined}
                    className="h-8 w-8 p-0"
                    onClick={() => table.setPageIndex(0)}
                >
                    1
                </Button>
            );

            // Add ellipsis if we're not on page 4
            if (currentPage > 4) {
                pages.push(
                    <Button key="start-ellipsis" variant="outline" className="h-8 w-8 p-0" disabled>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                );
            }
        }

        // Add visible pages
        for (let i = startPage; i <= endPage; i++) {
            // Skip first and last page if they'll be shown separately
            if (
                (i === 1 && currentPage > 3) ||
                (i === totalPages && currentPage < totalPages - 2)
            ) {
                continue;
            }

            pages.push(
                <Button
                    key={i}
                    variant={currentPage === i ? "default" : "outline"}
                    color={currentPage === i ? "primary" : undefined}
                    className="h-8 w-8 p-0"
                    onClick={() => table.setPageIndex(i - 1)}
                >
                    {i}
                </Button>
            );
        }

        // Show ellipsis after if not on last few pages
        if (currentPage < totalPages - 2) {
            // Add ellipsis if not on third-to-last page
            if (currentPage < totalPages - 3) {
                pages.push(
                    <Button key="end-ellipsis" variant="outline" className="h-8 w-8 p-0" disabled>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                );
            }

            // Add last page
            pages.push(
                <Button
                    key={totalPages}
                    variant={currentPage === totalPages ? "default" : "outline"}
                    color={currentPage === totalPages ? "primary" : undefined}
                    className="h-8 w-8 p-0"
                    onClick={() => table.setPageIndex(totalPages - 1)}
                >
                    {totalPages}
                </Button>
            );
        }

        return pages;
    };
    return (
        <div className="flex items-center flex-wrap gap-2 justify-between px-2">
            <div className="flex-1 text-sm text-muted-foreground whitespace-nowrap">
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="flex flex-wrap items-center gap-6 lg:gap-8">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                        Rows per page
                    </p>
                    <Select
                        value={`${table.getState().pagination.pageSize}`}
                        onValueChange={(value) => {
                            table.setPageSize(Number(value));
                        }}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={table.getState().pagination.pageSize} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[10, 20, 30, 40, 50].map((pageSize) => (
                                <SelectItem key={pageSize} value={`${pageSize}`}>
                                    {pageSize}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <span className="sr-only">Go to first page</span>
                        <ChevronsLeft className="h-4 w-4 rtl:rotate-180" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                            console.log("Previous page clicked");
                            table.previousPage();
                        }}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <span className="sr-only">Go to previous page</span>
                        <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
                    </Button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">{renderPageNumbers(table)}</div>

                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                            console.log("Next page clicked");
                            table.nextPage();
                        }}
                        disabled={!table.getCanNextPage()}
                    >
                        <span className="sr-only">Go to next page</span>
                        <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        <span className="sr-only">Go to last page</span>
                        <ChevronsRight className="h-4 w-4 rtl:rotate-180" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
