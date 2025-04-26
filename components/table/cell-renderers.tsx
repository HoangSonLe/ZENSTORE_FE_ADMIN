"use client";

import { Row } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import dayjs from "dayjs";
import { formatVND } from "@/lib/utils";

// Type for badge colors
export type BadgeColor = "default" | "success" | "warning" | "destructive" | "info" | "secondary";

// Image cell renderer
export function renderImage<T>(
    row: Row<T>,
    accessorKey: string,
    altAccessorKey?: string,
    width: number = 12,
    height: number = 12,
    placeholderUrl: string = "/images/placeholder.png"
) {
    try {
        const images = row.getValue(accessorKey);
        let imageUrl = placeholderUrl;

        if (Array.isArray(images) && images.length > 0) {
            imageUrl = images[0];
        } else if (typeof images === "string") {
            imageUrl = images;
        }

        const alt = altAccessorKey ? String(row.getValue(altAccessorKey) || "Image") : "Image";

        return (
            <div className="flex justify-center items-center">
                <div
                    className={`w-${width} h-${height} relative rounded-md overflow-hidden bg-gray-100`}
                >
                    <img
                        src={imageUrl}
                        alt={alt}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.currentTarget.src = placeholderUrl;
                        }}
                    />
                </div>
            </div>
        );
    } catch (error) {
        console.error("Error rendering image:", error);
        return (
            <div className="flex justify-center items-center">
                <div
                    className={`w-${width} h-${height} relative rounded-md overflow-hidden bg-gray-100`}
                >
                    <div className="flex items-center justify-center h-full text-gray-400">N/A</div>
                </div>
            </div>
        );
    }
}

// Badge cell renderer
export function renderBadge<T>(
    row: Row<T>,
    accessorKey: string,
    color: BadgeColor = "default",
    colorAccessorKey?: string,
    colorMapping?: Record<string, BadgeColor>
) {
    try {
        const value = (row.getValue(accessorKey) as string) || "Unknown";

        // Determine badge color if colorAccessorKey and colorMapping are provided
        let badgeColor = color;
        if (colorAccessorKey && colorMapping) {
            const colorCode = row.getValue(colorAccessorKey) as string;
            if (colorCode && colorMapping[colorCode]) {
                badgeColor = colorMapping[colorCode];
            }
        }

        return (
            <div className="flex justify-center items-center">
                <Badge color={badgeColor} variant="soft">
                    {value}
                </Badge>
            </div>
        );
    } catch (error) {
        console.error(`Error rendering badge for ${accessorKey}:`, error);
        return (
            <div className="flex justify-center items-center">
                <Badge color="default" variant="soft">
                    Unknown
                </Badge>
            </div>
        );
    }
}

// Color cell renderer
export function renderColor<T>(
    row: Row<T>,
    nameAccessorKey: string,
    codeAccessorKey: string,
    colorMapping?: Record<string, string>
) {
    try {
        const colorName = (row.getValue(nameAccessorKey) as string) || "Unknown";
        const colorCode = (row.getValue(codeAccessorKey) as string) || "";

        // Map color code to CSS color
        let cssColor = "#888";
        if (colorCode && colorMapping && colorMapping[colorCode.toString().toUpperCase()]) {
            cssColor = colorMapping[colorCode.toString().toUpperCase()];
        } else if (colorCode) {
            // Default color mapping if not provided
            switch (colorCode.toString().toUpperCase()) {
                case "BLACK":
                    cssColor = "#000";
                    break;
                case "WHITE":
                    cssColor = "#fff";
                    break;
                case "BROWN":
                    cssColor = "#8B4513";
                    break;
                case "GRAY":
                    cssColor = "#808080";
                    break;
            }
        }

        return (
            <div className="flex items-center gap-2">
                <div
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: cssColor }}
                />
                <span>{colorName}</span>
            </div>
        );
    } catch (error) {
        console.error("Error rendering color:", error);
        return (
            <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border border-gray-300 bg-gray-300" />
                <span>Unknown</span>
            </div>
        );
    }
}

// Price cell renderer
export function renderPrice<T>(
    row: Row<T>,
    priceAccessorKey: string,
    originalPriceAccessorKey?: string,
    formatFunction = formatVND
) {
    try {
        // Remove debugger statement
        const price = (row.getValue(priceAccessorKey) as number) || 0;

        // Safely handle the original price
        let originalPrice = 0;
        if (originalPriceAccessorKey) {
            try {
                originalPrice = (row.original as Record<string, number>)[originalPriceAccessorKey];
                // If originalPrice is null, undefined, or NaN, set it to 0
                if (originalPrice === null || originalPrice === undefined || isNaN(originalPrice)) {
                    originalPrice = 0;
                }
            } catch (err) {
                console.warn(`Could not get value for ${originalPriceAccessorKey}`, err);
                originalPrice = 0;
            }
        }

        return (
            <div className="flex flex-col items-end text-right">
                <span className="font-medium">{formatFunction(price)}</span>
                {originalPriceAccessorKey && originalPrice > 0 && (
                    <span className="text-xs text-gray-500 line-through">
                        {formatFunction(originalPrice)}
                    </span>
                )}
            </div>
        );
    } catch (error) {
        console.error("Error rendering price:", error);
        return (
            <div className="flex flex-col items-end text-right">
                <span className="font-medium">{formatFunction(0)}</span>
            </div>
        );
    }
}

// Date cell renderer
export function renderDate<T>(
    row: Row<T>,
    accessorKey: string,
    format: string = "HH:mm DD/MM/YYYY",
    alignment: "left" | "center" | "right" = "right"
) {
    try {
        const date = row.getValue(accessorKey) as string;

        if (!date) return <div className={`text-${alignment}`}>N/A</div>;

        const formattedDate = dayjs(date).format(format);

        return (
            <div className={`text-${alignment} ${alignment === "right" ? "pr-4" : ""}`}>
                {formattedDate}
            </div>
        );
    } catch (error) {
        console.error("Error rendering date:", error);
        return (
            <div className={`text-${alignment} ${alignment === "right" ? "pr-4" : ""}`}>N/A</div>
        );
    }
}

// Text cell renderer with alignment
export function renderText<T>(
    row: Row<T>,
    accessorKey: string,
    alignment: "left" | "center" | "right" = "left"
) {
    try {
        const text = row.getValue(accessorKey);
        // Convert to string to ensure it's a valid ReactNode
        const displayText = text !== null && text !== undefined ? String(text) : "N/A";
        return <div className={`text-${alignment}`}>{displayText}</div>;
    } catch (error) {
        console.error("Error rendering text:", error);
        return <div className={`text-${alignment}`}>N/A</div>;
    }
}

// Number cell renderer
export function renderNumber<T>(
    row: Row<T>,
    accessorKey: string,
    formatFunction?: (value: number) => string,
    alignment: "left" | "center" | "right" = "right"
) {
    try {
        const value = (row.getValue(accessorKey) as number) || 0;
        const formattedValue = formatFunction ? formatFunction(value) : value.toString();

        return <div className={`text-${alignment}`}>{formattedValue}</div>;
    } catch (error) {
        console.error("Error rendering number:", error);
        return <div className={`text-${alignment}`}>0</div>;
    }
}

// Boolean cell renderer (e.g., for Yes/No values)
export function renderBoolean<T>(
    row: Row<T>,
    accessorKey: string,
    trueText: string = "Yes",
    falseText: string = "No",
    alignment: "left" | "center" | "right" = "center"
) {
    try {
        const value = row.getValue(accessorKey) as boolean;
        return (
            <div className={`text-${alignment}`}>
                {value ? (
                    <span className="text-green-600">{trueText}</span>
                ) : (
                    <span className="text-red-600">{falseText}</span>
                )}
            </div>
        );
    } catch (error) {
        console.error("Error rendering boolean:", error);
        return <div className={`text-${alignment}`}>{falseText}</div>;
    }
}
