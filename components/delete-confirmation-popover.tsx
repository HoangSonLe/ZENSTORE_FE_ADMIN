import React, { useState, useTransition, useRef } from "react";
import {
    CustomPopover,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Loader2, Trash2 } from "lucide-react";

interface DeleteConfirmationPopoverProps {
    onConfirm: () => Promise<void>;
    defaultToast?: boolean;
    toastMessage?: string;
    children?: React.ReactNode;
    disabled?: boolean;
}

const DeleteConfirmationPopover: React.FC<DeleteConfirmationPopoverProps> = ({
    onConfirm,
    defaultToast = true,
    toastMessage = "Successfully deleted",
    children,
    disabled = false,
}) => {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const triggerRef = useRef<HTMLDivElement>(null);

    const handleConfirm = async () => {
        try {
            startTransition(async () => {
                await onConfirm();
                if (defaultToast) {
                    toast.success(toastMessage, {
                        position: "top-right",
                    });
                }
                setOpen(false);
            });
        } catch (error) {
            console.error("Error during deletion:", error);
            toast.error("Failed to delete item", {
                position: "top-right",
            });
            setOpen(false);
        }
    };

    const handleTriggerClick = (e: React.MouseEvent) => {
        if (disabled) return;
        e.preventDefault();
        e.stopPropagation();
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    // Create a wrapper for the trigger element
    const triggerElement = (
        <div 
            ref={triggerRef} 
            onClick={handleTriggerClick}
            className={disabled ? "opacity-50 pointer-events-none" : ""}
        >
            {children || (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                    type="button"
                >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                </Button>
            )}
        </div>
    );

    return (
        <CustomPopover
            open={open}
            onClose={handleClose}
            trigger={triggerElement}
            className="w-80 p-0 right-0 left-auto"
        >
            <div className="p-4 pb-0">
                <div className="font-medium text-lg">Are you absolutely sure?</div>
                <div className="text-sm text-muted-foreground mt-1">
                    This action cannot be undone. This will permanently delete this item
                    and remove the data from our servers.
                </div>
            </div>
            <div className="flex items-center p-4 pt-2">
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="mr-2"
                    onClick={handleClose}
                >
                    Cancel
                </Button>
                <Button
                    variant="destructive"
                    size="sm"
                    disabled={isPending}
                    onClick={handleConfirm}
                    className={isPending ? "pointer-events-none" : ""}
                >
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isPending ? "Deleting..." : "Delete"}
                </Button>
            </div>
        </CustomPopover>
    );
};

export default DeleteConfirmationPopover;
