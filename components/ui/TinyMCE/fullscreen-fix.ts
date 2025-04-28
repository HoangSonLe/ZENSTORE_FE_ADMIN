/**
 * This file contains fixes for TinyMCE fullscreen mode in Next.js
 *
 * It adds CSS to ensure the editor appears above other elements when in fullscreen mode
 * and handles z-index issues with dialogs and other UI elements.
 */

// This code runs only in the browser
if (typeof window !== "undefined") {
    // Add a style element to the document head
    const style = document.createElement("style");
    style.innerHTML = `
    /* Fix for TinyMCE fullscreen mode */
    body.tox-fullscreen {
      overflow: hidden !important;
    }

    .tox-fullscreen {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      z-index: 9999 !important;
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
      border-radius: 0 !important;
      max-width: none !important;
      max-height: none !important;
    }

    /* Ensure TinyMCE dialogs appear above other elements */
    .tox-dialog-wrap {
      z-index: 10000 !important;
    }

    /* Ensure TinyMCE dialogs appear above other elements in fullscreen mode */
    .tox-fullscreen .tox-dialog-wrap {
      z-index: 10001 !important;
    }

    /* Fix for TinyMCE toolbar in fullscreen mode */
    .tox-fullscreen .tox-toolbar,
    .tox-fullscreen .tox-toolbar__primary,
    .tox-fullscreen .tox-toolbar__overflow {
      z-index: 10000 !important;
      position: sticky !important;
      top: 0 !important;
      background-color: white !important;
    }

    /* Fix for TinyMCE statusbar in fullscreen mode */
    .tox-fullscreen .tox-statusbar {
      z-index: 10000 !important;
      position: sticky !important;
      bottom: 0 !important;
      background-color: white !important;
    }

    /* Fix for TinyMCE editor content in fullscreen mode */
    .tox-fullscreen .tox-edit-area {
      position: absolute !important;
      top: 40px !important; /* Adjust based on your toolbar height */
      bottom: 25px !important; /* Adjust based on your statusbar height */
      left: 0 !important;
      right: 0 !important;
      height: auto !important;
    }

    .tox-fullscreen .tox-edit-area__iframe {
      height: 100% !important;
    }

    /* Fix for TinyMCE editor container in fullscreen mode */
    .tox-fullscreen .tox-editor-container {
      display: flex !important;
      flex-direction: column !important;
      height: 100vh !important;
    }

    /* Fix for TinyMCE editor header in fullscreen mode */
    .tox-fullscreen .tox-editor-header {
      flex-shrink: 0 !important;
    }

    /* Fix for TinyMCE editor content in fullscreen mode */
    .tox-fullscreen .tox-edit-area {
      flex-grow: 1 !important;
      overflow: auto !important;
    }
  `;

    // Append the style element to the document head
    document.head.appendChild(style);

    // Add event listener for ESC key to exit fullscreen
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && document.body.classList.contains("tox-fullscreen")) {
            // Find all fullscreen editors and trigger their custom fullscreen button
            const fullscreenEditors = document.querySelectorAll(".tox-fullscreen");
            fullscreenEditors.forEach((editor) => {
                // Find the custom fullscreen button and click it
                const fullscreenButton = editor.querySelector('.tox-tbtn[aria-label="Fullscreen"]');
                if (fullscreenButton) {
                    (fullscreenButton as HTMLElement).click();
                }
            });
        }
    });
}

export {};
