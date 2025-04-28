"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface FileWithPreview extends File {
    preview: string;
}

interface BannerFileUploaderProps {
    initialImages?: string[];
    onImagesChange: (images: File[]) => void;
    maxFiles?: number;
    label?: string;
}

export default function BannerFileUploader({
    initialImages = [],
    onImagesChange,
    maxFiles = 1,
    label = "Ảnh banner",
}: BannerFileUploaderProps) {
    const [images, setImages] = useState<FileWithPreview[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>(initialImages || []);

    // Initialize with existing images
    useEffect(() => {
        // Filter out any invalid URLs
        const validImages = (initialImages || []).filter((url) => {
            try {
                // Check if URL is valid by attempting to construct a URL object
                new URL(url);
                return true;
            } catch (error) {
                console.warn("Invalid image URL filtered out:", url);
                return false;
            }
        });
        setExistingImages(validImages);
    }, [initialImages]);

    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newFiles: FileWithPreview[] = [];
        const actualFiles: File[] = [];

        // Check if adding new files would exceed the limit
        if (existingImages.length + images.length + files.length > maxFiles) {
            alert(`Bạn chỉ có thể tải lên tối đa ${maxFiles} ảnh.`);
            return;
        }

        // Process each selected file
        Array.from(files).forEach((file) => {
            // Only process image files
            if (!file.type.startsWith("image/")) return;

            // Create a preview URL for the file
            const fileWithPreview = Object.assign(file, {
                preview: URL.createObjectURL(file),
            }) as FileWithPreview;

            newFiles.push(fileWithPreview);
            actualFiles.push(file);
        });

        // Update state with new files
        setImages((prevImages) => [...prevImages, ...newFiles]);

        // Call the callback with all files
        onImagesChange([...actualFiles]);

        // Reset the input value to allow selecting the same file again
        e.target.value = "";
    };

    // Remove a file from the list
    const removeFile = (index: number) => {
        setImages((prevImages) => {
            const updatedImages = [...prevImages];
            // Revoke the object URL to avoid memory leaks
            URL.revokeObjectURL(updatedImages[index].preview);
            updatedImages.splice(index, 1);

            // Call the callback with the updated files
            onImagesChange(updatedImages);

            return updatedImages;
        });
    };

    // Remove an existing image
    const removeExistingImage = (index: number) => {
        setExistingImages((prevImages) => {
            const updatedImages = [...prevImages];
            updatedImages.splice(index, 1);
            return updatedImages;
        });

        // Notify parent component that existing image has been removed
        // Pass an empty array to indicate removal of existing image
        onImagesChange([]);
    };

    // Clean up object URLs when component unmounts
    useEffect(() => {
        return () => {
            images.forEach((image) => URL.revokeObjectURL(image.preview));
        };
    }, [images]);

    return (
        <div className="space-y-4">
            <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">{label}</label>
                <div className="flex flex-wrap gap-4">
                    {/* Display existing images */}
                    {existingImages.map((imageUrl, index) => (
                        <div
                            key={`existing-${index}`}
                            className="relative h-24 w-24 rounded-md overflow-hidden border"
                        >
                            {(() => {
                                try {
                                    // Validate URL before rendering Image component
                                    new URL(imageUrl);
                                    return (
                                        <Image
                                            src={imageUrl}
                                            alt={`Existing image ${index + 1}`}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    );
                                } catch (error) {
                                    // Fallback for invalid URLs
                                    return (
                                        <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400">
                                            <span>Invalid Image</span>
                                        </div>
                                    );
                                }
                            })()}
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 hover:bg-red-600"
                                onClick={() => removeExistingImage(index)}
                            >
                                <X className="h-4 w-4 text-white" />
                            </Button>
                        </div>
                    ))}

                    {/* Display newly added images */}
                    {images.map((image, index) => (
                        <div
                            key={`new-${index}`}
                            className="relative h-24 w-24 rounded-md overflow-hidden border"
                        >
                            {(() => {
                                try {
                                    // Validate URL before rendering Image component
                                    new URL(image.preview);
                                    return (
                                        <Image
                                            src={image.preview}
                                            alt={`New image ${index + 1}`}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    );
                                } catch (error) {
                                    // Fallback for invalid URLs
                                    return (
                                        <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400">
                                            <span>Invalid Image</span>
                                        </div>
                                    );
                                }
                            })()}
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 hover:bg-red-600"
                                onClick={() => removeFile(index)}
                            >
                                <X className="h-4 w-4 text-white" />
                            </Button>
                        </div>
                    ))}

                    {/* Upload button */}
                    {existingImages.length + images.length < maxFiles && (
                        <label
                            htmlFor="image-upload"
                            className="flex items-center justify-center h-24 w-24 rounded-md border-2 border-dashed cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex flex-col items-center space-y-2">
                                <Upload className="h-6 w-6 text-gray-400" />
                                <span className="text-xs text-gray-500">Tải ảnh lên</span>
                            </div>
                            <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </label>
                    )}
                </div>
                <p className="text-xs text-gray-500">
                    Tối đa {maxFiles} ảnh. Định dạng: JPG, PNG, GIF.
                </p>
            </div>
        </div>
    );
}
