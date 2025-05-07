// Add custom property to Window interface
declare global {
    interface Window {
        _layoutHeightsTimeout?: number;
    }
}

/**
 * Sets the --vh CSS variable based on the actual viewport height
 * This helps with mobile browsers where the viewport height can change
 * when the address bar is shown/hidden
 */
export function setViewportHeight(): void {
    if (typeof window !== "undefined") {
        // Get the viewport height
        const vh = window.innerHeight * 0.01;
        // Set the --vh CSS variable
        document.documentElement.style.setProperty("--vh", `${vh}px`);
    }
}

/**
 * Sets the --header-height and --footer-height CSS variables based on actual DOM elements
 * This makes the layout responsive to the actual header and footer heights
 */
export function setLayoutHeights(): void {
    if (typeof window !== "undefined" && document) {
        // Small delay to ensure DOM is fully rendered
        setTimeout(() => {
            // Get header element - be more specific to target the main header
            // Try different selectors to find the right header
            const headerSelectors = [
                "header.z-50", // The main header with z-index
                "header:first-of-type", // First header in the document
                "header", // Fallback to any header
            ];

            let headerElement = null;
            for (const selector of headerSelectors) {
                const element = document.querySelector(selector);
                if (element && element.offsetHeight > 0) {
                    headerElement = element;
                    break;
                }
            }

            if (headerElement) {
                const headerHeight = headerElement.offsetHeight;
                document.documentElement.style.setProperty("--header-height", `${headerHeight}px`);
            } else {
                console.warn("Header element not found or has zero height");
            }

            // Get footer element - be more specific to target the main footer
            // Try different selectors to find the right footer
            const footerSelectors = [
                "footer:last-of-type", // Last footer in the document
                "footer", // Fallback to any footer
            ];

            let footerElement = null;
            for (const selector of footerSelectors) {
                const element = document.querySelector(selector);
                if (element && element.offsetHeight > 0) {
                    footerElement = element;
                    break;
                }
            }

            if (footerElement) {
                const footerHeight = footerElement.offsetHeight;
                document.documentElement.style.setProperty("--footer-height", `${footerHeight}px`);
            } else {
                console.warn("Footer element not found or has zero height");
            }
        }, 100);
    }
}

/**
 * Initialize the viewport height and layout heights, and add resize listener
 * Call this function in a useEffect hook in a client component
 */
export function initViewportHeight(): () => void {
    // Set the initial viewport height and layout heights
    setViewportHeight();
    setLayoutHeights();

    // Function to handle resize events
    const handleResize = () => {
        setViewportHeight();
        setLayoutHeights();
    };

    // Add resize event listener
    window.addEventListener("resize", handleResize);

    // Add mutation observer to detect DOM changes that might affect heights
    if (typeof MutationObserver !== "undefined") {
        const observer = new MutationObserver((mutations) => {
            // Check if any mutations affect layout
            const layoutAffectingMutations = mutations.some(
                (mutation) =>
                    mutation.type === "childList" ||
                    (mutation.type === "attributes" &&
                        (mutation.attributeName === "style" || mutation.attributeName === "class"))
            );

            if (layoutAffectingMutations) {
                // Debounce the layout height calculation
                if (window._layoutHeightsTimeout) {
                    clearTimeout(window._layoutHeightsTimeout);
                }

                window._layoutHeightsTimeout = setTimeout(() => {
                    setLayoutHeights();
                    delete window._layoutHeightsTimeout;
                }, 50);
            }
        });

        // Observe the body for changes to catch layout shifts
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["style", "class", "hidden", "data-state"],
        });

        // Return cleanup function
        return () => {
            window.removeEventListener("resize", handleResize);
            observer.disconnect();
        };
    }

    // Return cleanup function if MutationObserver is not available
    return () => {
        window.removeEventListener("resize", handleResize);
    };
}
