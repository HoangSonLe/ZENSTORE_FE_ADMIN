"use client";
import { X, RefreshCw, Filter } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";

import { priorities, statuses } from "../data/data";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { Table } from "@tanstack/react-table";

interface FilterOption {
    value: string;
    label: string;
}

interface FilterConfig {
    title?: string;
    options: FilterOption[];
    value: string | string[];
    onChange: (value: string | string[]) => void;
    multi?: boolean; // Whether to allow multi-select
}

interface DataTableToolbarProps {
    table: Table<any>;
    onReload?: () => void;
    searchText?: string;
    onSearchChange?: (value: string) => void;
    onSearchSubmit?: () => void;
    showGlobalFilter?: boolean;
    filters?: {
        [key: string]: FilterConfig;
    };
}

export function DataTableToolbar({
    table,
    onReload,
    searchText = "",
    onSearchChange,
    onSearchSubmit,
    showGlobalFilter = false,
    filters,
}: DataTableToolbarProps) {
    const isFiltered = table.getState().columnFilters.length > 0;
    const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        table.getColumn("title")?.setFilterValue(value);
    };

    // Handle global search input change
    const handleGlobalSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (onSearchChange) {
            onSearchChange(event.target.value);
        }
    };

    // Handle reload button click
    const handleReload = () => {
        if (onReload) {
            onReload();
        }
    };

    // We've removed the custom dropdown filter state management
    // since we're now using DataTableFacetedFilter component

    // Reset all filters
    const resetAllFilters = () => {
        // Reset all filters
        if (filters) {
            Object.entries(filters).forEach(([key, config]) => {
                // Use empty array for multi-select filters or status filter, empty string for single-select
                const emptyValue = config.multi || key === "status" ? [] : "";
                config.onChange(emptyValue);
            });
        }

        // Reset search text if applicable
        if (onSearchChange) {
            onSearchChange("");

            // Also submit the empty search to update searchQuery
            if (onSearchSubmit) {
                onSearchSubmit();
            }
        }

        // Reset table column filters
        table.resetColumnFilters();
    };

    return (
        <div className="flex flex-1 flex-wrap items-center gap-2">
            {/* Column-specific filter (if needed) */}
            {!showGlobalFilter && (
                <div className="w-full max-w-sm">
                    <Input
                        placeholder="Filter tasks..."
                        value={(table.getColumn("title")?.getFilterValue() as string) || ""}
                        onChange={handleFilterChange}
                        allowClear={true}
                        onClear={() => {
                            // Only clear the filter value without reloading
                            table.getColumn("title")?.setFilterValue("");
                        }}
                        className="h-8"
                        size="sm"
                        radius="md"
                        variant="bordered"
                    />
                </div>
            )}

            {/* Global search input */}
            {showGlobalFilter && onSearchChange && (
                <div className="w-full max-w-sm">
                    <Input
                        placeholder="Tìm kiếm..."
                        value={searchText}
                        onChange={handleGlobalSearchChange}
                        allowClear={true}
                        onClear={() => {
                            // Only clear the text without submitting the search
                            onSearchChange("");
                        }}
                        className="h-8"
                        size="sm"
                        radius="md"
                        variant="bordered"
                    />
                </div>
            )}

            {/* Custom filters using DataTableFacetedFilter */}
            {filters &&
                Object.entries(filters).map(([key, config]) => (
                    <DataTableFacetedFilter
                        key={key}
                        title={config.title ?? key.charAt(0).toUpperCase() + key.slice(1)} // Capitalize the first letter
                        options={config.options}
                        customFilter={{
                            value: config.value,
                            onChange: config.onChange,
                            multi: config.multi,
                        }}
                    />
                ))}

            {/* Reset filters button */}
            {(isFiltered || (filters && Object.values(filters).some((f) => f.value))) && (
                <Button variant="outline" onClick={resetAllFilters} className="h-8 px-2 lg:px-3">
                    Xóa lọc
                    <X className="ltr:ml-2 rtl:mr-2 h-4 w-4" />
                </Button>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-2 ml-auto">
                {/* Search button */}
                {showGlobalFilter && onSearchChange && (
                    <Button size="sm" onClick={onSearchSubmit} className="h-8 px-3">
                        <Filter className="h-4 w-4 mr-2" />
                        Tìm kiếm
                    </Button>
                )}

                {/* Reload button */}
                {onReload && (
                    <Button onClick={handleReload} className="h-8 px-3" title="Reload data">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Tải lại
                    </Button>
                )}
                <DataTableViewOptions table={table} />
            </div>
        </div>
    );
}
