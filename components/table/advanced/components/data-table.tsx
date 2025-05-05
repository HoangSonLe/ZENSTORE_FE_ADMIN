"use client";

import * as React from "react";
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    PaginationState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";

// We're using native HTML table elements instead of the UI components

import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";

interface FilterOption {
    value: string;
    label: string;
}

interface FilterConfig {
    options: FilterOption[];
    value: string | string[];
    onChange: (value: string | string[]) => void;
    multi?: boolean; // Whether to allow multi-select
}

interface DataTableProps<TData> {
    columns: ColumnDef<TData>[];
    data: TData[];
    isLoading?: boolean;
    pagination?: {
        pageIndex: number;
        pageSize: number;
        pageCount: number;
        onPageChange: (pageNumber: number) => void;
        onPageSizeChange: (pageSize: number) => void;
    };
    sorting?: {
        initialSorting: SortingState;
        onSortingChange: (sorting: SortingState) => void;
    };
    onReload?: () => void;
    searchText?: string;
    onSearchChange?: (value: string) => void;
    onSearchSubmit?: () => void;
    onResetSearch?: () => void; // New prop for explicitly resetting search
    filters?: {
        [key: string]: FilterConfig;
    };
    onSortingToggle?: (column: any, desc: boolean) => void; // New prop for direct API call on sorting toggle
}

export function DataTable<TData>({
    columns,
    data,
    isLoading = false,
    pagination,
    sorting: sortingProps,
    onReload,
    searchText = "",
    onSearchChange,
    onSearchSubmit,
    onResetSearch,
    filters,
    onSortingToggle,
}: DataTableProps<TData>) {
    const [rowSelection, setRowSelection] = React.useState({});
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = React.useState<SortingState>(sortingProps?.initialSorting || []);

    // Set up pagination state
    const [{ pageIndex, pageSize }, setPagination] = React.useState<PaginationState>({
        pageIndex: pagination?.pageIndex || 0,
        pageSize: pagination?.pageSize || 10,
    });

    // Update pagination state when props change
    React.useEffect(() => {
        if (pagination) {
            setPagination({
                pageIndex: pagination.pageIndex,
                pageSize: pagination.pageSize,
            });
        }
    }, [pagination?.pageIndex, pagination?.pageSize]);

    // Enhance columns with onSortingToggle prop if provided
    const enhancedColumns = React.useMemo(() => {
        if (!onSortingToggle) return columns;

        return columns.map((column) => {
            // Only modify columns that have a header function
            if (typeof column.header === "function") {
                return {
                    ...column,
                    header: (props: any) => {
                        // Get the original header component
                        const originalHeader = column.header!(props);

                        // If it's a DataTableColumnHeader component, we need to clone it and add the onSortingToggle prop
                        if (
                            originalHeader &&
                            originalHeader.type &&
                            originalHeader.type.name === "DataTableColumnHeader"
                        ) {
                            // Clone the element and add the onSortingToggle prop
                            return React.cloneElement(originalHeader, { onSortingToggle });
                        }

                        // Otherwise, return the original header
                        return originalHeader;
                    },
                };
            }

            return column;
        });
    }, [columns, onSortingToggle]);

    const table = useReactTable({
        data,
        columns: enhancedColumns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
            pagination: { pageIndex, pageSize },
        },
        pageCount: pagination?.pageCount || Math.ceil(data.length / pageSize),
        enableRowSelection: true,
        manualPagination: !!pagination, // Enable manual pagination when pagination props are provided
        manualSorting: !!sortingProps, // Enable manual sorting when sorting props are provided
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    });

    // Handle page change from server-side pagination
    const prevPageIndexRef = React.useRef(pagination?.pageIndex || 0);

    React.useEffect(() => {
        const currentPageIndex = table.getState().pagination.pageIndex;

        // Only trigger onPageChange if the change originated from the table UI
        // and not from a prop update
        if (pagination && currentPageIndex !== pagination.pageIndex) {
            console.log(
                `DataTable: Page index changed from ${pagination.pageIndex} to ${currentPageIndex}`
            );
            pagination.onPageChange(currentPageIndex);
        }

        // Update the ref for the next render
        prevPageIndexRef.current = currentPageIndex;
    }, [table.getState().pagination.pageIndex, pagination]);

    // Handle page size change from server-side pagination
    React.useEffect(() => {
        if (pagination && table.getState().pagination.pageSize !== pagination.pageSize) {
            pagination.onPageSizeChange(table.getState().pagination.pageSize);
        }
    }, [table.getState().pagination.pageSize]);

    // Handle sorting change from server-side sorting
    React.useEffect(() => {
        if (sortingProps && table.getState().sorting !== sortingProps.initialSorting) {
            sortingProps.onSortingChange(table.getState().sorting);
        }
    }, [JSON.stringify(table.getState().sorting)]);

    return (
        <div className="space-y-4 w-full overflow-hidden">
            <DataTableToolbar
                table={table}
                onReload={onReload}
                searchText={searchText}
                onSearchChange={onSearchChange}
                onSearchSubmit={onSearchSubmit}
                onResetSearch={onResetSearch}
                showGlobalFilter={!!onSearchChange}
                filters={filters}
            />

            <div className="rounded-md border border-border relative w-full overflow-hidden">
                {/* Loading overlay */}
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm z-20">
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <span className="mt-2 text-foreground">Loading...</span>
                        </div>
                    </div>
                )}

                {/* Improved table container with better scrolling */}
                <div className="relative table-responsive-height w-full">
                    {/* Create a container with both horizontal and vertical scrolling */}
                    <div
                        className="overflow-auto table-responsive-height w-full table-container"
                        style={{
                            height: `${Math.min(pageSize * 41 + 60, 550)}px`,
                            minHeight: "400px",
                        }}
                    >
                        {/* Table with auto layout for better content handling */}
                        <table className="w-full border-collapse min-w-full">
                            {/* Table Header */}
                            <thead className="sticky top-0 z-10 bg-background border-b border-border">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <th
                                                key={header.id}
                                                colSpan={header.colSpan}
                                                className="h-14 px-4 text-left align-middle font-semibold text-sm text-foreground capitalize whitespace-nowrap"
                                                style={{
                                                    width: header.column.getSize(),
                                                    minWidth:
                                                        header.column.getSize() > 100
                                                            ? header.column.getSize()
                                                            : 100,
                                                }}
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                          header.column.columnDef.header,
                                                          header.getContext()
                                                      )}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>

                            {/* Table Body with vertical scrolling */}
                            <tbody className="divide-y">
                                {table.getRowModel().rows?.length ? (
                                    <>
                                        {table.getRowModel().rows.map((row) => (
                                            <tr
                                                key={row.id}
                                                className="border-b border-border transition-colors hover:bg-muted/50"
                                                data-state={row.getIsSelected() && "selected"}
                                            >
                                                {row.getVisibleCells().map((cell) => (
                                                    <td
                                                        key={cell.id}
                                                        className="p-4 align-middle text-sm text-foreground/80 font-normal table-cell-content"
                                                        style={{
                                                            width: cell.column.getSize(),
                                                            minWidth:
                                                                cell.column.getSize() > 100
                                                                    ? cell.column.getSize()
                                                                    : 100,
                                                            maxWidth: "none",
                                                        }}
                                                    >
                                                        {flexRender(
                                                            cell.column.columnDef.cell,
                                                            cell.getContext()
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}

                                        {/* Add empty rows to maintain height if needed */}
                                        {table.getRowModel().rows.length < pageSize &&
                                            [
                                                ...Array(
                                                    pageSize - table.getRowModel().rows.length
                                                ),
                                            ].map((_, index) => (
                                                <tr
                                                    key={`empty-${index}`}
                                                    className="border-none bg-transparent hover:bg-transparent"
                                                    style={{ borderBottom: "none" }}
                                                >
                                                    <td
                                                        colSpan={columns.length}
                                                        className="h-10 border-none bg-transparent"
                                                    ></td>
                                                </tr>
                                            ))}
                                    </>
                                ) : (
                                    <>
                                        <tr>
                                            <td
                                                colSpan={columns.length}
                                                className="h-20 text-center align-middle"
                                            >
                                                <div className="flex flex-col items-center justify-center w-full py-4">
                                                    <p className="text-lg font-medium text-muted-foreground text-center">
                                                        Không có kết quả
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <DataTablePagination table={table} />
        </div>
    );
}
