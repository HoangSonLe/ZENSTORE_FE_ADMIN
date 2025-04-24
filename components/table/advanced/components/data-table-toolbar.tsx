"use client";
import { X, RefreshCw, Filter, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";

import { priorities, statuses } from "../data/data";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { Table } from "@tanstack/react-table";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    const statusColumn = table.getColumn("status");
    const priorityColumn = table.getColumn("priority");

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

    // Track open state for each dropdown
    const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

    // Track temporary filter values while dropdown is open
    const [tempFilterValues, setTempFilterValues] = useState<Record<string, string | string[]>>({});

    // Initialize temp filter values from filters when component mounts
    useEffect(() => {
        if (filters) {
            const initialValues: Record<string, string | string[]> = {};
            Object.entries(filters).forEach(([key, config]) => {
                // Ensure status filter is always initialized as an array
                if (key === "status") {
                    initialValues[key] = Array.isArray(config.value) ? [...config.value] : [];
                } else {
                    initialValues[key] = Array.isArray(config.value)
                        ? [...config.value]
                        : config.value;
                }
            });
            setTempFilterValues(initialValues);
        }
    }, [filters]);

    // Toggle dropdown open state
    const toggleDropdown = (key: string, isOpen: boolean) => {
        setOpenDropdowns((prev) => ({
            ...prev,
            [key]: isOpen,
        }));

        // Initialize temp value when opening dropdown
        if (isOpen && filters) {
            const config = filters[key];
            if (config) {
                // Ensure status filter is always initialized as an array
                if (key === "status") {
                    setTempFilterValues((prev) => ({
                        ...prev,
                        [key]: Array.isArray(config.value) ? [...config.value] : [],
                    }));
                } else {
                    setTempFilterValues((prev) => ({
                        ...prev,
                        [key]: Array.isArray(config.value) ? [...config.value] : config.value,
                    }));
                }
            }
        }

        // If dropdown is closing without clicking Done, reset to original value
        if (!isOpen && filters) {
            // We don't apply changes here - they're only applied when Done is clicked
            // Just reset the temp value to the original
            const config = filters[key];
            if (config) {
                // Ensure status filter is always reset as an array
                if (key === "status") {
                    setTempFilterValues((prev) => ({
                        ...prev,
                        [key]: Array.isArray(config.value) ? [...config.value] : [],
                    }));
                } else {
                    setTempFilterValues((prev) => ({
                        ...prev,
                        [key]: Array.isArray(config.value) ? [...config.value] : config.value,
                    }));
                }
            }
        }
    };

    // Close a specific dropdown and apply changes
    const closeDropdown = (key: string) => {
        setOpenDropdowns((prev) => ({
            ...prev,
            [key]: false,
        }));

        // Apply the temp value to the actual filter
        if (filters && tempFilterValues[key] !== undefined) {
            const config = filters[key];
            if (config) {
                // Ensure status filter is always applied as an array
                if (key === "status") {
                    const value = tempFilterValues[key];
                    const arrayValue = Array.isArray(value) ? value : value ? [value] : [];
                    config.onChange(arrayValue);
                } else {
                    config.onChange(tempFilterValues[key]);
                }
            }
        }
    };

    // Update temp filter value
    const updateTempFilter = (key: string, value: string | string[]) => {
        // Ensure status filter is always updated as an array
        if (key === "status") {
            const arrayValue = Array.isArray(value) ? value : value ? [value] : [];
            setTempFilterValues((prev) => ({
                ...prev,
                [key]: arrayValue,
            }));
        } else {
            setTempFilterValues((prev) => ({
                ...prev,
                [key]: value,
            }));
        }
    };

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
                <Input
                    placeholder="Filter tasks..."
                    value={(table.getColumn("title")?.getFilterValue() as string) || ""}
                    onChange={handleFilterChange}
                    allowClear={true}
                    onClear={() => {
                        // Only clear the filter value without reloading
                        table.getColumn("title")?.setFilterValue("");
                    }}
                    className="h-8 min-w-[200px] max-w-sm"
                />
            )}

            {/* Global search input */}
            {showGlobalFilter && onSearchChange && (
                <Input
                    placeholder="Search..."
                    value={searchText}
                    onChange={handleGlobalSearchChange}
                    allowClear={true}
                    onClear={() => {
                        // Only clear the text without submitting the search
                        onSearchChange("");
                    }}
                    className="h-8 min-w-[200px] max-w-sm"
                />
            )}

            {/* Faceted filters from table */}
            {statusColumn && (
                <DataTableFacetedFilter column={statusColumn} title="Status" options={statuses} />
            )}
            {priorityColumn && (
                <DataTableFacetedFilter
                    column={priorityColumn}
                    title="Priority"
                    options={priorities}
                />
            )}

            {/* Custom dropdown filters */}
            {filters &&
                Object.entries(filters).map(([key, config]) => (
                    <div key={key} className="relative inline-block">
                        <DropdownMenu
                            open={openDropdowns[key]}
                            onOpenChange={(isOpen) => toggleDropdown(key, isOpen)}
                        >
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="h-8 border-dashed">
                                    <span className="capitalize">{key}</span>
                                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[200px]" align="start" side="bottom">
                                <DropdownMenuLabel className="capitalize">{key}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {/* Filter configuration:
                                    multi: {config.multi},
                                    valueIsArray: {Array.isArray(config.value)},
                                    value: {JSON.stringify(config.value)}
                                */}
                                {config.multi || Array.isArray(config.value) ? (
                                    // Multi-select (checkboxes)
                                    <>
                                        {config.options.map((option) => {
                                            // Get the temporary value for this filter
                                            const tempValue = tempFilterValues[key];

                                            // Convert to array if it's not already
                                            const valueArray = Array.isArray(tempValue)
                                                ? tempValue
                                                : tempValue
                                                ? [tempValue]
                                                : [];

                                            return (
                                                <DropdownMenuCheckboxItem
                                                    key={option.value}
                                                    checked={valueArray.includes(option.value)}
                                                    // This is the key part - prevent closing on selection
                                                    onSelect={(e) => {
                                                        e.preventDefault();
                                                    }}
                                                    onCheckedChange={(checked) => {
                                                        let newValue: string | string[];

                                                        if (Array.isArray(tempValue)) {
                                                            // Already an array, update it
                                                            newValue = [...tempValue];
                                                            if (checked) {
                                                                if (
                                                                    !newValue.includes(option.value)
                                                                ) {
                                                                    newValue.push(option.value);
                                                                }
                                                            } else {
                                                                const index = newValue.indexOf(
                                                                    option.value
                                                                );
                                                                if (index !== -1) {
                                                                    newValue.splice(index, 1);
                                                                }
                                                            }
                                                        } else {
                                                            // Convert to array for multi-select
                                                            if (checked) {
                                                                newValue = tempValue
                                                                    ? [tempValue, option.value]
                                                                    : [option.value];
                                                            } else {
                                                                newValue =
                                                                    tempValue === option.value
                                                                        ? ""
                                                                        : tempValue;
                                                            }
                                                        }

                                                        // Update the temporary value only
                                                        updateTempFilter(key, newValue);
                                                    }}
                                                >
                                                    {option.label}
                                                </DropdownMenuCheckboxItem>
                                            );
                                        })}
                                        <DropdownMenuSeparator />
                                        <div className="p-2">
                                            <Button
                                                className="w-full"
                                                size="sm"
                                                color="secondary"
                                                onClick={() => closeDropdown(key)}
                                            >
                                                Apply
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    // Single-select (radio) for string values
                                    <>
                                        <DropdownMenuRadioGroup
                                            value={(tempFilterValues[key] || "") as string}
                                            onValueChange={(value) => {
                                                // Toggle selection if clicking the same item
                                                const newValue =
                                                    value === tempFilterValues[key] ? "" : value;
                                                // Update the temporary value only
                                                updateTempFilter(key, newValue);
                                            }}
                                        >
                                            {config.options.map((option) => (
                                                <DropdownMenuRadioItem
                                                    key={option.value}
                                                    value={option.value}
                                                    // Prevent closing on selection
                                                    onSelect={(e) => {
                                                        e.preventDefault();
                                                    }}
                                                >
                                                    {option.label}
                                                </DropdownMenuRadioItem>
                                            ))}
                                        </DropdownMenuRadioGroup>
                                        <DropdownMenuSeparator />
                                        <div className="p-2">
                                            <Button
                                                className="w-full"
                                                size="sm"
                                                color="secondary"
                                                onClick={() => closeDropdown(key)}
                                            >
                                                Apply
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ))}

            {/* Reset filters button */}
            {(isFiltered || (filters && Object.values(filters).some((f) => f.value))) && (
                <Button variant="outline" onClick={resetAllFilters} className="h-8 px-2 lg:px-3">
                    Reset All
                    <X className="ltr:ml-2 rtl:mr-2 h-4 w-4" />
                </Button>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-2 ml-auto">
                {/* Search button */}
                {showGlobalFilter && onSearchChange && (
                    <Button size="sm" onClick={onSearchSubmit} className="h-8 px-3">
                        <Filter className="h-4 w-4 mr-2" />
                        Search
                    </Button>
                )}

                {/* Reload button */}
                {onReload && (
                    <Button onClick={handleReload} className="h-8 px-3" title="Reload data">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reload
                    </Button>
                )}
                <DataTableViewOptions table={table} />
            </div>
        </div>
    );
}
