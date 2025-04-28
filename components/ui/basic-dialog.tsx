import * as React from "react";
import { X } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Dialog variants for sizing
const dialogVariants = cva(
    "fixed left-1/2 top-1/2 z-[999] grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 bg-background p-6 shadow-lg duration-200 rounded-lg grid gap-4",
    {
        variants: {
            size: {
                xs: "md:max-w-[332px] w-[90%]",
                sm: "md:max-w-[384px] w-[90%]",
                md: "md:max-w-[444px] w-[90%]",
                lg: "md:max-w-[536px] w-[90%]",
                xl: "md:max-w-[628px] w-[90%]",
                "2xl": "md:max-w-[720px] w-[90%]",
                "3xl": "md:max-w-[812px] w-[90%]",
                "4xl": "md:max-w-[904px] w-[90%]",
                "5xl": "md:max-w-[996px] w-[90%]",
                full: "h-screen max-w-full",
            },
        },
        defaultVariants: {
            size: "md",
        },
    }
);

// Basic Dialog Context
type DialogContextType = {
    open: boolean;
    setOpen: (open: boolean) => void;
};

const DialogContext = React.createContext<DialogContextType | undefined>(undefined);

// Hook to use dialog context
const useDialog = () => {
    const context = React.useContext(DialogContext);
    if (!context) {
        throw new Error("useDialog must be used within a BasicDialog");
    }
    return context;
};

// Root Dialog component
interface BasicDialogProps {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const BasicDialog: React.FC<BasicDialogProps> = ({ children, open = false, onOpenChange }) => {
    const [internalOpen, setInternalOpen] = React.useState(open);

    // Sync with external state if provided
    React.useEffect(() => {
        setInternalOpen(open);
    }, [open]);

    const handleOpenChange = (newOpen: boolean) => {
        setInternalOpen(newOpen);
        onOpenChange?.(newOpen);
    };

    return (
        <DialogContext.Provider value={{ open: internalOpen, setOpen: handleOpenChange }}>
            {children}
        </DialogContext.Provider>
    );
};

// Dialog Trigger component
interface BasicDialogTriggerProps {
    children: React.ReactNode;
    asChild?: boolean;
}

const BasicDialogTrigger: React.FC<BasicDialogTriggerProps> = ({ children, asChild = false }) => {
    const { setOpen } = useDialog();

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setOpen(true);
    };

    if (asChild) {
        return React.cloneElement(children as React.ReactElement, {
            onClick: handleClick,
        });
    }

    return (
        <button type="button" onClick={handleClick}>
            {children}
        </button>
    );
};

// Dialog Content component
interface BasicDialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full";
    overlayClass?: string;
    hiddenCloseIcon?: boolean;
}

const BasicDialogContent = React.forwardRef<HTMLDivElement, BasicDialogContentProps>(
    ({ children, className, size, overlayClass, hiddenCloseIcon = false, ...props }, ref) => {
        const { open, setOpen } = useDialog();

        // Handle ESC key to close dialog
        React.useEffect(() => {
            const handleEsc = (e: KeyboardEvent) => {
                if (e.key === "Escape") {
                    setOpen(false);
                }
            };

            if (open) {
                window.addEventListener("keydown", handleEsc);
            }

            return () => {
                window.removeEventListener("keydown", handleEsc);
            };
        }, [open, setOpen]);

        if (!open) return null;

        return (
            <>
                {/* Backdrop/Overlay */}
                <div
                    className={cn(
                        "fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm basic-dialog-overlay",
                        overlayClass
                    )}
                    onClick={() => setOpen(false)}
                />

                {/* Dialog Content */}
                <div
                    ref={ref}
                    className={cn(
                        dialogVariants({ size }),
                        "dialog-content basic-dialog-content",
                        className
                    )}
                    {...props}
                >
                    {children}
                    {!hiddenCloseIcon && (
                        <button
                            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
                            onClick={() => setOpen(false)}
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </button>
                    )}
                </div>
            </>
        );
    }
);
BasicDialogContent.displayName = "BasicDialogContent";

// Dialog Header component
const BasicDialogHeader = ({
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn("flex flex-col space-y-1.5 text-center sm:text-left relative", className)}
        {...props}
    >
        {children}
    </div>
);
BasicDialogHeader.displayName = "BasicDialogHeader";

// Dialog Footer component
const BasicDialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn("flex flex-col-reverse sm:flex-row sm:justify-end gap-2", className)}
        {...props}
    />
);
BasicDialogFooter.displayName = "BasicDialogFooter";

// Dialog Title component
const BasicDialogTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
);
BasicDialogTitle.displayName = "BasicDialogTitle";

// Dialog Description component
const BasicDialogDescription = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className={cn("text-sm text-muted-foreground", className)} {...props} />
);
BasicDialogDescription.displayName = "BasicDialogDescription";

// Dialog Close component
interface BasicDialogCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
}

const BasicDialogClose: React.FC<BasicDialogCloseProps> = ({
    children,
    asChild = false,
    ...props
}) => {
    const { setOpen } = useDialog();

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setOpen(false);
    };

    if (asChild && children) {
        return React.cloneElement(children as React.ReactElement, {
            onClick: handleClick,
            ...props,
        });
    }

    return (
        <button type="button" onClick={handleClick} {...props}>
            {children}
        </button>
    );
};

export {
    BasicDialog,
    BasicDialogTrigger,
    BasicDialogContent,
    BasicDialogHeader,
    BasicDialogFooter,
    BasicDialogTitle,
    BasicDialogDescription,
    BasicDialogClose,
};
