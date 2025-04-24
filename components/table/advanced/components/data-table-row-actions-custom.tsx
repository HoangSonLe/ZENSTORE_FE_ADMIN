"use client";

import { Row } from "@tanstack/react-table";
import { ActionButtons } from "@/components/table/action-buttons";

interface DataTableRowActionsCustomProps<TData> {
    row: Row<TData>;
    onUpdate?: (data: TData) => Promise<void>;
    onDelete?: (data: TData) => Promise<void>;
    renderUpdateForm?: (data: TData, onClose: () => void) => React.ReactNode;
}

export function DataTableRowActionsCustom<TData>({
    row,
    onUpdate,
    onDelete,
    renderUpdateForm,
}: DataTableRowActionsCustomProps<TData>) {
    return (
        <ActionButtons
            row={row.original}
            onUpdate={onUpdate}
            onDelete={onDelete}
            renderUpdateForm={renderUpdateForm}
        />
    );
}
