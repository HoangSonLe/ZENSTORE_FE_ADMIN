import React, { useState } from "react";
import { EditButton } from "@/components/table/edit-button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { DeleteButton } from "@/components/table/delete-button";

interface ActionButtonsProps<T> {
    row: T;
    onUpdate?: (data: T) => Promise<void>;
    onDelete?: (data: T) => Promise<void>;
    renderUpdateForm?: (data: T, onClose: () => void) => React.ReactNode;
}

export function ActionButtons<T>({
    row,
    onUpdate,
    onDelete,
    renderUpdateForm,
}: ActionButtonsProps<T>) {
    const [showUpdateDialog, setShowUpdateDialog] = useState(false);

    const handleUpdate = () => {
        if (onUpdate) {
            onUpdate(row);
        } else if (renderUpdateForm) {
            setShowUpdateDialog(true);
        }
    };

    const handleDelete = async () => {
        if (onDelete) {
            await onDelete(row);
        }
    };

    return (
        <div className="flex items-center justify-center space-x-1">
            {/* Edit Button */}
            <EditButton onClick={handleUpdate} />

            {/* Delete Button */}
            {onDelete && (
                <DeleteButton onDelete={handleDelete} toastMessage="Item deleted successfully" />
            )}

            {/* Update Dialog */}
            {renderUpdateForm && (
                <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
                    <DialogContent size="5xl" className="w-full max-w-[1200px]">
                        <DialogHeader>
                            <DialogTitle>Edit Product</DialogTitle>
                            <DialogDescription>
                                Update product information. Fields marked with * are required.
                            </DialogDescription>
                        </DialogHeader>
                        {renderUpdateForm(row, () => setShowUpdateDialog(false))}
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
