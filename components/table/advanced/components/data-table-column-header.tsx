import { ChevronDown, ChevronUp, XCircle, Eye } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Column } from "@tanstack/react-table";

interface DataTableColumnHeaderProps {
    column: Column<any, any>;
    title: string;
    className?: string;
    onSortingToggle?: (column: Column<any, any>, desc: boolean) => void;
}

export function DataTableColumnHeader({
    column,
    title,
    className,
    onSortingToggle,
}: DataTableColumnHeaderProps) {
    if (!column.getCanSort()) {
        return <div className={cn(className)}>{title}</div>;
    }

    const handleSortingToggle = (desc: boolean) => {
        // First toggle the sorting in the table
        column.toggleSorting(desc);

        // Then call the API if the callback is provided
        if (onSortingToggle) {
            onSortingToggle(column, desc);
        }
    };

    return (
        <div className={cn("flex items-center space-x-2", className)}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-3 h-8 data-[state=open]:bg-accent"
                    >
                        <span>{title}</span>
                        {column.getIsSorted() === "desc" ? (
                            <ChevronDown className="ltr:ml-2 rtl:mr-2 h-4 w-4" />
                        ) : column.getIsSorted() === "asc" ? (
                            <ChevronUp className="ltr:ml-2 rtl:mr-2 h-4 w-4" />
                        ) : (
                            <XCircle className="ltr:ml-2 rtl:mr-2 h-4 w-4" />
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => handleSortingToggle(false)}>
                        <ChevronUp className="ltr:mr-2 rtl:ml-2 h-3.5 w-3.5 text-muted-foreground/70" />
                        Tăng dần
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSortingToggle(true)}>
                        <ChevronDown className="ltr:mr-2 rtl:ml-2 h-3.5 w-3.5 text-muted-foreground/70" />
                        Giảm dần
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {/* <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
                        <Eye className="ltr:mr-2 rtl:ml-2 h-3.5 w-3.5 text-muted-foreground/70" />
                        Ẩn
                    </DropdownMenuItem> */}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
