"use client";

import { useState } from "react";
import ClientSideCustomEditor from "@/components/ui/TinyMCE/ClientSideCustomEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TinyMCEFullscreenTestPageV2() {
    const [content, setContent] = useState("<p>Test the <strong>fullscreen</strong> functionality by clicking the fullscreen button in the toolbar.</p><p>After entering fullscreen mode, you should be able to edit the content.</p><p>After exiting fullscreen mode, the editor should still be visible and your changes should be preserved.</p>");
    const [displayContent, setDisplayContent] = useState("");

    const handleEditorChange = (newContent: string) => {
        setContent(newContent);
        console.log("Content changed:", newContent.substring(0, 50));
    };

    const handleShowContent = () => {
        setDisplayContent(content);
    };

    return (
        <div className="container mx-auto p-6">
            <Card>
                <CardHeader>
                    <CardTitle>TinyMCE Fullscreen Test V2</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="mb-6">
                        <ClientSideCustomEditor
                            initialValue={content}
                            onChange={handleEditorChange}
                            height="300px"
                        />
                    </div>

                    <Button onClick={handleShowContent} className="mb-4">
                        Show Content
                    </Button>

                    {displayContent && (
                        <div className="mt-4 p-4 border rounded">
                            <h3 className="text-lg font-medium mb-2">Editor Content:</h3>
                            <div dangerouslySetInnerHTML={{ __html: displayContent }} />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
