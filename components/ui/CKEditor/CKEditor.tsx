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

        // Only render the editor on the client-side
        useEffect(() => {
            setIsMounted(true);
        }, []);

        // Expose methods to parent using useImperativeHandle
        useImperativeHandle(ref, () => ({
            getContent: () => {
                return editorRef.current ? editorRef.current.getContent() : "";
            },
        }));

        // Responsive toolbar configuration
        const toolbar = [
            {
                name: "formatting",
                items: ["bold", "italic", "underline", "strikethrough"],
            },
            {
                name: "alignment",
                items: ["alignleft", "aligncenter", "alignright", "alignjustify"],
            },
            {
                name: "lists",
                items: ["bullist", "numlist"],
            },
            {
                name: "indentation",
                items: ["outdent", "indent"],
            },
            {
                name: "insert",
                items: ["link", "image", "table", "media"],
            },
            {
                name: "view",
                items: ["fullscreen", "preview"],
            },
            {
                name: "tools",
                items: ["removeformat"],
            },
        ];

        // Plugins including image support
        const plugins = ["lists", "link", "image", "table", "fullscreen"];

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
                        onInit={(_evt: any, editor: any) => {
                            editorRef.current = editor;
                        }}
                        initialValue={initialValue}
                        init={{
                            height: height ?? 300,
                            menubar: false,
                            plugins: plugins,
                            toolbar: toolbar,
                            toolbar_mode: "sliding", // Use sliding mode for better mobile experience
                            toolbar_sticky: true, // Keep toolbar visible when scrolling
                            toolbar_location: "top", // Position toolbar at the top
                            resize: true, // Allow resizing
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
                            statusbar: false,
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
                        onEditorChange={onChange}
                    />
                )}
            </div>
        );
    }
);

export default memo(CKEditor);
