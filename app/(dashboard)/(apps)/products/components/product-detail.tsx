"use client";

import { useState, useEffect } from "react";
import { IProduct } from "@/apis/product/product.interface";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BasicDialogFooter as DialogFooter } from "@/components/ui/basic-dialog";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { EProductStatus } from "@/constants/enum";
import ClientSideCustomEditor from "@/components/ui/CKEditor/TinyMCE/ClientSideCustomEditor";
import ProductFileUploader from "./product-file-uploader";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FileWithPreview extends File {
    preview: string;
}

export interface ProductDetailProps {
    initialData?: Partial<IProduct>;
    onClose: () => void;
    onSubmit: (productData: Partial<IProduct>) => Promise<void>;
    submitButtonText: string;
    loadingText: string;
}

export default function ProductDetail({
    initialData = {
        productName: "",
        productPrice: 0,
        productPriceSale: 0,
        productStatusCode: "",
        productSpaceCode: "",
        productSeriesCode: "",
        productColorCode: "",
        productShortDetail: "",
        productDetail: "",
    },
    onClose,
    onSubmit,
    submitButtonText,
    loadingText,
}: ProductDetailProps) {
    const [formData, setFormData] = useState<Partial<IProduct>>(initialData);
    const [productImages, setProductImages] = useState<FileWithPreview[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showValidationError, setShowValidationError] = useState(false);

    // Load images from initialData if available
    useEffect(() => {
        if (initialData.listImage && initialData.listImage.length > 0) {
            const imageFiles = initialData.listImage.map((url, index) => {
                const fileName = url.split("/").pop() || `image-${index}.jpg`;
                return {
                    name: fileName,
                    size: 0,
                    type: "image/jpeg",
                    preview: url,
                } as FileWithPreview;
            });
            setProductImages(imageFiles);
        }
    }, [initialData.listImage]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name.includes("Price") ? Number(value) : value,
        }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleEditorChange = (name: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImagesChange = (files: FileWithPreview[]) => {
        setProductImages(files);

        // Convert images to base64 or URLs for API submission
        const imageUrls = files.map((file) => file.preview);
        setFormData((prev) => ({
            ...prev,
            listImage: imageUrls,
        }));
    };

    // Validate form data
    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        // Required fields validation
        if (!formData.productName?.trim()) {
            newErrors.productName = "Product name is required";
        }

        if (formData.productPrice === undefined || formData.productPrice < 0) {
            newErrors.productPrice = "Valid price is required";
        }

        if (!formData.productStatusCode) {
            newErrors.productStatusCode = "Status is required";
        }

        if (!formData.productSpaceCode) {
            newErrors.productSpaceCode = "Space is required";
        }

        if (!formData.productSeriesCode) {
            newErrors.productSeriesCode = "Series is required";
        }

        if (!formData.productColorCode) {
            newErrors.productColorCode = "Color is required";
        }

        if (!formData.productShortDetail?.trim()) {
            newErrors.productShortDetail = "Short description is required";
        }

        if (!formData.productDetail?.trim()) {
            newErrors.productDetail = "Full description is required";
        }

        // Validate product images
        if (!formData.listImage || formData.listImage.length === 0) {
            newErrors.listImage = "At least one product image is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form before submission
        if (!validateForm()) {
            setShowValidationError(true);
            return;
        }

        setIsLoading(true);

        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error("Error submitting product:", error);
            toast.error("Failed to save product");
        } finally {
            setIsLoading(false);
        }
    };

    // Data for dropdowns
    const spaceOptions = [
        { value: "LIVING", label: "Living Room" },
        { value: "BEDROOM", label: "Bedroom" },
        { value: "KITCHEN", label: "Kitchen" },
        { value: "BATHROOM", label: "Bathroom" },
    ];

    const seriesOptions = [
        { value: "MODERN", label: "Modern" },
        { value: "CLASSIC", label: "Classic" },
        { value: "VINTAGE", label: "Vintage" },
        { value: "MINIMALIST", label: "Minimalist" },
    ];

    const colorOptions = [
        { value: "BLACK", label: "Black" },
        { value: "WHITE", label: "White" },
        { value: "BROWN", label: "Brown" },
        { value: "GRAY", label: "Gray" },
    ];

    // Clear validation error when any field changes
    useEffect(() => {
        if (showValidationError) {
            validateForm();
        }
    }, [formData]);

    return (
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[85vh]">
            {showValidationError && Object.keys(errors).length > 0 && (
                <Alert className="mb-4 bg-destructive/15 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Please fix the validation errors before submitting the form.
                    </AlertDescription>
                </Alert>
            )}
            <div className="grid gap-6 py-4">
                {/* Grid layout with 2 columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Product Name - span 1 column */}
                    <div className="space-y-2">
                        <Label htmlFor="productName" className="flex items-center gap-1">
                            Product Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="productName"
                            name="productName"
                            value={formData.productName}
                            onChange={handleChange}
                            className={errors.productName ? "border-destructive" : ""}
                        />
                        {errors.productName && (
                            <p className="text-xs text-destructive mt-1">{errors.productName}</p>
                        )}
                    </div>

                    {/* Price - span 1 column */}
                    <div className="space-y-2">
                        <Label htmlFor="productPrice" className="flex items-center gap-1">
                            Price <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="productPrice"
                            name="productPrice"
                            type="number"
                            value={formData.productPrice}
                            onChange={handleChange}
                            className={errors.productPrice ? "border-destructive" : ""}
                        />
                        {errors.productPrice && (
                            <p className="text-xs text-destructive mt-1">{errors.productPrice}</p>
                        )}
                    </div>

                    {/* Sale Price - span 1 column */}
                    <div className="space-y-2">
                        <Label htmlFor="productPriceSale">Sale Price</Label>
                        <Input
                            id="productPriceSale"
                            name="productPriceSale"
                            type="number"
                            value={formData.productPriceSale}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Status - span 1 column */}
                    <div className="space-y-2">
                        <Label htmlFor="productStatusCode" className="flex items-center gap-1">
                            Status <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={formData.productStatusCode as string}
                            onValueChange={(value) =>
                                handleSelectChange("productStatusCode", value)
                            }
                        >
                            <SelectTrigger
                                className={errors.productStatusCode ? "border-destructive" : ""}
                            >
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(EProductStatus).map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {status.replace("_", " ")}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.productStatusCode && (
                            <p className="text-xs text-destructive mt-1">
                                {errors.productStatusCode}
                            </p>
                        )}
                    </div>

                    {/* Space - span 1 column */}
                    <div className="space-y-2">
                        <Label htmlFor="productSpaceCode" className="flex items-center gap-1">
                            Space <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={formData.productSpaceCode as string}
                            onValueChange={(value) => handleSelectChange("productSpaceCode", value)}
                        >
                            <SelectTrigger
                                className={errors.productSpaceCode ? "border-destructive" : ""}
                            >
                                <SelectValue placeholder="Select space" />
                            </SelectTrigger>
                            <SelectContent>
                                {spaceOptions.map((space) => (
                                    <SelectItem key={space.value} value={space.value}>
                                        {space.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.productSpaceCode && (
                            <p className="text-xs text-destructive mt-1">
                                {errors.productSpaceCode}
                            </p>
                        )}
                    </div>

                    {/* Series - span 1 column */}
                    <div className="space-y-2">
                        <Label htmlFor="productSeriesCode" className="flex items-center gap-1">
                            Series <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={formData.productSeriesCode as string}
                            onValueChange={(value) =>
                                handleSelectChange("productSeriesCode", value)
                            }
                        >
                            <SelectTrigger
                                className={errors.productSeriesCode ? "border-destructive" : ""}
                            >
                                <SelectValue placeholder="Select series" />
                            </SelectTrigger>
                            <SelectContent>
                                {seriesOptions.map((series) => (
                                    <SelectItem key={series.value} value={series.value}>
                                        {series.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.productSeriesCode && (
                            <p className="text-xs text-destructive mt-1">
                                {errors.productSeriesCode}
                            </p>
                        )}
                    </div>

                    {/* Color - span 1 column */}
                    <div className="space-y-2">
                        <Label htmlFor="productColorCode" className="flex items-center gap-1">
                            Color <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={formData.productColorCode as string}
                            onValueChange={(value) => handleSelectChange("productColorCode", value)}
                        >
                            <SelectTrigger
                                className={errors.productColorCode ? "border-destructive" : ""}
                            >
                                <SelectValue placeholder="Select color" />
                            </SelectTrigger>
                            <SelectContent>
                                {colorOptions.map((color) => (
                                    <SelectItem key={color.value} value={color.value}>
                                        {color.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.productColorCode && (
                            <p className="text-xs text-destructive mt-1">
                                {errors.productColorCode}
                            </p>
                        )}
                    </div>
                </div>

                {/* Short Description - span 2 columns */}
                <div className="space-y-2 col-span-full">
                    <Label htmlFor="productShortDetail" className="flex items-center gap-1">
                        Short Description <span className="text-destructive">*</span>
                    </Label>
                    <div
                        className={
                            errors.productShortDetail ? "border border-destructive rounded" : ""
                        }
                    >
                        <ClientSideCustomEditor
                            initialValue={formData.productShortDetail as string}
                            onChange={(value) => handleEditorChange("productShortDetail", value)}
                            height="200px"
                        />
                    </div>
                    {errors.productShortDetail && (
                        <p className="text-xs text-destructive mt-1">{errors.productShortDetail}</p>
                    )}
                </div>

                {/* Full Description - span 2 columns */}
                <div className="space-y-2 col-span-full">
                    <Label htmlFor="productDetail" className="flex items-center gap-1">
                        Full Description <span className="text-destructive">*</span>
                    </Label>
                    <div
                        className={errors.productDetail ? "border border-destructive rounded" : ""}
                    >
                        <ClientSideCustomEditor
                            initialValue={formData.productDetail as string}
                            onChange={(value) => handleEditorChange("productDetail", value)}
                            height="350px"
                        />
                    </div>
                    {errors.productDetail && (
                        <p className="text-xs text-destructive mt-1">{errors.productDetail}</p>
                    )}
                </div>

                {/* Product Images - span 2 columns */}
                <div className="space-y-2 col-span-full">
                    <Label htmlFor="productImages" className="flex items-center gap-1">
                        Product Images (Max 5) <span className="text-destructive">*</span>
                    </Label>
                    <div className={errors.listImage ? "border border-destructive rounded" : ""}>
                        <ProductFileUploader value={productImages} onChange={handleImagesChange} />
                    </div>
                    {errors.listImage && (
                        <p className="text-xs text-destructive mt-1">{errors.listImage}</p>
                    )}
                </div>
            </div>

            <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading ? loadingText : submitButtonText}
                </Button>
            </DialogFooter>
        </form>
    );
}
