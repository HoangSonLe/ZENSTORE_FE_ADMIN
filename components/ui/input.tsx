import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { InputColor, InputVariant, Radius, Shadow } from "@/lib/type";
import { X } from "lucide-react";

//py-[10px]
export const inputVariants = cva(
    " w-full   bg-background  border-default-300 dark:border-700  px-3 h-9   text-base  file:border-0 file:bg-transparent file:text-base file:font-medium  read-only:leading-9 read-only:bg-background  disabled:cursor-not-allowed disabled:opacity-50  transition duration-300 ",
    {
        variants: {
            color: {
                default:
                    "border-default-300 text-default-500 focus:outline-none focus:border-primary disabled:bg-default-200  placeholder:text-accent-foreground/50",
                primary:
                    "border-primary text-primary focus:outline-none focus:border-primary-700 disabled:bg-primary/30 disabled:placeholder:text-primary  placeholder:text-primary/70",
                info: "border-info/50 text-info focus:outline-none focus:border-info-700 disabled:bg-info/30 disabled:placeholder:text-info  placeholder:text-info/70",
                warning:
                    "border-warning/50 text-warning focus:outline-none focus:border-warning-700 disabled:bg-warning/30 disabled:placeholder:text-info  placeholder:text-warning/70",
                success:
                    "border-success/50 text-success focus:outline-none focus:border-success-700 disabled:bg-success/30 disabled:placeholder:text-info  placeholder:text-success/70",
                destructive:
                    "border-destructive/50 text-destructive focus:outline-none focus:border-destructive-700 disabled:bg-destructive/30 disabled:placeholder:text-destructive  placeholder:text-destructive/70",
            },
            variant: {
                flat: "bg-default-100 read-only:bg-default-100",
                underline: "border-b",
                bordered: "border  ",
                faded: "border border-default-300 bg-default-100",
                ghost: "border-0 focus:border",
                "flat-underline": "bg-default-100 border-b",
            },
            shadow: {
                none: "",
                sm: "shadow-sm",
                md: "shadow-md",
                lg: "shadow-lg",
                xl: "shadow-xl",
                "2xl": "shadow-2xl",
            },
            radius: {
                none: "rounded-none",
                sm: "rounded",
                md: "rounded-lg",
                lg: "rounded-xl",
                xl: "rounded-[20px]",
            },
            size: {
                sm: "h-8 text-sm read-only:leading-8",
                md: "h-9 text-base read-only:leading-9",
                lg: "h-10 text-lg read-only:leading-10",
                xl: "h-12 text-xl read-only:leading-[48px]",
            },
        },
        compoundVariants: [
            {
                variant: "flat",
                color: "primary",
                className: "bg-primary/10 read-only:bg-primary/10",
            },
            {
                variant: "flat",
                color: "info",
                className: "bg-info/10 read-only:bg-info/10",
            },
            {
                variant: "flat",
                color: "warning",
                className: "bg-warning/10 read-only:bg-warning/10",
            },
            {
                variant: "flat",
                color: "success",
                className: "bg-success/10 read-only:bg-success/10",
            },
            {
                variant: "flat",
                color: "destructive",
                className: "bg-destructive/10 read-only:bg-destructive/10",
            },
            {
                variant: "faded",
                color: "primary",
                className:
                    "bg-primary/10 border-primary/30 read-only:bg-primary/10 border-primary/30",
            },
            {
                variant: "faded",
                color: "info",
                className: "bg-info/10 border-info/30",
            },
            {
                variant: "faded",
                color: "warning",
                className: "bg-warning/10 border-warning/30",
            },
            {
                variant: "faded",
                color: "success",
                className: "bg-success/10 border-success/30",
            },
            {
                variant: "faded",
                color: "destructive",
                className: "bg-destructive/10 border-destructive/30",
            },
        ],

        defaultVariants: {
            color: "default",
            size: "md",
            variant: "bordered",
            radius: "md",
        },
    }
);

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement>,
        VariantProps<typeof inputVariants> {
    removeWrapper?: boolean;
    color?: InputColor;
    variant?: InputVariant;
    radius?: Radius;
    shadow?: Shadow;
    size?: any;
    allowClear?: boolean;
    onClear?: () => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className,
            type,
            size,
            color,
            radius,
            variant,
            shadow,
            removeWrapper = false,
            allowClear = false,
            onClear,
            ...props
        },
        ref
    ) => {
        // Simple function to check if the input has a value
        const hasValue = () => {
            if (props.value === undefined || props.value === null) return false;
            return String(props.value).length > 0;
        };

        // Handle clear button click
        const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            e.stopPropagation();

            // Create a simple input element to get a change event
            const input = document.createElement("input");
            input.value = "";

            // Call onChange with empty value
            if (props.onChange) {
                props.onChange({ target: input } as React.ChangeEvent<HTMLInputElement>);
            }

            // Call onClear if provided
            if (onClear) {
                onClear();
            }
        };

        // Determine if we need to show the clear button
        const showClearButton = allowClear && hasValue();

        // Common wrapper class
        const wrapperClass = removeWrapper
            ? "relative inline-block w-full"
            : "relative flex-1 w-full";

        return (
            <div className={wrapperClass}>
                <div className="relative w-full flex items-center">
                    <input
                        type={type}
                        className={cn(
                            inputVariants({ color, size, radius, variant, shadow }),
                            showClearButton ? "pr-8" : "",
                            className
                        )}
                        ref={ref}
                        {...props}
                    />
                    {showClearButton && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <button
                                type="button"
                                onClick={handleClear}
                                className="h-5 w-5 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 focus:outline-none transition-colors pointer-events-auto"
                                aria-label="Clear input"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }
);
Input.displayName = "Input";

export { Input };
