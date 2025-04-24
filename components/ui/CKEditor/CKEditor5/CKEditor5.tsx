// components/custom-editor.js
"use client"; // Required only in App Router.

import { CKEditor, useCKEditorCloud } from "@ckeditor/ckeditor5-react";
import "ckeditor5/ckeditor5.css";
import { useEffect, useMemo, useRef, useState } from "react";
import "../CKEditor5/CKEditor5.css";
const LICENSE_KEY =
    "eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3NDY3NDg3OTksImp0aSI6ImQ0Njk0ZWIyLTFlYmUtNDBhNS05MTA3LWVhNjUyNWZjMGViOCIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiLCJzaCJdLCJ3aGl0ZUxhYmVsIjp0cnVlLCJsaWNlbnNlVHlwZSI6InRyaWFsIiwiZmVhdHVyZXMiOlsiKiJdLCJ2YyI6ImFjYWI5NjUwIn0.7-Kr4W7Bd550Y1z5jRiLRGPwJDEq1RuT6CHNPjAC4depGugD4J04PsMP01fcOL48fJxAEkwDC6_vXVcKZ9rmZw";

export interface CustomEditorProps {
    initialData?: string;
    onChange?: (data: string) => void;
    height?: string;
}

function CustomEditor({ initialData, onChange, height }: CustomEditorProps) {
    const editorContainerRef = useRef(null);
    const editorRef = useRef(null);
    const editorWordCountRef = useRef(null);
    const [isLayoutReady, setIsLayoutReady] = useState(false);
    const cloud = useCKEditorCloud({ version: "45.0.0", translations: ["vi"] });

    useEffect(() => {
        setIsLayoutReady(true);

        return () => setIsLayoutReady(false);
    }, []);

    const { ClassicEditor, editorConfig } = useMemo(() => {
        if (cloud.status !== "success" || !isLayoutReady) {
            return {};
        }

        const {
            ClassicEditor,
            Alignment,
            Autosave,
            BlockQuote,
            Bold,
            CloudServices,
            Code,
            Essentials,
            FontBackgroundColor,
            FontColor,
            FontFamily,
            FontSize,
            GeneralHtmlSupport,
            Heading,
            Highlight,
            ImageBlock,
            ImageInline,
            ImageResize,
            ImageStyle,
            ImageToolbar,
            ImageUpload,
            Indent,
            IndentBlock,
            Italic,
            Link,
            List,
            MediaEmbed,
            PageBreak,
            Paragraph,
            RemoveFormat,
            SourceEditing,
            Strikethrough,
            Style,
            Subscript,
            Superscript,
            Table,
            TableCaption,
            TableCellProperties,
            TableColumnResize,
            TableProperties,
            TableToolbar,
            TextTransformation,
            TodoList,
            Underline,
            WordCount,
        } = cloud.CKEditor;

        return {
            ClassicEditor,
            editorConfig: {
                toolbar: {
                    items: [
                        "sourceEditing",
                        "|",
                        "heading",
                        "style",
                        "|",
                        "fontSize",
                        "fontFamily",
                        "fontColor",
                        "fontBackgroundColor",
                        "|",
                        "bold",
                        "italic",
                        "underline",
                        "strikethrough",
                        "subscript",
                        "superscript",
                        "code",
                        "removeFormat",
                        "|",
                        "pageBreak",
                        "link",
                        "uploadImage",
                        "mediaEmbed",
                        "insertTable",
                        "highlight",
                        "blockQuote",
                        "|",
                        "alignment",
                        "|",
                        "bulletedList",
                        "numberedList",
                        "todoList",
                        "outdent",
                        "indent",
                    ],
                    shouldNotGroupWhenFull: false,
                },
                plugins: [
                    Alignment,
                    Autosave,
                    BlockQuote,
                    Bold,
                    CloudServices,
                    Code,
                    Essentials,
                    FontBackgroundColor,
                    FontColor,
                    FontFamily,
                    FontSize,
                    GeneralHtmlSupport,
                    Heading,
                    Highlight,
                    ImageBlock,
                    ImageInline,
                    ImageResize,
                    ImageStyle,
                    ImageToolbar,
                    ImageUpload,
                    Indent,
                    IndentBlock,
                    Italic,
                    Link,
                    List,
                    MediaEmbed,
                    PageBreak,
                    Paragraph,
                    RemoveFormat,
                    SourceEditing,
                    Strikethrough,
                    Style,
                    Subscript,
                    Superscript,
                    Table,
                    TableCaption,
                    TableCellProperties,
                    TableColumnResize,
                    TableProperties,
                    TableToolbar,
                    TextTransformation,
                    TodoList,
                    Underline,
                    WordCount,
                ],
                fontFamily: {
                    supportAllValues: true,
                },
                fontSize: {
                    options: [10, 12, 14, "default", 18, 20, 22],
                    supportAllValues: true,
                },
                heading: {
                    options: [
                        {
                            model: "paragraph",
                            title: "Paragraph",
                            class: "ck-heading_paragraph",
                        },
                        {
                            model: "heading1",
                            view: "h1",
                            title: "Heading 1",
                            class: "ck-heading_heading1",
                        },
                        {
                            model: "heading2",
                            view: "h2",
                            title: "Heading 2",
                            class: "ck-heading_heading2",
                        },
                        {
                            model: "heading3",
                            view: "h3",
                            title: "Heading 3",
                            class: "ck-heading_heading3",
                        },
                        {
                            model: "heading4",
                            view: "h4",
                            title: "Heading 4",
                            class: "ck-heading_heading4",
                        },
                        {
                            model: "heading5",
                            view: "h5",
                            title: "Heading 5",
                            class: "ck-heading_heading5",
                        },
                        {
                            model: "heading6",
                            view: "h6",
                            title: "Heading 6",
                            class: "ck-heading_heading6",
                        },
                    ],
                },
                htmlSupport: {
                    allow: [
                        {
                            name: /^.*$/,
                            styles: true,
                            attributes: true,
                            classes: true,
                        },
                    ],
                },
                image: {
                    toolbar: [
                        "imageTextAlternative",
                        "|",
                        "imageStyle:inline",
                        "imageStyle:wrapText",
                        "imageStyle:breakText",
                        "|",
                        "resizeImage",
                    ],
                },
                initialData: initialData || "<p>Type or paste your content here!</p>",
                language: "vi",
                licenseKey: LICENSE_KEY,
                link: {
                    addTargetToExternalLinks: true,
                    defaultProtocol: "https://",
                    decorators: {
                        toggleDownloadable: {
                            mode: "manual",
                            label: "Downloadable",
                            attributes: {
                                download: "file",
                            },
                        },
                    },
                },
                placeholder: "Type or paste your content here!",
                style: {
                    definitions: [
                        {
                            name: "Article category",
                            element: "h3",
                            classes: ["category"],
                        },
                        {
                            name: "Title",
                            element: "h2",
                            classes: ["document-title"],
                        },
                        {
                            name: "Subtitle",
                            element: "h3",
                            classes: ["document-subtitle"],
                        },
                        {
                            name: "Info box",
                            element: "p",
                            classes: ["info-box"],
                        },
                        {
                            name: "CTA Link Primary",
                            element: "a",
                            classes: ["button", "button--green"],
                        },
                        {
                            name: "CTA Link Secondary",
                            element: "a",
                            classes: ["button", "button--black"],
                        },
                        {
                            name: "Marker",
                            element: "span",
                            classes: ["marker"],
                        },
                        {
                            name: "Spoiler",
                            element: "span",
                            classes: ["spoiler"],
                        },
                    ],
                },
                table: {
                    contentToolbar: [
                        "tableColumn",
                        "tableRow",
                        "mergeTableCells",
                        "tableProperties",
                        "tableCellProperties",
                    ],
                },
            },
        };
    }, [cloud, isLayoutReady]);

    return (
        <div
            className="editor-container editor-container_classic-editor editor-container_include-style editor-container_include-word-count"
            ref={editorContainerRef}
            style={{ height: height }}
        >
            <div
                className="editor-container__editor"
                style={{ height: height ? `calc(${height} - 20px)` : "auto" }}
            >
                <div ref={editorRef}>
                    {ClassicEditor && editorConfig && (
                        <CKEditor
                            onReady={(editor) => {
                                const wordCount = editor.plugins.get("WordCount");
                                if (editorWordCountRef.current) {
                                    (editorWordCountRef.current as any).appendChild(
                                        wordCount.wordCountContainer
                                    );
                                }
                            }}
                            onAfterDestroy={() => {
                                if (editorWordCountRef.current) {
                                    Array.from(
                                        (editorWordCountRef.current as any).children
                                    ).forEach((child) => (child as any).remove());
                                }
                            }}
                            onChange={(_, editor) => {
                                if (onChange) {
                                    const data = editor.getData();
                                    onChange(data);
                                }
                            }}
                            editor={ClassicEditor}
                            config={editorConfig as any}
                        />
                    )}
                </div>
            </div>
            <div className="editor_container__word-count" ref={editorWordCountRef}></div>
        </div>
    );
}

export default CustomEditor;
