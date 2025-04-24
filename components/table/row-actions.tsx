"use client";

import { ActionButtons } from "@/components/table/action-buttons";

interface RowActionsProps<T> {
    row: T;
    onUpdate?: (row: T) => void;
    onDelete?: (row: T) => void;
    renderUpdateForm?: (row: T, onClose: () => void) => React.ReactNode;
}

export function RowActions<T>({ row, onUpdate, onDelete, renderUpdateForm }: RowActionsProps<T>) {
    // Convert the Promise<void> to Promise<void> if needed
    const handleUpdate = onUpdate
        ? async (data: T) => {
              onUpdate(data);
          }
        : undefined;
    const handleDelete = onDelete
        ? async (data: T) => {
              onDelete(data);
          }
        : undefined;

    return (
        <ActionButtons
            row={row}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            renderUpdateForm={renderUpdateForm}
        />
    );
}
