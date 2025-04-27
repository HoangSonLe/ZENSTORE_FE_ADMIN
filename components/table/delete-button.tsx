import React from "react";
import DeleteConfirmationPopover from "@/components/delete-confirmation-popover-v2";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeleteButtonProps {
    onDelete: () => Promise<void>;
    toastMessage?: string;
    disabled?: boolean;
}

export function DeleteButton({
    onDelete,
    toastMessage = "Xóa thành công",
    disabled = false,
}: DeleteButtonProps) {
    return (
        <DeleteConfirmationPopover
            onConfirm={onDelete}
            toastMessage={toastMessage}
            disabled={disabled}
            defaultToast={false}
        >
            <Button
                variant="ghost"
                color="destructive"
                size="icon"
                className="h-8 w-8 p-0"
                type="button"
            >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
            </Button>
        </DeleteConfirmationPopover>
    );
}
