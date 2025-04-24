"use client";

import { forwardRef, memo, useImperativeHandle, useRef, useEffect, useState } from "react";
import { Editor } from "@tinymce/tinymce-react";

// Define the methods you want to expose to the parent
export interface CKEditorRef {
    getContent: () => string;
}

interface CKEditorProps {
    initialValue?: string | undefined;
    height?: string;
    onChange: (content: string) => void;
}

const CKEditor = forwardRef<CKEditorRef, CKEditorProps>(
    ({ initialValue, height, onChange }, ref) => {
        const [isMounted, setIsMounted] = useState(false);
        const editorRef = useRef<any>(null);
        const [value, setValue] = useState(initialValue || "");
        const isUpdatingRef = useRef(false);

        // Only render the editor on the client-side
        useEffect(() => {
            setIsMounted(true);
        }, []);

        // Add custom CSS to fix z-index issues and improve styling
        // useEffect(() => {
        //     // Add custom CSS to the document head
        //     const style = document.createElement("style");
        //     style.innerHTML = `
        //         /* Make the statusbar more visible */
        //         .tox-statusbar {
        //             border-top: 1px solid #ccc !important;
        //             background-color: #f8f8f8 !important;
        //             height: 25px !important;
        //         }
        //         /* Fix z-index for preview and other popups */
        //         .tox-dialog-wrap {
        //             z-index: 10000 !important;
        //         }
        //         .tox-dialog {
        //             z-index: 10001 !important;
        //         }
        //         .tox-dialog__backdrop {
        //             z-index: 10000 !important;
        //         }
        //         .tox-menu {
        //             z-index: 10002 !important;
        //         }
        //         .tox-collection--toolbar {
        //             z-index: 10002 !important;
        //         }
        //         .tox-selected-menu {
        //             z-index: 10003 !important;
        //         }
        //         .tox-collection--list {
        //             z-index: 10002 !important;
        //         }
        //         .tox-tooltip {
        //             z-index: 10003 !important;
        //         }
        //         .tox-pop {
        //             z-index: 10002 !important;
        //         }
        //         .tox-silver-sink {
        //             z-index: 10000 !important;
        //         }
        //     `;
        //     document.head.appendChild(style);

        //     // Clean up the style when component unmounts
        //     return () => {
        //         document.head.removeChild(style);
        //     };
        // }, []);

        // Expose methods to parent using useImperativeHandle
        useImperativeHandle(ref, () => ({
            getContent: () => {
                return editorRef.current ? editorRef.current.getContent() : "";
            },
        }));

        // Handle content change internally first
        const handleEditorChange = (content: string) => {
            // Update internal state
            setValue(content);

            // Notify parent component
            onChange(content);
        };

        // Responsive toolbar configuration
        const toolbar = [
            "bold italic underline | alignleft aligncenter alignright | bullist numlist | link image",
            "table media | fullscreen preview | removeformat",
        ];

        // Plugins including image support
        const plugins = [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            // "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "media",
            "table",
            "fullscreen",
            "wordcount",
        ];

        // Return a placeholder until the component is mounted
        if (!isMounted) {
            return (
                <div
                    style={{ height: height ?? 300, border: "1px solid #ccc" }}
                    className="flex items-center justify-center"
                >
                    Loading editor...
                </div>
            );
        }

        return (
            <div className="tinymce-wrapper">
                {isMounted && (
                    <Editor
                        value={value}
                        onInit={(_evt: any, editor: any) => {
                            editorRef.current = editor;
                        }}
                        init={{
                            height: height ?? 300,
                            menubar: false,
                            plugins: plugins,
                            toolbar: toolbar,
                            toolbar_mode: "sliding", // Use sliding mode for better mobile experience
                            toolbar_sticky: true, // Keep toolbar visible when scrolling
                            toolbar_location: "top", // Position toolbar at the top
                            resize: true, // Allow resizing
                            resize_img_proportional: true, // Keep image proportions when resizing
                            min_height: 200, // Set minimum height
                            max_height: 800, // Set maximum height
                            mobile: {
                                toolbar_mode: "scrolling", // Use scrolling mode on mobile
                                toolbar: toolbar, // Use the same toolbar on mobile
                            },
                            content_style:
                                "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                            branding: false,
                            promotion: false,
                            statusbar: true, // Show statusbar with resize handle
                            // File picker for images and media
                            file_picker_types: "file image media",
                            file_picker_callback: (cb: any, _value: any, meta: any) => {
                                // Create input element for file selection
                                const input = document.createElement("input");
                                input.setAttribute("type", "file");

                                // Set accept attribute based on file type
                                if (meta.filetype === "image") {
                                    input.setAttribute("accept", "image/*");
                                } else if (meta.filetype === "media") {
                                    input.setAttribute("accept", "video/*");
                                }

                                // Handle file selection
                                input.onchange = () => {
                                    if (!input.files) return;
                                    const file = input.files[0];

                                    // Create FileReader to read file as data URL
                                    const reader = new FileReader();
                                    reader.onload = () => {
                                        const result = reader.result as string;
                                        cb(result, { title: file.name });
                                    };
                                    reader.readAsDataURL(file);
                                };

                                // Trigger file selection dialog
                                input.click();
                            },
                            // Disable automatic updates and cloud services
                            setup: function (editor: any) {
                                editor.on("init", function () {
                                    // Hide any notification about API key
                                    try {
                                        if (editor.notificationManager) {
                                            const originalOpen = editor.notificationManager.open;
                                            editor.notificationManager.open = function (args: any) {
                                                // Filter out API key notifications
                                                if (
                                                    args &&
                                                    args.text &&
                                                    (args.text.includes("API key") ||
                                                        args.text.includes("Premium") ||
                                                        args.text.includes("trial") ||
                                                        args.text.includes("upgrade"))
                                                ) {
                                                    return {
                                                        close: () => {},
                                                        progressBar: { value: () => {} },
                                                        text: () => {},
                                                        reposition: () => {},
                                                        getEl: () => null,
                                                        moveTo: () => {},
                                                        moveRel: () => {},
                                                        settings: {},
                                                    };
                                                }
                                                return originalOpen.call(this, args);
                                            };
                                        }
                                    } catch (e) {
                                        console.log("Failed to modify notification manager", e);
                                    }
                                });
                            },
                        }}
                        onEditorChange={handleEditorChange}
                    />
                )}
            </div>
        );
    }
);

export default memo(CKEditor);
