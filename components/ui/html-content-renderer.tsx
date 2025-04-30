"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface HtmlContentRendererProps {
    content: string;
    maxHeight?: number; // Maximum height in pixels before showing expand/collapse
    className?: string;
}

export function HtmlContentRenderer({
    content,
    maxHeight = 100, // Default max height
    className,
}: HtmlContentRendererProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    // Check if content is overflowing and needs expand/collapse controls
    useEffect(() => {
        if (contentRef.current) {
            const hasOverflow = contentRef.current.scrollHeight > maxHeight;
            setIsOverflowing(hasOverflow);
        }
    }, [content, maxHeight]);

    // Toggle expanded state
    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className={cn("relative", className)}>
            <div
                ref={contentRef}
                className={cn("overflow-hidden transition-all duration-200", {
                    "max-h-[100px]": !isExpanded && isOverflowing,
                })}
                style={{ maxHeight: !isExpanded && isOverflowing ? `${maxHeight}px` : "none" }}
            >
                {/* Render HTML content safely */}
                <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>

            {/* Show gradient overlay and expand/collapse button if content is overflowing */}
            {isOverflowing && (
                <>
                    {!isExpanded && (
                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                    )}
                    <span
                        onClick={toggleExpand}
                        className="mt-1 cursor-pointer text-xs font-medium text-primary hover:text-primary/80 inline-block"
                    >
                        {isExpanded ? "Thu gọn" : "Xem thêm"}
                    </span>
                </>
            )}
        </div>
    );
}
