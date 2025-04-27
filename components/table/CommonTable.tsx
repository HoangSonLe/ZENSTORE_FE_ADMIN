"use client";

import { Fragment, useState, useEffect, useRef, useCallback } from "react";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { DataTable } from "@/components/table/advanced/components/data-table";
import { ISelectOption } from "@/apis/base/base.interface";
import { title } from "process";

// Define a generic interface for API query parameters
export interface CommonTableQuery {
    pageNumber: number;
    pageSize: number;
    searchString?: string;
    sorter?: number;
    current?: number; // For APIs that expect 'current' instead of 'pageNumber'
    [key: string]: any; // Allow for additional filter parameters
}

// Define a generic interface for API response
export interface CommonTableResponse<T> {
    data: T[];
    total: number;
    [key: string]: any; // Allow for additional response data
}

// Define a generic interface for filter configuration
export interface FilterConfig {
    options: ISelectOption[];
    value: string | string[];
    onChange: (value: string | string[]) => void;
    multi: boolean;
    title?: string; // Title for the filter
}

// Define props for the CommonTable component
export interface CommonTableProps<T, Q extends CommonTableQuery> {
    // Required props
    columns: ColumnDef<T>[];
    fetchData: (params: Q) => Promise<CommonTableResponse<T>>;

    // Optional props
    initialFilters?: Record<string, any>;
    filterOptions?: Record<
        string,
        | ISelectOption[]
        | {
              options: ISelectOption[];
              title?: string;
          }
    >;
    filterMapping?: Record<string, string>; // Maps UI filter keys to API parameter names
    defaultSorting?: SortingState;
    defaultPageSize?: number;
    title?: string;

    // Optional callbacks
    onRowClick?: (row: T) => void;
    onError?: (error: Error) => void;

    // Column mapping for sorting (maps column IDs to API sort parameters)
    sortMapping?: Record<string, number>;
}

export function CommonTable<T extends object, Q extends CommonTableQuery>({
    columns,
    fetchData,
    initialFilters = {},
    filterOptions = {},
    filterMapping = {},
    defaultSorting = [],
    defaultPageSize = 10,
    // title, // Unused parameter
    // onRowClick, // Unused parameter
    onError,
    sortMapping = {},
}: CommonTableProps<T, Q>) {
    // State for data and loading
    const [data, setData] = useState<T[]>([]);
    const [pagination, setPagination] = useState({
        pageNumber: 1,
        pageSize: defaultPageSize,
        total: 0,
    });
    const [sorting, setSorting] = useState<SortingState>(defaultSorting);
    const [searchText, setSearchText] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState(initialFilters);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Use a ref to store the timeout ID for debounced searches
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Function to fetch data from the API
    const fetchTableData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Convert TanStack Table sorting to API sorting format
            let sortParam: number | undefined = undefined;

            if (sorting.length > 0) {
                const column = sorting[0].id;
                const direction = sorting[0].desc ? -1 : 1;

                // Use the sortMapping to determine the sort parameter
                if (sortMapping[column]) {
                    sortParam = sortMapping[column] * direction;
                }
            }

            // Create a safe copy of the search query to prevent any issues
            const safeSearchQuery = typeof searchQuery === "string" ? searchQuery.trim() : "";

            // Prepare query parameters
            const queryParams = {
                pageNumber: pagination.pageNumber,
                pageSize: pagination.pageSize,
                // Only include searchString if it's not empty and not just whitespace
                ...(safeSearchQuery !== "" ? { searchString: safeSearchQuery } : {}),
                sorter: sortParam,
                // Add these mappings for APIs that expect different parameter names
                current: pagination.pageNumber, // Some APIs expect 'current' instead of 'pageNumber'
                ...Object.entries(filters).reduce((acc, [key, value]) => {
                    // Only include non-empty filters
                    if (Array.isArray(value) && value.length > 0) {
                        // Use the mapped key if available, otherwise use the original key
                        const mappedKey = filterMapping[key] || key;
                        acc[mappedKey] = value;
                    } else if (value && typeof value === "string") {
                        // Use the mapped key if available, otherwise use the original key
                        const mappedKey = filterMapping[key] || key;
                        acc[mappedKey] = value;
                    }
                    return acc;
                }, {} as Record<string, any>),
            } as Q;

            // Call the provided fetchData function
            const response = await fetchData(queryParams);

            // Process the API response
            setData(response.data);
            setPagination((prev) => ({
                ...prev,
                total: response.total,
            }));
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Failed to load data. Please try again.");
            setData([]);

            // Call the onError callback if provided
            if (onError && err instanceof Error) {
                onError(err);
            }
        } finally {
            setIsLoading(false);
        }
    }, [
        pagination.pageNumber,
        pagination.pageSize,
        searchQuery,
        sorting,
        filters,
        fetchData,
        sortMapping,
        filterMapping,
        onError,
    ]);

    // Debounced fetch function
    const debouncedFetch = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            fetchTableData();
            timeoutRef.current = null;
        }, 300); // Debounce delay
    }, [fetchTableData]);

    // Effect for initial data fetch
    useEffect(() => {
        fetchTableData();

        // Clean up any pending timeouts on unmount
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []); // Empty dependency array means this runs once on mount

    // Use refs to track what triggered the data fetch
    const isFirstRenderRef = useRef(true);
    const lastPaginationRef = useRef({
        pageNumber: pagination.pageNumber,
        pageSize: pagination.pageSize,
    });
    const lastSortingRef = useRef(JSON.stringify(sorting));
    const lastFiltersRef = useRef(JSON.stringify(filters));
    const lastSearchRef = useRef(searchQuery);

    // Combined effect for all data fetching triggers
    useEffect(() => {
        // Skip the first render to avoid double fetching
        if (isFirstRenderRef.current) {
            isFirstRenderRef.current = false;
            return;
        }

        // Determine what changed to trigger this effect
        const paginationChanged =
            lastPaginationRef.current.pageNumber !== pagination.pageNumber ||
            lastPaginationRef.current.pageSize !== pagination.pageSize;

        const sortingChanged = lastSortingRef.current !== JSON.stringify(sorting);
        const filtersChanged = lastFiltersRef.current !== JSON.stringify(filters);
        const searchChanged = lastSearchRef.current !== searchQuery;

        // Update refs to current values
        lastPaginationRef.current = {
            pageNumber: pagination.pageNumber,
            pageSize: pagination.pageSize,
        };
        lastSortingRef.current = JSON.stringify(sorting);
        lastFiltersRef.current = JSON.stringify(filters);
        lastSearchRef.current = searchQuery;

        // Skip empty sorting
        if (
            sorting.length === 0 &&
            sortingChanged &&
            !paginationChanged &&
            !filtersChanged &&
            !searchChanged
        ) {
            return;
        }

        // Use debounced fetch for search and filter changes, immediate fetch for pagination and sorting
        if (searchChanged || filtersChanged) {
            debouncedFetch();
        } else {
            fetchTableData();
        }
    }, [
        pagination.pageNumber,
        pagination.pageSize,
        JSON.stringify(sorting),
        JSON.stringify(filters),
        searchQuery,
        fetchTableData,
        debouncedFetch,
    ]);

    // Handler functions
    const handlePageChange = useCallback((pageIndex: number) => {
        // Convert from 0-based to 1-based indexing
        const pageNumber = pageIndex + 1;

        // Only update if the page number actually changed
        setPagination((prev) => {
            if (prev.pageNumber === pageNumber) return prev;
            // console.log(`CommonTable: Changing page from ${prev.pageNumber} to ${pageNumber}`);
            return {
                ...prev,
                pageNumber,
            };
        });
    }, []);

    const handlePageSizeChange = useCallback((pageSize: number) => {
        // Only update if the page size actually changed
        setPagination((prev) => {
            if (prev.pageSize === pageSize) return prev;
            return {
                ...prev,
                pageSize,
                pageNumber: 1, // Reset to first page when changing page size
            };
        });
    }, []);

    const handleSortingChange = useCallback((newSorting: SortingState) => {
        // console.log("Sorting changed:", newSorting);
        setSorting(newSorting);
    }, []);

    const handleSearchChange = useCallback((value: string) => {
        // console.log("Search text changed:", value);
        setSearchText(value);
    }, []);

    const handleSearchSubmit = useCallback(() => {
        console.log("Search submitted:", searchText);

        // Make sure to set searchQuery to an empty string if searchText is empty or just whitespace
        // Also handle the case where searchText might be undefined
        const trimmedSearchText = typeof searchText === "string" ? searchText.trim() : "";

        // Update the searchQuery state which is used in API calls
        // Use a functional update to ensure we're working with the latest state
        setSearchQuery(() => trimmedSearchText);

        // Reset to first page when searching
        // Use a functional update for pagination as well
        setPagination((prev) => ({
            ...prev,
            pageNumber: 1,
        }));

        // Log the updated search state for debugging
        console.log("Search query updated to:", trimmedSearchText);

        // Don't trigger any additional effects here
        // Let the combined effect handle the data fetching
    }, [searchText]);

    const handleReload = useCallback(() => {
        console.log("Reloading data...");
        // Force a data refresh by calling fetchTableData directly
        fetchTableData();
    }, [fetchTableData]);

    // Add a new function specifically for resetting the search query
    const handleResetSearch = useCallback(() => {
        console.log("Explicitly resetting search query to empty string");
        // Update states in a safe order to prevent DOM manipulation issues
        setSearchText("");
        // Use a functional update to ensure we're working with the latest state
        setSearchQuery(() => "");
        // Use a functional update for pagination as well
        setPagination((prev) => ({
            ...prev,
            pageNumber: 1,
        }));
        // Don't trigger any additional effects or reloads here
        // Let the parent component handle that
    }, []);

    const handleFilterChange = useCallback(
        (filterType: string, value: string | string[]) => {
            // Check if this is a reset operation (empty value)
            // const isReset = Array.isArray(value) ? value.length === 0 : value === "";

            // Only update if the filter value actually changed
            setFilters((prev) => {
                if (JSON.stringify(prev[filterType]) === JSON.stringify(value)) return prev;

                // Force status filter to always be an array
                const newValue =
                    filterType === "status" && !Array.isArray(value) && value !== ""
                        ? [value]
                        : value;

                return {
                    ...prev,
                    [filterType]: newValue,
                };
            });

            // Reset to first page when filtering
            setPagination((prev) => ({
                ...prev,
                pageNumber: 1,
            }));

            // If this is a reset operation from the "Xóa lọc" button, we don't need to do anything else
            // The combined effect will handle the data fetching
        },
        [filterMapping]
    );

    // Prepare filters for the DataTable component
    const tableFilters = Object.entries(filterOptions).reduce((acc, [key, filterConfig]) => {
        // Explicitly set multi flag for status filter
        const isMultiSelect = key === "status" ? true : Array.isArray(filters[key]);

        // Get the filter options and title
        let options: ISelectOption[];
        let title: string | undefined;

        if (Array.isArray(filterConfig)) {
            // Simple array of options
            options = filterConfig;
            // Default title is capitalized key
            title = key.charAt(0).toUpperCase() + key.slice(1);
        } else {
            // Object with options and optional title
            options = filterConfig.options;
            title = filterConfig.title || key.charAt(0).toUpperCase() + key.slice(1);
        }

        // Log filter configuration for debugging
        // console.log(`Filter ${key}:`, {
        //     title,
        //     value: filters[key],
        //     isArray: Array.isArray(filters[key]),
        //     multi: isMultiSelect,
        // });

        acc[key] = {
            options,
            value: filters[key] || (Array.isArray(filters[key]) ? [] : ""),
            onChange: (value: string | string[]) => handleFilterChange(key, value),
            multi: isMultiSelect, // Use our explicit multi flag
            title, // Add the title to the filter config
        };
        return acc;
    }, {} as Record<string, FilterConfig>);

    return (
        <Fragment>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <DataTable
                data={data}
                columns={columns}
                isLoading={isLoading}
                pagination={{
                    pageIndex: pagination.pageNumber - 1, // TanStack Table uses 0-based indexing
                    pageSize: pagination.pageSize,
                    pageCount: Math.ceil(pagination.total / pagination.pageSize) || 1, // Ensure at least 1 page
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
                onResetSearch={handleResetSearch}
                filters={tableFilters}
            />
        </Fragment>
    );
}
