"use client";

import { useState } from "react";
import ClientSideCustomEditor from "@/components/ui/CKEditor/CKEditor5/ClientSideCustomEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CKEditor5TestPage() {
    const [content, setContent] = useState("<p>Test content in CKEditor 5</p>");
    const [displayContent, setDisplayContent] = useState("");

    const handleEditorChange = (newContent: string) => {
        setContent(newContent);
    };

    const handleShowContent = () => {
        setDisplayContent(content);
    };

    return (
        <div className="container mx-auto p-6">
            <Card>
                <CardHeader>
                    <CardTitle>CKEditor 5 Test</CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                        Note: Font features (font family, size, color, background color) require a
                        custom CKEditor build. See the README in components/ui/CKEditor/CKEditor5
                        for details.
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="mb-6">
                        <ClientSideCustomEditor
                            initialData={content}
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
