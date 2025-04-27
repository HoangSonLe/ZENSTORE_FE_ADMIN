"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageUploader from "@/components/file-uploader/image-uploader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export default function ImageUploadPage() {
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
    const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

    return (
        <div className="container mx-auto py-10">
            <Alert className="mb-6">
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Image Upload API</AlertTitle>
                <AlertDescription>
                    This example demonstrates how to use the image upload API with validation for
                    required fields.
                </AlertDescription>
            </Alert>

            <Tabs defaultValue="required">
                <TabsList className="mb-4">
                    <TabsTrigger value="required">Required Image</TabsTrigger>
                    <TabsTrigger value="optional">Optional Image</TabsTrigger>
                </TabsList>

                <TabsContent value="required">
                    <Card>
                        <CardHeader>
                            <CardTitle>Required Image Upload</CardTitle>
                            <CardDescription>
                                The image field is required. You must select at least one image to
                                upload.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ImageUploader
                                required={true}
                                onImageUploaded={(url) => setUploadedUrl(url)}
                                onImagesUploaded={(urls) => setUploadedUrls(urls)}
                            />

                            {uploadedUrl && (
                                <div className="mt-6">
                                    <h3 className="text-lg font-medium mb-2">Uploaded Image:</h3>
                                    <img
                                        src={uploadedUrl}
                                        alt="Uploaded"
                                        className="max-w-full h-auto max-h-64 rounded-md border"
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="optional">
                    <Card>
                        <CardHeader>
                            <CardTitle>Optional Image Upload</CardTitle>
                            <CardDescription>
                                The image field is optional. You can upload an image or proceed
                                without one.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ImageUploader
                                required={false}
                                onImageUploaded={(url) => setUploadedUrl(url)}
                                onImagesUploaded={(urls) => setUploadedUrls(urls)}
                            />

                            {uploadedUrls.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-lg font-medium mb-2">Uploaded Images:</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {uploadedUrls.map((url, index) => (
                                            <img
                                                key={index}
                                                src={url}
                                                alt={`Uploaded ${index + 1}`}
                                                className="max-w-full h-auto max-h-48 rounded-md border"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
