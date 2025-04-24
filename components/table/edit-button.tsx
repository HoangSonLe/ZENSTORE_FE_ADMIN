import React from "react";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

interface EditButtonProps {
    onClick: () => void;
    disabled?: boolean;
}

export function EditButton({ onClick, disabled = false }: EditButtonProps) {
    return (
        <Button
            variant="ghost"
            color="primary"
            size="icon"
            className="h-8 w-8 p-0"
            onClick={onClick}
            disabled={disabled}
            type="button"
        >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
        </Button>
    );
}
