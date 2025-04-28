"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    BasicDialog,
    BasicDialogContent,
    BasicDialogHeader,
    BasicDialogTitle,
    BasicDialogTrigger,
} from "@/components/ui/basic-dialog";
import ClientSideCustomEditor from "./ClientSideCustomEditor";

export default function TestTinyMCEFullscreen() {
    const [content, setContent] = useState("<p>Test content for TinyMCE editor</p>");
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleEditorChange = (newContent: string) => {
        setContent(newContent);
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">TinyMCE Fullscreen Test</h2>
            
            <BasicDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <BasicDialogTrigger asChild>
                    <Button>Open Editor in Dialog</Button>
                </BasicDialogTrigger>
                <BasicDialogContent size="5xl">
                    <BasicDialogHeader>
                        <BasicDialogTitle>TinyMCE Editor Test</BasicDialogTitle>
                    </BasicDialogHeader>
                    <div className="py-4">
                        <p className="mb-2">
                            Click the fullscreen button in the editor toolbar to test fullscreen mode.
                        </p>
                        <ClientSideCustomEditor
                            initialValue={content}
                            onChange={handleEditorChange}
                            height="400px"
                        />
                    </div>
                </BasicDialogContent>
            </BasicDialog>
        </div>
    );
}
