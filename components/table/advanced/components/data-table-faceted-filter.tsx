import * as React from "react";
import { useState, useEffect } from "react";
import { Check, PlusCircle, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Column } from "@tanstack/react-table";

export interface Option {
    value: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
}

interface DataTableFacetedFilterProps {
    column?: Column<any, any>;
    title: string;
    options: Option[];
    // Custom filter props
    customFilter?: {
        value: string | string[];
        onChange: (value: string | string[]) => void;
        multi?: boolean;
    };
}

export function DataTableFacetedFilter({
    column,
    title,
    options,
    customFilter,
}: DataTableFacetedFilterProps) {
    const facets = column?.getFacetedUniqueValues();

    // State for handling open/close of popover
    const [open, setOpen] = useState(false);

    // State for temporary values (used when customFilter is provided)
    const [tempValues, setTempValues] = useState<string[]>([]);

    // Initialize selected values based on column or customFilter
    let selectedValues: Set<string>;

    if (column) {
        // Column-based filter
        selectedValues = new Set(column.getFilterValue() as string[]);
    } else if (customFilter) {
        // Custom filter
        if (Array.isArray(customFilter.value)) {
            selectedValues = new Set(customFilter.value);
        } else if (customFilter.value) {
            selectedValues = new Set([customFilter.value as string]);
        } else {
            selectedValues = new Set();
        }
    } else {
        selectedValues = new Set();
    }

    // Initialize temp values when opening popover
    useEffect(() => {
        if (open && customFilter) {
            if (Array.isArray(customFilter.value)) {
                setTempValues([...customFilter.value]);
            } else if (customFilter.value) {
                setTempValues([customFilter.value as string]);
            } else {
                setTempValues([]);
            }
        }
    }, [open, customFilter]);

    // Handle popover open/close
    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);

        // If closing without applying (clicking outside), reset temp values
        if (!isOpen && customFilter && !column) {
            // Reset temp values to original
            if (Array.isArray(customFilter.value)) {
                setTempValues([...customFilter.value]);
            } else if (customFilter.value) {
                setTempValues([customFilter.value as string]);
            } else {
                setTempValues([]);
            }
        }
    };

    // Apply custom filter changes
    const applyCustomFilter = () => {
        if (customFilter) {
            if (customFilter.multi) {
                customFilter.onChange(tempValues);
            } else {
                // For single select, use the first value or empty string
                customFilter.onChange(tempValues.length > 0 ? tempValues[0] : "");
            }
            setOpen(false);
        }
    };

    // Handle selection for custom filters
    const handleCustomSelection = (value: string) => {
        const isSelected = tempValues.includes(value);
        let newValues: string[];

        if (customFilter?.multi) {
            // Multi-select behavior
            if (isSelected) {
                newValues = tempValues.filter((v) => v !== value);
            } else {
                newValues = [...tempValues, value];
            }
        } else {
            // Single-select behavior (toggle)
            if (isSelected) {
                newValues = [];
            } else {
                newValues = [value];
            }
        }

        setTempValues(newValues);
    };

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 border-dashed">
                    {customFilter ? (
                        <ChevronDown className="ltr:mr-2 rtl:ml-2 h-4 w-4 shrink-0 opacity-50" />
                    ) : (
                        <PlusCircle className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                    )}
                    {title}
                    {selectedValues?.size > 0 && (
                        <>
                            <Separator orientation="vertical" className="mx-2 h-4" />
                            <Badge
                                color="secondary"
                                className="rounded-sm px-1 font-normal lg:hidden"
                            >
                                {selectedValues.size}
                            </Badge>
                            <div className="hidden space-x-1 rtl:space-x-reverse lg:flex">
                                {selectedValues.size > 2 ? (
                                    <Badge
                                        color="secondary"
                                        className="rounded-sm px-1 font-normal"
                                    >
                                        {selectedValues.size} đã chọn
                                    </Badge>
                                ) : (
                                    options
                                        .filter((option: Option) =>
                                            selectedValues.has(option.value)
                                        )
                                        .map((option) => (
                                            <Badge
                                                color="secondary"
                                                key={option.value}
                                                className="rounded-sm px-1 font-normal"
                                            >
                                                {option.label}
                                            </Badge>
                                        ))
                                )}
                            </div>
                        </>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start" side="bottom">
                <Command>
                    <CommandInput placeholder={title} />
                    <CommandList>
                        <CommandEmpty>Không có kết quả.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option: Option) => {
                                // Determine if selected based on whether we're using column or custom filter
                                const isSelected = column
                                    ? selectedValues.has(option.value)
                                    : tempValues.includes(option.value);

                                return (
                                    <CommandItem
                                        key={option.value}
                                        onSelect={() => {
                                            // For custom filters, handle selection without closing
                                            if (customFilter) {
                                                handleCustomSelection(option.value);
                                                return false; // Prevent closing
                                            } else if (column) {
                                                // Original column-based behavior
                                                if (isSelected) {
                                                    selectedValues.delete(option.value);
                                                } else {
                                                    selectedValues.add(option.value);
                                                }
                                                const filterValues = Array.from(selectedValues);
                                                column.setFilterValue(
                                                    filterValues.length ? filterValues : undefined
                                                );
                                            }
                                        }}
                                    >
                                        <div
                                            className={cn(
                                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                isSelected
                                                    ? "bg-primary text-primary-foreground"
                                                    : "opacity-50 [&_svg]:invisible"
                                            )}
                                        >
                                            <Check className={cn("h-4 w-4")} />
                                        </div>
                                        {option.icon && (
                                            <option.icon className="ltr:mr-2 rtl:ml-2 h-4 w-4 text-muted-foreground" />
                                        )}
                                        <span>{option.label}</span>
                                        {facets?.get(option.value) && (
                                            <span className="ltr:ml-auto rtl:mr-auto flex h-4 w-4 items-center justify-center text-xs">
                                                {facets.get(option.value)}
                                            </span>
                                        )}
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                        {(selectedValues.size > 0 || tempValues.length > 0) && (
                            <>
                                <CommandSeparator />
                                <CommandGroup>
                                    {customFilter ? (
                                        // Apply button for custom filters
                                        <CommandItem
                                            onSelect={() => {
                                                applyCustomFilter();
                                                return false; // Prevent closing
                                            }}
                                            className="justify-center text-center"
                                        >
                                            Áp dụng
                                        </CommandItem>
                                    ) : (
                                        // Clear button for column filters
                                        <CommandItem
                                            onSelect={() => column?.setFilterValue(undefined)}
                                            className="justify-center text-center"
                                        >
                                            Clear filters
                                        </CommandItem>
                                    )}
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
