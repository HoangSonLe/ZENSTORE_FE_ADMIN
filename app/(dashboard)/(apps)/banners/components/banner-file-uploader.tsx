"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface FileWithPreview extends File {
    preview: string;
}

interface BannerFileUploaderProps {
    initialImage?: string;
    onImageChange: (image: File | null) => void;
    label?: string;
}

export default function BannerFileUploader({
    initialImage,
    onImageChange,
    label = "Ảnh banner",
}: BannerFileUploaderProps) {
    const [image, setImage] = useState<FileWithPreview | null>(null);
    const [existingImage, setExistingImage] = useState<string | undefined>(initialImage);

    // Initialize with existing image
    useEffect(() => {
        setExistingImage(initialImage);
    }, [initialImage]);

    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        
        // Only process image files
        if (!file.type.startsWith("image/")) {
            alert("Vui lòng chọn file ảnh.");
            return;
        }

        // Create a preview URL for the file
        const fileWithPreview = Object.assign(file, {
            preview: URL.createObjectURL(file),
        }) as FileWithPreview;

        // Update state with new file
        setImage(fileWithPreview);
        setExistingImage(undefined);

        // Call the callback with the file
        onImageChange(file);

        // Reset the input value to allow selecting the same file again
        e.target.value = "";
    };

    // Remove the selected file
    const removeFile = () => {
        if (image) {
            // Revoke the object URL to avoid memory leaks
            URL.revokeObjectURL(image.preview);
        }
        
        setImage(null);
        
        // Call the callback with null to indicate removal
        onImageChange(null);
    };

    // Remove the existing image
    const removeExistingImage = () => {
        setExistingImage(undefined);
        
        // Call the callback with null to indicate removal
        onImageChange(null);
    };

    // Clean up object URL when component unmounts
    useEffect(() => {
        return () => {
            if (image) {
                URL.revokeObjectURL(image.preview);
            }
        };
    }, [image]);

    return (
        <div className="space-y-4">
            <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">{label}</label>
                <div className="flex flex-wrap gap-4">
                    {/* Display existing image */}
                    {existingImage && (
                        <div className="relative h-40 w-full max-w-md rounded-md overflow-hidden border">
                            <Image
                                src={existingImage}
                                alt="Existing banner image"
                                fill
                                className="object-cover"
                            />
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 h-8 w-8 rounded-full"
                                onClick={removeExistingImage}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}

                    {/* Display newly added image */}
                    {image && !existingImage && (
                        <div className="relative h-40 w-full max-w-md rounded-md overflow-hidden border">
                            <Image
                                src={image.preview}
                                alt="New banner image"
                                fill
                                className="object-cover"
                            />
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 h-8 w-8 rounded-full"
                                onClick={removeFile}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}

                    {/* Upload button */}
                    {!image && !existingImage && (
                        <label
                            htmlFor="banner-image-upload"
                            className="flex items-center justify-center h-40 w-full max-w-md rounded-md border-2 border-dashed cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex flex-col items-center space-y-2">
                                <Upload className="h-8 w-8 text-gray-400" />
                                <span className="text-sm text-gray-500">Tải ảnh lên</span>
                                <span className="text-xs text-gray-400">
                                    Định dạng: JPG, PNG, GIF
                                </span>
                            </div>
                            <input
                                id="banner-image-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </label>
                    )}

                    {/* Upload new button when an image already exists */}
                    {(image || existingImage) && (
                        <label
                            htmlFor="banner-image-upload"
                            className="flex items-center justify-center h-10 px-4 rounded-md border border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center space-x-2">
                                <Upload className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-500">Thay đổi ảnh</span>
                            </div>
                            <input
                                id="banner-image-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </label>
                    )}
                </div>
            </div>
        </div>
    );
}
