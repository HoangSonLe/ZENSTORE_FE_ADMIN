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
    filters?: {
        [key: string]: FilterConfig;
    };
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
    filters,
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

    const table = useReactTable({
        data,
        columns,
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
    React.useEffect(() => {
        if (pagination && table.getState().pagination.pageIndex !== pagination.pageIndex) {
            pagination.onPageChange(table.getState().pagination.pageIndex + 1);
        }
    }, [table.getState().pagination.pageIndex]);

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
        <div className="space-y-4">
            <DataTableToolbar
                table={table}
                onReload={onReload}
                searchText={searchText}
                onSearchChange={onSearchChange}
                onSearchSubmit={onSearchSubmit}
                showGlobalFilter={!!onSearchChange}
                filters={filters}
            />

            <div className="rounded-md border relative">
                {/* Loading overlay */}
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-20">
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <span className="mt-2">Loading...</span>
                        </div>
                    </div>
                )}

                {/* New synchronized scrolling implementation */}
                <div
                    className="relative"
                    style={{ height: `${Math.min(pageSize * 41 + 60, 550)}px` }}
                >
                    {/* Create a container with both horizontal and vertical scrolling */}
                    <div className="overflow-x-auto overflow-y-auto h-full">
                        {/* Table container with fixed width columns */}
                        <table className="w-full border-collapse table-fixed">
                            {/* Table Header */}
                            <thead className="sticky top-0 z-10 bg-white border-b">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <th
                                                key={header.id}
                                                colSpan={header.colSpan}
                                                className="h-14 px-4 text-left align-middle font-semibold text-sm text-default-800 capitalize"
                                                style={{
                                                    width: header.column.getSize(),
                                                    minWidth: header.column.getSize(),
                                                    maxWidth: header.column.getSize(),
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
                                                className="border-b border-default-300 transition-colors"
                                                data-state={row.getIsSelected() && "selected"}
                                            >
                                                {row.getVisibleCells().map((cell) => (
                                                    <td
                                                        key={cell.id}
                                                        className="p-4 align-middle text-sm text-default-600 font-normal"
                                                        style={{
                                                            width: cell.column.getSize(),
                                                            minWidth: cell.column.getSize(),
                                                            maxWidth: cell.column.getSize(),
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
                                                className="h-40 text-center align-middle"
                                            >
                                                <div className="flex flex-col items-center justify-center">
                                                    <p className="text-lg font-medium text-gray-500 dark:text-gray-400">
                                                        No results.
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
