"use client";

import { useState, useEffect } from "react";
import { IBanner, IBannerBody } from "@/apis/banner/banner.interface";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BasicDialogFooter as DialogFooter } from "@/components/ui/basic-dialog";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import BannerFileUploader from "./banner-file-uploader";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FileWithPreview extends File {
    preview: string;
}

export interface BannerDetailProps {
    banner: IBanner;
    onClose: () => void;
    onSubmit: (bannerData: IBannerBody) => Promise<void>;
    submitButtonText: string;
    loadingText: string;
}

export default function BannerDetail({
    banner,
    onClose,
    onSubmit,
    submitButtonText,
    loadingText,
}: BannerDetailProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Handle image changes
    const handleImageChange = (file: File | null) => {
        setSelectedFile(file);
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // If no file is selected and no error is shown, close the dialog
        if (!selectedFile && !error) {
            toast.info("Không có thay đổi nào được thực hiện");
            onClose();
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            let bannerImage = "";

            if (selectedFile) {
                // Convert file to base64
                bannerImage = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const base64String = reader.result as string;
                        resolve(base64String);
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(selectedFile);
                });
            }

            // Create banner data object
            const bannerData: IBannerBody = {
                bannerId: banner.bannerId,
                bannerImage: bannerImage,
            };

            // Submit the data
            await onSubmit(bannerData);
            onClose();
        } catch (error) {
            console.error("Error submitting banner:", error);
            setError("Lỗi khi cập nhật banner. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Banner Information (Read-only) */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>ID</Label>
                    <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                        {banner.bannerId}
                    </div>
                </div>
                <div>
                    <Label>Mã banner</Label>
                    <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                        {banner.bannerCode}
                    </div>
                </div>
                <div>
                    <Label>Tên banner</Label>
                    <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                        {banner.bannerName}
                    </div>
                </div>
                <div>
                    <Label>Vị trí</Label>
                    <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                        {banner.bannerTypeName} ({banner.bannerTypeCode})
                    </div>
                </div>
                <div className="col-span-2">
                    <Label>Tiêu đề</Label>
                    <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                        {banner.bannerTitle}
                    </div>
                </div>
                <div className="col-span-2">
                    <Label>Mô tả</Label>
                    <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                        {banner.bannerSubTitle || "Không có mô tả"}
                    </div>
                </div>
            </div>

            {/* Banner Image */}
            <div className="grid gap-2">
                <BannerFileUploader
                    initialImage={banner.bannerImage}
                    onImageChange={handleImageChange}
                    label="Ảnh banner"
                />
            </div>

            {/* Form Actions */}
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                    Hủy
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {loadingText}
                        </>
                    ) : (
                        submitButtonText
                    )}
                </Button>
            </DialogFooter>
        </form>
    );
}
