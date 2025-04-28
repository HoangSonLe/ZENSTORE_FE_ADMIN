"use client";

import bannerApi from "@/apis/banner/banner.api";
import { IBannerCreateOrUpdate } from "@/apis/banner/banner.interface";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BasicDialogFooter as DialogFooter } from "@/components/ui/basic-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { EBannerOrder } from "@/constants/enum";
import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import BannerFileUploader from "./banner-file-uploader";

interface FileWithPreview extends File {
    preview: string;
}

export interface BannerDetailProps {
    bannerId?: number;
    initialData?: IBannerCreateOrUpdate;
    onClose: () => void;
    onSubmit: (bannerData: IBannerCreateOrUpdate) => Promise<void>;
    submitButtonText: string;
    loadingText: string;
}

export default function BannerDetail({
    bannerId,
    initialData = {
        bannerId: 0,
        bannerTitle: "",
        bannerSubTitle: "",
        bannerCode: "",
        bannerName: "",
        bannerTypeCode: EBannerOrder.ROW_1,
        bannerTypeName: "Hàng 1",
        bannerImage: "",
        uploadFile: "",
    },
    onClose,
    onSubmit,
    submitButtonText,
    loadingText,
}: BannerDetailProps) {
    const [formData, setFormData] = useState<IBannerCreateOrUpdate>(initialData);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingBanner, setIsLoadingBanner] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showValidationError, setShowValidationError] = useState(false);

    // Fetch banner data by ID
    const fetchBannerData = async (id: number) => {
        setIsLoadingBanner(true);
        try {
            const response = await bannerApi.getBannerDetail({
                params: { bannerId: id },
            });

            if (response.isSuccess && response.data) {
                // Update form data with fetched banner
                setFormData({
                    ...response.data,
                });
            } else {
                toast.error("Không thể tải thông tin banner");
            }
        } catch (error) {
            console.error("Error fetching banner data:", error);
            toast.error("Lỗi khi tải thông tin banner");
        } finally {
            setIsLoadingBanner(false);
        }
    };

    // Load banner data if ID is provided
    useEffect(() => {
        if (bannerId && bannerId > 0) {
            fetchBannerData(bannerId);
        }
    }, [bannerId]);

    // Handle text input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle switch toggle for state
    const handleStateChange = (checked: boolean) => {
        setFormData((prev) => ({
            ...prev,
            state: checked,
        }));
    };

    // Handle banner type selection
    const handleBannerTypeChange = (value: string) => {
        const bannerTypeCode = value as EBannerOrder;
        let bannerTypeName = "";

        // Map banner type code to name
        switch (bannerTypeCode) {
            case EBannerOrder.ROW_1:
                bannerTypeName = "Hàng 1";
                break;
            case EBannerOrder.ROW_2:
                bannerTypeName = "Hàng 2";
                break;
            case EBannerOrder.ROW_3:
                bannerTypeName = "Hàng 3";
                break;
            case EBannerOrder.ROW_4:
                bannerTypeName = "Hàng 4";
                break;
            case EBannerOrder.ROW_5:
                bannerTypeName = "Hàng 5";
                break;
            default:
                bannerTypeName = "Hàng 1";
        }

        setFormData((prev) => ({
            ...prev,
            bannerTypeCode,
            bannerTypeName,
        }));
    };

    // Handle image changes
    const handleImagesChange = (files: File[]) => {
        // If files array is empty, it means the existing image was removed
        if (files.length === 0) {
            setFormData((prev) => ({
                ...prev,
                bannerImage: "", // Clear the existing image
                uploadFile: "", // Clear any upload in progress
            }));
            return;
        }

        // Convert file to base64 for API submission
        if (files.length > 0) {
            const processFile = async () => {
                const file = files[0]; // Only use the first file since we only need one image
                const base64 = await convertFileToBase64(file);

                setFormData((prev) => ({
                    ...prev,
                    bannerImage: "", // Clear the existing image when uploading a new one
                    uploadFile: base64,
                }));
            };

            processFile();
        }
    };

    // Convert file to base64
    const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    // Validate form data
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.bannerName.trim()) {
            newErrors.bannerName = "Tên banner không được để trống";
        }

        if (!formData.bannerTitle.trim()) {
            newErrors.bannerTitle = "Tiêu đề banner không được để trống";
        }

        if (!formData.bannerTypeCode) {
            newErrors.bannerTypeCode = "Vị trí banner không được để trống";
        }

        // Check if there's an image - either existing or new upload
        if (
            (!formData.bannerImage || formData.bannerImage.trim() === "") &&
            (!formData.uploadFile || formData.uploadFile.trim() === "")
        ) {
            newErrors.uploadFile = "Vui lòng tải lên ảnh banner";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form
        if (!validateForm()) {
            setShowValidationError(true);
            return;
        }

        setIsLoading(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error("Error submitting banner:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoadingBanner) {
        return (
            <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Đang tải thông tin banner...</span>
            </div>
        );
    }

    return (
        <ScrollArea className="max-h-[calc(90vh-120px)]">
            <form onSubmit={handleSubmit} className="space-y-6 p-1">
                {showValidationError && Object.keys(errors).length > 0 && (
                    <Alert>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <AlertDescription className="text-red-500">
                            Vui lòng kiểm tra lại thông tin banner
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Banner Name */}
                    <div className="grid gap-2">
                        <Label htmlFor="bannerName" className="flex items-center">
                            Tên banner <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                            id="bannerName"
                            name="bannerName"
                            value={formData.bannerName}
                            onChange={handleInputChange}
                            className={errors.bannerName ? "border-red-500" : ""}
                        />
                        {errors.bannerName && (
                            <p className="text-red-500 text-sm">{errors.bannerName}</p>
                        )}
                    </div>

                    {/* Banner Title */}
                    <div className="grid gap-2">
                        <Label htmlFor="bannerTitle" className="flex items-center">
                            Tiêu đề banner <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                            id="bannerTitle"
                            name="bannerTitle"
                            value={formData.bannerTitle}
                            onChange={handleInputChange}
                            className={errors.bannerTitle ? "border-red-500" : ""}
                        />
                        {errors.bannerTitle && (
                            <p className="text-red-500 text-sm">{errors.bannerTitle}</p>
                        )}
                    </div>

                    {/* Banner Subtitle */}
                    <div className="grid gap-2">
                        <Label htmlFor="bannerSubTitle">Tiêu đề phụ</Label>
                        <Input
                            id="bannerSubTitle"
                            name="bannerSubTitle"
                            value={formData.bannerSubTitle || ""}
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Banner Type */}
                    <div className="grid gap-2">
                        <Label htmlFor="bannerTypeCode" className="flex items-center">
                            Vị trí banner <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Select
                            value={formData.bannerTypeCode}
                            onValueChange={handleBannerTypeChange}
                            disabled
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn vị trí banner" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={EBannerOrder.ROW_1}>Hàng 1</SelectItem>
                                <SelectItem value={EBannerOrder.ROW_2}>Hàng 2</SelectItem>
                                <SelectItem value={EBannerOrder.ROW_3}>Hàng 3</SelectItem>
                                <SelectItem value={EBannerOrder.ROW_4}>Hàng 4</SelectItem>
                                <SelectItem value={EBannerOrder.ROW_5}>Hàng 5</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Banner Images */}
                <div className="grid gap-2">
                    <BannerFileUploader
                        initialImages={
                            formData.bannerImage && formData.bannerImage.trim() !== ""
                                ? [formData.bannerImage]
                                : []
                        }
                        onImagesChange={handleImagesChange}
                        maxFiles={1}
                        label="Ảnh banner"
                    />
                    {errors.uploadFile && (
                        <p className="text-red-500 text-sm">{errors.uploadFile}</p>
                    )}
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose}>
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
        </ScrollArea>
    );
}
