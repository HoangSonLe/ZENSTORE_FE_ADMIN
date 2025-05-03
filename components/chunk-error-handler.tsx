"use client";

import { useEffect } from "react";

// Define the global environment config type
declare global {
    interface Window {
        ENV_CONFIG: {
            API_URL: string;
            SITE_NAME: string;
            AUTH_ENABLED: boolean;
            SESSION_TIMEOUT: number;
            BASE_URL: string;
            USE_RELATIVE_PATHS: boolean;
            PROBLEMATIC_CHUNKS: string[];
            USE_BLOB_FOR_SPECIAL_CHUNKS: boolean;
            DEBUG: boolean;
            VERSION: string;
        };
        // Keep RUNTIME_CONFIG for backward compatibility
        RUNTIME_CONFIG?: {
            BASE_URL: string;
            API_URL: string;
            DEBUG: boolean;
            VERSION: string;
        };
        __NEXT_ASSET_PREFIX__: string;
    }
}

export default function ChunkErrorHandler() {
    useEffect(() => {
        // Function to handle chunk loading errors
        const handleChunkError = (event: ErrorEvent) => {
            // Check if this is a chunk loading error
            if (
                event.message &&
                (event.message.includes("ChunkLoadError") ||
                    event.message.includes("Loading chunk") ||
                    event.message.includes("failed to fetch dynamically imported module"))
            ) {
                console.warn("Chunk loading error detected, attempting to reload the page");

                // Get the base URL from environment config
                const baseUrl =
                    window.ENV_CONFIG?.BASE_URL || window.RUNTIME_CONFIG?.BASE_URL || "";
                console.log("Using base URL for chunk loading:", baseUrl);

                // Clear cache by removing problematic script tags
                const scripts = document.getElementsByTagName("script");
                for (let i = 0; i < scripts.length; i++) {
                    const src = scripts[i].src;
                    if (src && src.includes("/_next/static/chunks/")) {
                        scripts[i].remove();
                        i--; // Adjust index after removal
                    }
                }

                // Update the asset prefix if needed
                if (window.__NEXT_ASSET_PREFIX__ !== baseUrl) {
                    console.log(
                        "Updating asset prefix from",
                        window.__NEXT_ASSET_PREFIX__,
                        "to",
                        baseUrl
                    );
                    window.__NEXT_ASSET_PREFIX__ = baseUrl;
                }

                // Reload the page after a short delay
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
        };

        // Add event listener for errors
        window.addEventListener("error", handleChunkError);

        // Clean up
        return () => {
            window.removeEventListener("error", handleChunkError);
        };
    }, []);

    // This component doesn't render anything
    return null;
}
