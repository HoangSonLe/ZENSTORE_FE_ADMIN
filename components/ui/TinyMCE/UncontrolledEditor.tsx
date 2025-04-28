"use client";

// Import all TinyMCE dependencies
import "tinymce/tinymce";
import "tinymce/models/dom/model";
import "tinymce/themes/silver";
import "tinymce/icons/default";
import "tinymce/skins/ui/oxide/skin";
import "tinymce/plugins/advlist";
import "tinymce/plugins/anchor";
import "tinymce/plugins/autolink";
import "tinymce/plugins/autoresize";
import "tinymce/plugins/autosave";
import "tinymce/plugins/charmap";
import "tinymce/plugins/code";
import "tinymce/plugins/codesample";
import "tinymce/plugins/directionality";
import "tinymce/plugins/emoticons";
// Removed fullscreen plugin as we'll implement our own
import "tinymce/plugins/help";
import "tinymce/plugins/help/js/i18n/keynav/en";
import "tinymce/plugins/image";
import "tinymce/plugins/importcss";
import "tinymce/plugins/insertdatetime";
import "tinymce/plugins/link";
import "tinymce/plugins/lists";
import "tinymce/plugins/media";
import "tinymce/plugins/nonbreaking";
import "tinymce/plugins/pagebreak";
import "tinymce/plugins/preview";
import "tinymce/plugins/quickbars";
import "tinymce/plugins/save";
import "tinymce/plugins/searchreplace";
import "tinymce/plugins/table";
import "tinymce/plugins/visualblocks";
import "tinymce/plugins/visualchars";
import "tinymce/plugins/wordcount";
import "tinymce/plugins/emoticons/js/emojis";
import "tinymce/skins/content/default/content";
import "tinymce/skins/ui/oxide/content";

import { Editor } from "@tinymce/tinymce-react";
import { forwardRef, memo, useEffect, useImperativeHandle, useRef } from "react";

export interface UncontrolledEditorRef {
    getContent: () => string;
    setContent: (content: string) => void;
}

export interface UncontrolledEditorProps {
    initialValue?: string;
    value?: string;
    morePlugins?: string[];
    height?: string;
    onChange: (content: string) => void;
}

/**
 * An uncontrolled TinyMCE editor component that preserves cursor position
 * by avoiding React's controlled component pattern.
 */
const UncontrolledEditor = forwardRef<UncontrolledEditorRef, UncontrolledEditorProps>(
    ({ initialValue = "", value, height, morePlugins = [], onChange }, ref) => {
        const editorRef = useRef<any>(null);
        const initialContentRef = useRef(initialValue || value || "");
        const isInitializedRef = useRef(false);

        // Expose methods to parent using useImperativeHandle
        useImperativeHandle(ref, () => ({
            getContent: () => {
                return editorRef.current
                    ? editorRef.current.getContent()
                    : initialContentRef.current;
            },
            setContent: (content: string) => {
                if (editorRef.current) {
                    editorRef.current.setContent(content);
                }
            },
        }));

        // Use initialValue or value, with initialValue taking precedence
        useEffect(() => {
            if (!isInitializedRef.current) {
                initialContentRef.current = initialValue || value || "";
            }
        }, [initialValue, value]);

        // Update editor content when value prop changes
        useEffect(() => {
            // Only update if editor is initialized and value is provided
            if (isInitializedRef.current && editorRef.current && value !== undefined) {
                // Get current content from editor
                const currentContent = editorRef.current.getContent();

                // Only update if the content is different to avoid cursor jumping
                if (currentContent !== value) {
                    console.log("Updating editor content from prop:", value);
                    editorRef.current.setContent(value);
                }
            }
        }, [value]);

        const toolbar =
            "accordion accordionremove | blocks fontfamily fontsize | " +
            "bold italic underline strikethrough forecolor backcolor | " +
            "alignleft aligncenter alignright alignjustify align | " +
            "bullist numlist outdent indent lineheight | " +
            "link image table media | " +
            "charmap emoticons code custom_fullscreen preview | " + // Changed fullscreen to custom_fullscreen
            "pagebreak | ltr rtl | removeformat";

        const plugins = [
            "advlist",
            "anchor",
            "autolink",
            "image",
            "link",
            "lists",
            "searchreplace",
            "table",
            "wordcount",
            "preview",
            "autosave",
            "directionality",
            "code",
            "visualblocks",
            "visualchars",
            // Removed fullscreen plugin
            "media",
            // "codesample",
            "charmap",
            "pagebreak",
            "nonbreaking",
            "insertdatetime",
            "emoticons",
            ...(morePlugins ?? []),
        ];

        // Mark as initialized after first render
        useEffect(() => {
            isInitializedRef.current = true;
        }, []);

        // Custom onChange handler to prevent cursor jumping
        const handleEditorChange = (content: string) => {
            onChange(content);
        };

        return (
            <Editor
                onInit={(_, editor) => {
                    editorRef.current = editor;
                    isInitializedRef.current = true;
                }}
                initialValue={initialContentRef.current}
                init={{
                    height: height ?? 500,
                    menubar: false,
                    plugins: plugins,
                    toolbar: toolbar,
                    content_style:
                        "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                    noneditable_class: "mceNonEditable",
                    toolbar_mode: "sliding",
                    contextmenu: "link image table",
                    importcss_append: true,
                    branding: false,
                    // Set ui_container to document.body to fix fullscreen mode
                    ui_container: document.body,
                    // Ensure the editor is attached to the body for fullscreen
                    inline: false,
                    // Ensure dialogs appear above other elements
                    z_index: 999999,
                    // Setup function to handle fullscreen mode
                    setup: (editor) => {
                        // Track fullscreen state
                        let isFullscreen = false;
                        let originalHeight = height ?? 500;
                        let originalStyles: Record<string, string> = {};

                        // Register custom fullscreen button
                        editor.ui.registry.addButton("custom_fullscreen", {
                            icon: "fullscreen",
                            tooltip: "Fullscreen",
                            onAction: function () {
                                try {
                                    const editorContainer = editor.getContainer();
                                    const editorIframe = editor
                                        .getContentAreaContainer()
                                        .querySelector("iframe");
                                    const editorToolbar =
                                        editorContainer.querySelector(".tox-editor-header");

                                    if (!isFullscreen) {
                                        // Enter fullscreen mode
                                        console.log("Entering custom fullscreen mode");

                                        // Save original styles
                                        originalStyles = {
                                            position: editorContainer.style.position,
                                            top: editorContainer.style.top,
                                            left: editorContainer.style.left,
                                            width: editorContainer.style.width,
                                            height: editorContainer.style.height,
                                            zIndex: editorContainer.style.zIndex,
                                        };

                                        // Apply fullscreen styles
                                        document.body.classList.add("tox-fullscreen");
                                        editorContainer.classList.add("tox-fullscreen");

                                        // Set container styles
                                        editorContainer.style.position = "fixed";
                                        editorContainer.style.top = "0";
                                        editorContainer.style.left = "0";
                                        editorContainer.style.width = "100vw";
                                        editorContainer.style.height = "100vh";
                                        editorContainer.style.zIndex = "9999";

                                        // Adjust iframe height to fill available space
                                        if (editorIframe) {
                                            const toolbarHeight = editorToolbar
                                                ? (editorToolbar as HTMLElement).offsetHeight
                                                : 0;
                                            const statusbarHeight = editorContainer.querySelector(
                                                ".tox-statusbar"
                                            )
                                                ? (
                                                      editorContainer.querySelector(
                                                          ".tox-statusbar"
                                                      ) as HTMLElement
                                                  ).offsetHeight
                                                : 0;

                                            // Calculate available height
                                            const availableHeight =
                                                window.innerHeight -
                                                toolbarHeight -
                                                statusbarHeight;
                                            editorIframe.style.height = `${availableHeight}px`;
                                        }

                                        // Set fullscreen state
                                        isFullscreen = true;
                                    } else {
                                        // Exit fullscreen mode
                                        console.log("Exiting custom fullscreen mode");

                                        // Remove fullscreen classes
                                        document.body.classList.remove("tox-fullscreen");
                                        editorContainer.classList.remove("tox-fullscreen");

                                        // Restore original styles
                                        editorContainer.style.position =
                                            originalStyles.position || "";
                                        editorContainer.style.top = originalStyles.top || "";
                                        editorContainer.style.left = originalStyles.left || "";
                                        editorContainer.style.width = originalStyles.width || "";
                                        editorContainer.style.height = originalStyles.height || "";
                                        editorContainer.style.zIndex = originalStyles.zIndex || "";

                                        // Restore iframe height
                                        if (editorIframe) {
                                            editorIframe.style.height = "";
                                        }

                                        // Reset editor height
                                        // Use editor.dom to set height instead of settings
                                        editor.dom.setStyle(
                                            editor.getContainer(),
                                            "height",
                                            `${originalHeight}px`
                                        );

                                        // Set fullscreen state
                                        isFullscreen = false;
                                    }

                                    // Trigger resize to ensure editor layout updates
                                    editor.fire("ResizeEditor");
                                } catch (error) {
                                    console.error("Error handling custom fullscreen:", error);
                                }
                            },
                        });

                        // Handle window resize in fullscreen mode
                        const handleWindowResize = () => {
                            if (isFullscreen) {
                                try {
                                    const editorContainer = editor.getContainer();
                                    const editorIframe = editor
                                        .getContentAreaContainer()
                                        .querySelector("iframe");
                                    const editorToolbar =
                                        editorContainer.querySelector(".tox-editor-header");

                                    if (editorIframe) {
                                        const toolbarHeight = editorToolbar
                                            ? (editorToolbar as HTMLElement).offsetHeight
                                            : 0;
                                        const statusbarHeight = editorContainer.querySelector(
                                            ".tox-statusbar"
                                        )
                                            ? (
                                                  editorContainer.querySelector(
                                                      ".tox-statusbar"
                                                  ) as HTMLElement
                                              ).offsetHeight
                                            : 0;

                                        // Calculate available height
                                        const availableHeight =
                                            window.innerHeight - toolbarHeight - statusbarHeight;
                                        editorIframe.style.height = `${availableHeight}px`;
                                    }
                                } catch (error) {
                                    console.error(
                                        "Error handling window resize in fullscreen:",
                                        error
                                    );
                                }
                            }
                        };

                        // Add window resize listener
                        window.addEventListener("resize", handleWindowResize);

                        // Clean up event listener when editor is removed
                        editor.on("remove", () => {
                            window.removeEventListener("resize", handleWindowResize);
                        });
                    },
                    file_picker_types: "file image media",
                    file_picker_callback: (cb, _value, meta) => {
                        const input = document.createElement("input");
                        input.setAttribute("type", "file");

                        if (meta.filetype === "image") {
                            input.setAttribute("accept", "image/*");
                        } else if (meta.filetype === "media") {
                            input.setAttribute("accept", "video/*");
                        }

                        input.onchange = function (e: any) {
                            const file = e.target.files[0];
                            const reader = new FileReader();

                            reader.onload = function (e) {
                                const result = e.target?.result as string;
                                cb(result, { title: file.name });
                            };

                            reader.readAsDataURL(file);
                        };

                        input.click();
                    },
                }}
                onEditorChange={handleEditorChange}
            />
        );
    }
);

UncontrolledEditor.displayName = "UncontrolledEditor";

export default memo(UncontrolledEditor);
