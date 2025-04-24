"use client";

import { useState, useEffect } from "react";
import { IProduct } from "@/apis/product/product.interface";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
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
import CKEditor from "@/components/ui/CKEditor/CKEditor";
import ProductFileUploader from "./product-file-uploader";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProductCreateFormProps {
    onClose: () => void;
    onCreate?: (newProduct: Partial<IProduct>) => Promise<void>;
}

interface FileWithPreview extends File {
    preview: string;
}

export default function ProductCreateForm({ onClose, onCreate }: ProductCreateFormProps) {
    const [formData, setFormData] = useState<Partial<IProduct>>({
        productName: "",
        productPrice: 0,
        productPriceSale: 0,
        productStatusCode: "",
        spaceCode: "",
        seriesCode: "",
        colorCode: "",
        productShortDetail: "",
        productDetail: "",
    });
    const [productImages, setProductImages] = useState<FileWithPreview[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showValidationError, setShowValidationError] = useState(false);

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

        if (!formData.spaceCode) {
            newErrors.spaceCode = "Space is required";
        }

        if (!formData.seriesCode) {
            newErrors.seriesCode = "Series is required";
        }

        if (!formData.colorCode) {
            newErrors.colorCode = "Color is required";
        }

        if (!formData.productShortDetail?.trim()) {
            newErrors.productShortDetail = "Short description is required";
        }

        if (!formData.productDetail?.trim()) {
            newErrors.productDetail = "Full description is required";
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
            if (onCreate) {
                await onCreate(formData);
            }
            toast.success("Product created successfully");
            onClose();
        } catch (error) {
            console.error("Error creating product:", error);
            toast.error("Failed to create product");
        } finally {
            setIsLoading(false);
        }
    };

    // Mock data for dropdowns
    const spaceOptions = ["SPACE_1", "SPACE_2", "SPACE_3"].map((space) => ({
        label: space.replace("_", " "),
        value: space,
    }));

    const seriesOptions = ["SERIES_1", "SERIES_2", "SERIES_3"].map((series) => ({
        label: series.replace("_", " "),
        value: series,
    }));

    const colorOptions = ["COLOR_RED", "COLOR_BLUE", "COLOR_GREEN"].map((color) => ({
        label: color.replace("COLOR_", ""),
        value: color,
    }));

    // Clear validation error when any field changes
    useEffect(() => {
        if (showValidationError) {
            validateForm();
        }
    }, [formData]);

    return (
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[85vh]">
            {showValidationError && Object.keys(errors).length > 0 && (
                <Alert variant="destructive" className="mb-4">
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
                        <Label htmlFor="spaceCode" className="flex items-center gap-1">
                            Space <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={formData.spaceCode as string}
                            onValueChange={(value) => handleSelectChange("spaceCode", value)}
                        >
                            <SelectTrigger className={errors.spaceCode ? "border-destructive" : ""}>
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
                        {errors.spaceCode && (
                            <p className="text-xs text-destructive mt-1">{errors.spaceCode}</p>
                        )}
                    </div>

                    {/* Series - span 1 column */}
                    <div className="space-y-2">
                        <Label htmlFor="seriesCode" className="flex items-center gap-1">
                            Series <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={formData.seriesCode as string}
                            onValueChange={(value) => handleSelectChange("seriesCode", value)}
                        >
                            <SelectTrigger
                                className={errors.seriesCode ? "border-destructive" : ""}
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
                        {errors.seriesCode && (
                            <p className="text-xs text-destructive mt-1">{errors.seriesCode}</p>
                        )}
                    </div>

                    {/* Color - span 1 column */}
                    <div className="space-y-2">
                        <Label htmlFor="colorCode" className="flex items-center gap-1">
                            Color <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={formData.colorCode as string}
                            onValueChange={(value) => handleSelectChange("colorCode", value)}
                        >
                            <SelectTrigger className={errors.colorCode ? "border-destructive" : ""}>
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
                        {errors.colorCode && (
                            <p className="text-xs text-destructive mt-1">{errors.colorCode}</p>
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
                        <CKEditor
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
                        <CKEditor
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
                    <Label htmlFor="productImages">Product Images (Max 5)</Label>
                    <ProductFileUploader value={productImages} onChange={handleImagesChange} />
                </div>
            </div>

            <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading ? "Creating..." : "Create Product"}
                </Button>
            </DialogFooter>
        </form>
    );
}
