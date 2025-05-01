// This file helps configure paths for the static export
// It uses the runtime-config.js values which can be modified after build

// Load the chunk proxy script
(function () {
    const script = document.createElement("script");
    script.src = "/chunk-proxy.js";
    script.async = false;
    document.head.appendChild(script);
})();

// Wait for runtime config to be loaded
(function () {
    function setupPathConfig() {
        // Check if runtime config is available
        if (typeof window.RUNTIME_CONFIG === "undefined") {
            // If not available yet, wait and try again
            console.log("Waiting for runtime config to load...");
            setTimeout(setupPathConfig, 100);
            return;
        }

        // Set asset prefix from runtime config
        window.__NEXT_ASSET_PREFIX__ = window.RUNTIME_CONFIG.BASE_URL || "";
        console.log("Asset prefix set to:", window.__NEXT_ASSET_PREFIX__);

        // Use relative paths if configured to do so
        const useRelativePaths = window.RUNTIME_CONFIG.USE_RELATIVE_PATHS || false;
        console.log("Using relative paths:", useRelativePaths);

        // Helper function to fix chunk loading paths
        window.__fixChunkPath = function (path) {
            // If using relative paths, remove the leading slash
            if (useRelativePaths && path.startsWith("/")) {
                return path.substring(1); // Remove leading slash for relative path
            } else if (path.startsWith("/")) {
                return window.__NEXT_ASSET_PREFIX__ + path;
            }
            return path;
        };

        // Patch fetch and XMLHttpRequest to handle chunk loading
        const originalFetch = window.fetch;
        window.fetch = function (url, options) {
            // If this is a chunk request
            if (typeof url === "string" && url.includes("/_next/static/chunks/")) {
                // Check if this is a problematic chunk (contains parentheses or is in the problematic list)
                const isProblematicChunk =
                    url.includes("(") ||
                    url.includes(")") ||
                    window.RUNTIME_CONFIG.PROBLEMATIC_CHUNKS.some((chunk) => url.includes(chunk));

                // If it's a problematic chunk and we're using blob for special chunks
                if (isProblematicChunk && window.RUNTIME_CONFIG.USE_BLOB_FOR_SPECIAL_CHUNKS) {
                    console.log("Handling problematic chunk via proxy:", url);

                    // If the chunk proxy is loaded, use it
                    if (window.__loadChunkViaBlob) {
                        return window
                            .__loadChunkViaBlob(url)
                            .then((blobUrl) => {
                                console.log("Loaded chunk via blob:", blobUrl);
                                // Return a mock response with the blob URL
                                return new Response(
                                    `// Chunk loaded via blob
                                    import * as chunk from "${blobUrl}";
                                    export * from "${blobUrl}";
                                    export { chunk as default };`,
                                    {
                                        status: 200,
                                        headers: new Headers({
                                            "Content-Type": "application/javascript",
                                        }),
                                    }
                                );
                            })
                            .catch((error) => {
                                console.error("Failed to load chunk via blob:", error);
                                return Promise.reject(error);
                            });
                    }
                }

                // For non-problematic chunks or if blob loading is disabled
                // Apply the fix chunk path function
                url = window.__fixChunkPath(url);
                console.log("Modified fetch URL:", url);
            }

            // Use the original fetch with the modified URL
            return originalFetch(url, options).catch((error) => {
                // If we get a 403 or 404 error, try with a relative path
                if (
                    error.status === 403 ||
                    error.status === 404 ||
                    error.message.includes("Failed to fetch") ||
                    error.message.includes("NetworkError")
                ) {
                    console.warn("Fetch error, trying with relative path:", error);
                    // Try with a relative path by removing the leading slash
                    if (typeof url === "string" && url.startsWith("/")) {
                        const relativeUrl = url.substring(1);
                        console.log("Retrying with relative URL:", relativeUrl);
                        return originalFetch(relativeUrl, options);
                    }
                }
                return Promise.reject(error);
            });
        };

        // Also patch the script loading mechanism
        const originalCreateElement = document.createElement;
        document.createElement = function (tagName) {
            const element = originalCreateElement.apply(document, arguments);
            if (tagName.toLowerCase() === "script") {
                const originalSetAttribute = element.setAttribute;
                element.setAttribute = function (name, value) {
                    if (
                        name === "src" &&
                        typeof value === "string" &&
                        value.includes("/_next/static/chunks/")
                    ) {
                        // Check if this is a problematic chunk
                        const isProblematicChunk =
                            value.includes("(") ||
                            value.includes(")") ||
                            window.RUNTIME_CONFIG.PROBLEMATIC_CHUNKS.some((chunk) =>
                                value.includes(chunk)
                            );

                        // If it's a problematic chunk and we're using blob for special chunks
                        if (
                            isProblematicChunk &&
                            window.RUNTIME_CONFIG.USE_BLOB_FOR_SPECIAL_CHUNKS &&
                            window.__loadChunkViaBlob
                        ) {
                            console.log("Handling problematic script via proxy:", value);

                            // Don't set the src attribute yet
                            const originalSrc = value;

                            // Load the chunk via blob
                            window
                                .__loadChunkViaBlob(originalSrc)
                                .then((blobUrl) => {
                                    console.log("Setting script src to blob URL:", blobUrl);
                                    originalSetAttribute.call(this, "src", blobUrl);

                                    // Dispatch a load event
                                    const loadEvent = new Event("load");
                                    this.dispatchEvent(loadEvent);
                                })
                                .catch((error) => {
                                    console.error("Failed to load script via blob:", error);

                                    // Try with the fixed path as a fallback
                                    const fixedPath = window.__fixChunkPath(originalSrc);
                                    console.log("Falling back to fixed path:", fixedPath);
                                    originalSetAttribute.call(this, "src", fixedPath);
                                });

                            // Return early to prevent setting the original src
                            return;
                        } else {
                            // For non-problematic chunks or if blob loading is disabled
                            value = window.__fixChunkPath(value);
                            console.log("Modified script src:", value);
                        }
                    }
                    return originalSetAttribute.call(this, name, value);
                };
            }
            return element;
        };

        // Intercept and fix chunk loading errors
        window.addEventListener("error", function (event) {
            if (
                event.message &&
                (event.message.includes("ChunkLoadError") ||
                    event.message.includes("Loading chunk") ||
                    event.message.includes("failed to fetch dynamically imported module") ||
                    event.message.includes("NetworkError") ||
                    event.message.includes("Failed to fetch"))
            ) {
                console.warn("Chunk loading error detected:", event.message);

                // Try to identify the failing script
                let failingScript = null;
                if (event.target && event.target.tagName === "SCRIPT" && event.target.src) {
                    failingScript = event.target.src;
                } else if (event.filename) {
                    failingScript = event.filename;
                }

                // If we found a failing script, try to fix it
                if (failingScript && failingScript.includes("/_next/static/chunks/")) {
                    console.log("Attempting to fix failing script:", failingScript);

                    // Check if this is a problematic chunk
                    const isProblematicChunk =
                        failingScript.includes("(") ||
                        failingScript.includes(")") ||
                        window.RUNTIME_CONFIG.PROBLEMATIC_CHUNKS.some((chunk) =>
                            failingScript.includes(chunk)
                        );

                    // If it's a problematic chunk and we're using blob for special chunks
                    if (
                        isProblematicChunk &&
                        window.RUNTIME_CONFIG.USE_BLOB_FOR_SPECIAL_CHUNKS &&
                        window.__loadChunkViaBlob
                    ) {
                        console.log("Handling failing script via proxy:", failingScript);

                        // Load the chunk via blob
                        window
                            .__loadChunkViaBlob(failingScript)
                            .then((blobUrl) => {
                                console.log("Loaded failing script via blob:", blobUrl);

                                // Create a new script element with the blob URL
                                const script = document.createElement("script");
                                script.src = blobUrl;
                                script.async = true;
                                document.head.appendChild(script);

                                // Prevent the default error handling
                                event.preventDefault();
                            })
                            .catch((error) => {
                                console.error("Failed to load failing script via blob:", error);

                                // Try with a relative path as a fallback
                                if (failingScript.startsWith("/")) {
                                    const relativeScript = failingScript.substring(1);
                                    console.log(
                                        "Trying to load with relative path:",
                                        relativeScript
                                    );

                                    // Create a new script element with the relative path
                                    const script = document.createElement("script");
                                    script.src = relativeScript;
                                    script.async = true;
                                    document.head.appendChild(script);
                                }
                            });

                        // Prevent the default error handling
                        event.preventDefault();
                        return;
                    }
                    // For non-problematic chunks or if blob loading is disabled
                    else if (failingScript.startsWith("/")) {
                        const relativeScript = failingScript.substring(1);
                        console.log("Trying to load with relative path:", relativeScript);

                        // Create a new script element with the relative path
                        const script = document.createElement("script");
                        script.src = relativeScript;
                        script.async = true;
                        document.head.appendChild(script);

                        // Prevent the default error handling
                        event.preventDefault();
                        return;
                    }
                }

                // If we couldn't fix it or after a few attempts, reload the page
                console.warn("Could not fix chunk loading, reloading page...");
                setTimeout(() => {
                    // Try to clear cache before reloading
                    if (window.caches && window.caches.keys) {
                        window.caches
                            .keys()
                            .then((cacheNames) => {
                                cacheNames.forEach((cacheName) => {
                                    window.caches.delete(cacheName);
                                });
                                window.location.reload();
                            })
                            .catch(() => {
                                window.location.reload();
                            });
                    } else {
                        window.location.reload();
                    }
                }, 2000);
            }
        });
    }

    // Start the setup process
    setupPathConfig();
})();
