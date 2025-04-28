/**
 * This script adds a global fix for TinyMCE fullscreen mode when used inside dialogs
 * It's loaded as a client-side script to ensure it runs in the browser
 */

// Wait for the DOM to be fully loaded
if (typeof window !== "undefined") {
    // Function to apply the fix
    const applyTinyMCEFullscreenFix = () => {
        // Create a style element
        const style = document.createElement("style");
        style.textContent = `
      /* Force fullscreen mode to cover the entire viewport */
      .tox-fullscreen {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        max-width: none !important;
        margin: 0 !important;
        padding: 0 !important;
        border: 0 !important;
        transform: none !important;
        z-index: 9999999 !important;
      }

      /* Ensure the editor container takes full width and height */
      .tox-fullscreen .tox-editor-container {
        width: 100vw !important;
        height: 100vh !important;
      }

      /* Ensure the iframe takes full width and height */
      .tox-fullscreen .tox-edit-area__iframe {
        width: 100% !important;
        height: 100% !important;
      }
    `;

        // Add the style to the document head
        document.head.appendChild(style);

        // Set up a mutation observer to detect when TinyMCE enters fullscreen mode
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (
                    mutation.type === "attributes" &&
                    mutation.attributeName === "class" &&
                    mutation.target instanceof HTMLElement
                ) {
                    // Check if entering fullscreen mode
                    if (mutation.target.classList.contains("tox-fullscreen")) {
                        // Move the fullscreen editor to the body
                        if (!document.body.contains(mutation.target)) {
                            document.body.appendChild(mutation.target);
                        }

                        // Ensure it has the highest z-index
                        mutation.target.style.zIndex = "9999999";

                        // Hide any dialog overlays
                        const overlays = document.querySelectorAll(".basic-dialog-overlay");
                        overlays.forEach((overlay) => {
                            if (overlay instanceof HTMLElement) {
                                overlay.style.display = "none";
                            }
                        });

                        // Add a class to the body
                        document.body.classList.add("tinymce-fullscreen-active");
                    }
                    // Check if exiting fullscreen mode
                    else if (
                        document.body.classList.contains("tinymce-fullscreen-active") &&
                        !document.querySelector(".tox-fullscreen")
                    ) {
                        // Show any dialog overlays again
                        const overlays = document.querySelectorAll(".basic-dialog-overlay");
                        overlays.forEach((overlay) => {
                            if (overlay instanceof HTMLElement) {
                                overlay.style.display = "";
                            }
                        });

                        // Remove the class from the body
                        document.body.classList.remove("tinymce-fullscreen-active");
                    }
                }
            });
        });

        // Start observing the document for changes
        observer.observe(document.documentElement, {
            subtree: true,
            attributes: true,
            attributeFilter: ["class"],
        });
    };

    // Apply the fix when the DOM is loaded
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", applyTinyMCEFullscreenFix);
    } else {
        applyTinyMCEFullscreenFix();
    }
}
