"use client";

import { forwardRef, memo, useImperativeHandle, useRef, useEffect, useState } from "react";
import { Editor } from "@tinymce/tinymce-react";

// Define the methods you want to expose to the parent
export interface CKEditorRef {
    getContent: () => string;
}

interface CKEditorProps {
    initialValue?: string | undefined;
    morePlugins?: string[];
    height?: string;
    onChange: (content: string) => void;
}

const CKEditor = forwardRef<CKEditorRef, CKEditorProps>(
    ({ initialValue, height, morePlugins, onChange }, ref) => {
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

        const toolbar =
            "undo redo | blocks fontfamily fontsize | " +
            "bold italic underline strikethrough | " +
            "alignleft aligncenter alignright alignjustify | " +
            "bullist numlist outdent indent | " +
            "link image table media | " +
            "charmap emoticons code fullscreen preview | " +
            "anchor | removeformat | help";

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
            "fullscreen",
            "media",
            "emoticons",
            ...(morePlugins ?? []),
        ];

        // Return a placeholder until the component is mounted
        if (!isMounted) {
            return (
                <div
                    style={{ height: height ?? 500, border: "1px solid #ccc" }}
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
                        apiKey="qagffr3pkuv17a8on1afax661irst1hbr4e6tbv888sz91jc"
                        onInit={(_, editor) => {
                            editorRef.current = editor;
                        }}
                        initialValue={initialValue}
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
                            branding: false,
                            promotion: false,
                            file_picker_types: "file image media",
                            file_picker_callback: (cb, _, meta) => {
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
                        onEditorChange={onChange}
                    />
                )}
            </div>
        );
    }
);

export default memo(CKEditor);
