import React, { useState } from "react";
import { EditButton } from "@/components/table/edit-button";
import {
    BasicDialog as Dialog,
    BasicDialogContent as DialogContent,
    BasicDialogDescription as DialogDescription,
    BasicDialogHeader as DialogHeader,
    BasicDialogTitle as DialogTitle,
} from "@/components/ui/basic-dialog";
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
            {onDelete && <DeleteButton onDelete={handleDelete} toastMessage="Xóa thành công" />}

            {/* Update Dialog */}
            {renderUpdateForm && (
                <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
                    <DialogContent size="5xl" className="w-full max-w-[1200px]">
                        <DialogHeader>
                            <DialogTitle>Chỉnh sửa</DialogTitle>
                            <DialogDescription>
                                Cập nhật thông tin sản phẩm. Các trường có dấu * là bắt buộc.
                            </DialogDescription>
                        </DialogHeader>
                        {renderUpdateForm(row, () => setShowUpdateDialog(false))}
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
