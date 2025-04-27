"use client";

import { Fragment, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Upload, X, FileText, AlertCircle } from "lucide-react";
import { useUpload, UploadError } from "@/hooks/useUpload";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FileWithPreview extends File {
    preview: string;
}

interface ImageUploaderProps {
    required?: boolean;
    maxFiles?: number;
    maxSize?: number;
    onImageUploaded?: (url: string) => void;
    onImagesUploaded?: (urls: string[]) => void;
}

const ImageUploader = ({
    required = true,
    maxFiles = 5,
    maxSize = 5000000, // 5MB
    onImageUploaded,
    onImagesUploaded,
}: ImageUploaderProps) => {
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const { toast } = useToast();
    const { loading, error, uploadImage, uploadMultipleImages, resetUpload } = useUpload();

    const { getRootProps, getInputProps } = useDropzone({
        maxFiles,
        maxSize,
        accept: {
            "image/*": [".png", ".jpg", ".jpeg", ".gif"],
        },
        onDrop: (acceptedFiles) => {
            resetUpload();
            const newFiles = acceptedFiles.map((file) =>
                Object.assign(file, {
                    preview: URL.createObjectURL(file),
                })
            );

            const updatedFiles = [...files, ...newFiles].slice(0, maxFiles);
            setFiles(updatedFiles);
        },
        onDropRejected: () => {
            toast({
                variant: "destructive",
                title: "Error",
                description: `You can only upload up to ${maxFiles} images. Each image must be under ${
                    maxSize / 1000000
                }MB`,
            });
        },
    });

    const renderFilePreview = (file: FileWithPreview) => {
        if (file.type.startsWith("image")) {
            return (
                <Image
                    width={48}
                    height={48}
                    alt={file.name}
                    src={file.preview}
                    className="rounded border p-0.5 object-cover"
                    unoptimized={true}
                />
            );
        } else {
            return <FileText className="w-12 h-12" />;
        }
    };

    const handleRemoveFile = (file: FileWithPreview) => {
        const filtered = files.filter((i) => i.name !== file.name);
        setFiles([...filtered]);
        resetUpload();
    };

    const handleRemoveAllFiles = () => {
        setFiles([]);
        resetUpload();
    };

    const handleUploadSingle = async () => {
        if (files.length === 0 && required) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Image field is required. Please select at least one file to upload.",
            });
            return;
        }

        try {
            const file = files.length > 0 ? files[0] : null;
            const imageUrl = await uploadImage(
                file,
                (url) => {
                    toast({
                        title: "Success",
                        description: "Image uploaded successfully",
                    });
                    console.log("Uploaded image URL:", url);
                    onImageUploaded?.(url);
                },
                (error) => {
                    toast({
                        variant: "destructive",
                        title: "Upload Failed",
                        description: error.message || "Failed to upload image. Please try again.",
                    });
                }
            );
        } catch (error) {
            console.error("Error in upload handler:", error);
        }
    };

    const handleUploadMultiple = async () => {
        if (files.length === 0 && required) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Image field is required. Please select at least one file to upload.",
            });
            return;
        }

        try {
            const imageUrls = await uploadMultipleImages(
                files.length > 0 ? files : null,
                (urls) => {
                    toast({
                        title: "Success",
                        description: `${urls.length} images uploaded successfully`,
                    });
                    console.log("Uploaded image URLs:", urls);
                    onImagesUploaded?.(urls);
                },
                (error) => {
                    toast({
                        variant: "destructive",
                        title: "Upload Failed",
                        description: error.message || "Failed to upload images. Please try again.",
                    });
                }
            );
        } catch (error) {
            console.error("Error in upload handler:", error);
        }
    };

    const fileList = files.map((file) => (
        <div
            key={file.name}
            className="flex items-center justify-between py-2 border-b last:border-b-0"
        >
            <div className="flex items-center gap-2">
                {renderFilePreview(file)}
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-card-foreground">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(2)} KB
                    </span>
                </div>
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleRemoveFile(file)}
            >
                <X className="h-4 w-4" />
            </Button>
        </div>
    ));

    return (
        <Fragment>
            {required && (
                <div className="mb-1 text-sm font-medium flex items-center">
                    <span className="text-destructive mr-1">*</span> Image is required
                </div>
            )}

            <div {...getRootProps({ className: "dropzone" })}>
                <input {...getInputProps()} />
                <div
                    className={`w-full text-center border-dashed border rounded-md py-6 flex items-center flex-col ${
                        required && files.length === 0 && error?.isRequiredError
                            ? "border-destructive"
                            : ""
                    }`}
                >
                    <div className="h-12 w-12 inline-flex rounded-md bg-muted items-center justify-center mb-3">
                        <Upload className="h-6 w-6 text-default-500" />
                    </div>
                    <h4 className="text-base font-medium mb-1 text-card-foreground/80">
                        Drop images here or click to upload
                    </h4>
                    <div className="text-xs text-muted-foreground">
                        (Maximum {maxFiles} images, {maxSize / 1000000}MB per image)
                    </div>
                </div>
            </div>

            {error && (
                <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error.message}</AlertDescription>
                </Alert>
            )}

            {files.length > 0 && (
                <Fragment>
                    <div className="mt-4">{fileList}</div>
                    <div className="flex justify-end gap-2 mt-2">
                        {files.length > 1 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRemoveAllFiles}
                                className="text-xs"
                            >
                                Remove All
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleUploadSingle}
                            disabled={loading}
                            className="text-xs"
                        >
                            {loading ? "Uploading..." : "Upload Single"}
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleUploadMultiple}
                            disabled={loading}
                            className="text-xs"
                        >
                            {loading ? "Uploading..." : "Upload All"}
                        </Button>
                    </div>
                </Fragment>
            )}
        </Fragment>
    );
};

export default ImageUploader;
