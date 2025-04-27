import React, { useState, useTransition, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeleteConfirmationPopoverProps {
    onConfirm: () => Promise<void>;
    defaultToast?: boolean;
    toastMessage?: string;
    children?: React.ReactNode;
    disabled?: boolean;
}

const DeleteConfirmationPopoverV2: React.FC<DeleteConfirmationPopoverProps> = ({
    onConfirm,
    defaultToast = true,
    toastMessage = "Xóa thành công",
    children,
    disabled = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const popoverRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    // Handle click outside to close the popover
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(event.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const handleConfirm = () => {
        startTransition(async () => {
            try {
                await onConfirm();
                if (defaultToast) {
                    toast.success(toastMessage, {
                        position: "top-right",
                    });
                }
            } catch (error) {
                console.error("Error during deletion:", error);
                if (defaultToast) {
                    toast.error("Xóa lỗi", {
                        position: "top-right",
                    });
                }
            } finally {
                setIsOpen(false);
            }
        });
    };

    const handleTriggerClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    return (
        <div className="relative inline-block">
            {/* Trigger element */}
            <div
                ref={triggerRef}
                onClick={handleTriggerClick}
                onMouseDown={(e) => e.stopPropagation()} // Prevent dropdown from closing
                className={cn("cursor-pointer", disabled && "opacity-50 pointer-events-none")}
            >
                {children || (
                    <Button
                        variant="ghost"
                        color="destructive"
                        size="icon"
                        className="h-8 w-8 p-0"
                        type="button"
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Xóa</span>
                    </Button>
                )}
            </div>

            {/* Popover content */}
            {isOpen && (
                <div
                    ref={popoverRef}
                    className="absolute z-50 right-0 top-full mt-2 w-64 rounded-md shadow-lg bg-popover border border-border"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()} // Prevent dropdown from closing
                >
                    <div className="p-3 pb-0">
                        <div className="font-medium">Xác nhận xóa</div>
                        <div className="text-xs text-muted-foreground mt-1">
                            Bạn có chắc chắn xóa sản phẩm này?
                        </div>
                    </div>
                    <div className="flex items-center justify-end p-3 pt-2">
                        <Button
                            variant="outline"
                            color="secondary"
                            size="xs"
                            className="mr-2 h-7 px-2 text-xs"
                            onClick={() => setIsOpen(false)}
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="soft"
                            color="destructive"
                            size="xs"
                            disabled={isPending}
                            onClick={handleConfirm}
                            className={`h-7 px-2 text-xs ${isPending ? "pointer-events-none" : ""}`}
                        >
                            {isPending && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                            {isPending ? "Đang xóa..." : "Chấp nhận"}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export { DeleteConfirmationPopoverV2 as default };
