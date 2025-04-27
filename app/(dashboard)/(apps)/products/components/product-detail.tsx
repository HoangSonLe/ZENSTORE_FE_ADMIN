"use client";

import { useState, useEffect } from "react";
import { IProduct, IProductCreateOrUpdate } from "@/apis/product/product.interface";
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
import { ECategoryType } from "@/constants/enum";
import ClientSideCustomEditor from "@/components/ui/TinyMCE/ClientSideCustomEditor";
import ProductFileUploader from "./product-file-uploader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useApi } from "@/hooks/useApi";
import { useAsyncEffect } from "@/hooks";
import categoryApi from "@/apis/category/category.api";
import productApi from "@/apis/product/product.api";
import { ISelectOption } from "@/apis/base/base.interface";
import { IApiResponse, IApiResponseTable } from "@/apis/interface";
import { ICategory } from "@/apis/category/category.interface";
import _ from "lodash";

interface FileWithPreview extends File {
    preview: string;
}

export interface ProductDetailProps {
    productId?: number;
    initialData?: IProductCreateOrUpdate;
    onClose: () => void;
    onSubmit: (productData: IProductCreateOrUpdate) => Promise<void>;
    submitButtonText: string;
    loadingText: string;
}

// CSS styles for select dropdowns are now in globals.css

export default function ProductDetail({
    productId,
    initialData = {
        productId: 0,
        productName: "",
        productPrice: "0",
        productPriceSale: "0",
        productStatusCode: "",
        productSpaceCode: "",
        productSeriesCode: "",
        productColorCode: "",
        productShortDetail: "",
        productDetail: "",
        listImage: [],
        uploadFiles: [],
        productStatusName: "",
        productSpaceName: "",
        productSeriesName: "",
        productColorName: "",
        productImage: "",
    },
    onClose,
    onSubmit,
    submitButtonText,
    loadingText,
}: ProductDetailProps) {
    const [formData, setFormData] = useState<IProductCreateOrUpdate>(initialData);
    const [productImages, setProductImages] = useState<FileWithPreview[]>([]);
    // Store the actual file objects separately from the form data
    const [actualFileObjects, setActualFileObjects] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingProduct, setIsLoadingProduct] = useState(false);
    const [isLoadingOptions, setIsLoadingOptions] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showValidationError, setShowValidationError] = useState(false);

    // State for category options
    const [seriesCodeDataOptions, setSeriesCodeDataOptions] = useState<ISelectOption[]>([]);
    const [colorCodeDataOptions, setColorCodeDataOptions] = useState<ISelectOption[]>([]);
    const [spaceCodeDataOptions, setSpaceCodeDataOptions] = useState<ISelectOption[]>([]);
    const [statusCodeDataOptions, setStatusCodeDataOptions] = useState<ISelectOption[]>([]);
    const { request: getCategoryDataOptions } = useApi(categoryApi.getCategoryDataOptions);
    const { request: getProductDetail } = useApi(productApi.getProductDetailById);

    // Load product data if productId is provided
    useAsyncEffect(async () => {
        if (productId) {
            await fetchProductData(productId);
        }
    }, [productId]);

    // Load data options from API
    useAsyncEffect(async () => {
        await getDataOptions();
    }, []);

    // Fetch product data by ID
    const fetchProductData = async (id: number) => {
        setIsLoadingProduct(true);
        try {
            await getProductDetail(
                { params: { productId: id } },
                (res: any) => {
                    const response = res as IApiResponse<IProduct>;
                    if (response.isSuccess && response.data) {
                        // Prepare data with both listImage and uploadFiles
                        const productData = {
                            ...response.data,
                            // If uploadFiles doesn't exist, use listImage as a fallback
                            uploadFiles:
                                (response.data as any).uploadFiles || response.data.listImage,
                        } as IProductCreateOrUpdate;
                        setFormData(productData);

                        // Set product images if available
                        // First check uploadFiles, then fall back to listImage
                        const uploadFiles = (response.data as any).uploadFiles;
                        const imageSource =
                            uploadFiles && uploadFiles.length > 0
                                ? uploadFiles
                                : response.data.listImage;

                        if (imageSource && imageSource.length > 0) {
                            const imageFiles = imageSource.map((url: string, index: number) => {
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
                    } else {
                        toast.error("Lỗi tải dữ liệu");
                    }
                    setIsLoadingProduct(false);
                },
                (error) => {
                    console.error("Error fetching product:", error);
                    toast.error("Lỗi tải dữ liệu");
                    setIsLoadingProduct(false);
                }
            );
        } catch (error) {
            console.error("Error fetching product:", error);
            toast.error("Lỗi tải dữ liệu");
            setIsLoadingProduct(false);
        }
    };

    const getDataOptions = async () => {
        setIsLoadingOptions(true);
        try {
            await getCategoryDataOptions(undefined, (response: any) => {
                const { data } = response as IApiResponseTable<ICategory>;

                // Map API response
                const apiOptions: ISelectOption[] = data.data
                    .filter((i) => i.categoryCode !== "ALL")
                    .map((item: ICategory) => ({
                        label: _.get(item, "categoryName"),
                        value: _.get(item, "categoryCode"),
                        type: _.get(item, "categoryType"),
                    }));

                setSeriesCodeDataOptions(
                    apiOptions.filter((item) => item.type === ECategoryType.SERIES)
                );
                setColorCodeDataOptions(
                    apiOptions.filter((item) => item.type === ECategoryType.COLOR)
                );
                setSpaceCodeDataOptions(
                    apiOptions.filter((item) => item.type === ECategoryType.SPACE)
                );
                setStatusCodeDataOptions(
                    apiOptions.filter((item) => item.type === ECategoryType.STATUS)
                );
                setIsLoadingOptions(false);
            });
        } catch (error) {
            console.error("Error fetching category data options:", error);
            setIsLoadingOptions(false);
        }
    };

    // Load images from initialData if available
    useEffect(() => {
        // First check uploadFiles, then fall back to listImage
        const uploadFiles = (initialData as any).uploadFiles;
        const imageSource =
            uploadFiles && uploadFiles.length > 0 ? uploadFiles : initialData.listImage;

        if (imageSource && imageSource.length > 0) {
            const imageFiles = imageSource.map((url: string, index: number) => {
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
    }, [initialData.listImage, (initialData as any).uploadFiles]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSelectChange = (name: string, value: string) => {
        // Create a mapping between code field names and their corresponding name field names
        const nameFieldMapping: Record<string, string> = {
            productStatusCode: "productStatusName",
            productSpaceCode: "productSpaceName",
            productSeriesCode: "productSeriesName",
            productColorCode: "productColorName",
        };

        // Create a mapping between code field names and their corresponding option arrays
        const optionsMapping: Record<string, ISelectOption[]> = {
            productStatusCode: statusCodeDataOptions,
            productSpaceCode: spaceCodeDataOptions,
            productSeriesCode: seriesCodeDataOptions,
            productColorCode: colorCodeDataOptions,
        };

        // Find the corresponding name field for the code field
        const nameField = nameFieldMapping[name];

        // Find the selected option to get its label (name)
        const options = optionsMapping[name] || [];
        const selectedOption = options.find((option) => option.value === value);
        const label = selectedOption?.label || "";

        // Update both the code and name fields in the form data
        setFormData((prev) => ({
            ...prev,
            [name]: value,
            ...(nameField ? { [nameField]: label } : {}),
        }));
    };

    // Handle editor content changes - using uncontrolled editor
    const handleEditorChange = (name: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImagesChange = (files: FileWithPreview[]) => {
        setProductImages(files);

        // Extract actual File objects from FileWithPreview objects
        // Only consider files that are actual File instances (new uploads)
        const actualFiles = files.filter((file) => file instanceof File);
        setActualFileObjects(actualFiles as File[]);

        // Extract preview URLs for display purposes
        const imageUrls = files.map((file) => file.preview);

        // Separate existing image URLs from blob URLs
        // Blob URLs start with "blob:" and are temporary URLs for new file uploads
        const existingImageUrls = imageUrls.filter((url) => !url.startsWith("blob:"));

        console.log("Files changed:", {
            totalFiles: files.length,
            actualFileObjects: actualFiles.length,
            existingUrls: existingImageUrls.length,
            allUrls: imageUrls,
        });

        // For the form data, we'll keep the URLs for display purposes
        // The actual base64 conversion will happen during form submission
        setFormData((prev) => ({
            ...prev,
            // Store all URLs for display purposes
            uploadFiles: imageUrls,
            // Store only existing URLs in listImage
            listImage: existingImageUrls,
        }));
    };

    // Validate form data
    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        // Required fields validation
        if (!formData.productName?.trim()) {
            newErrors.productName = "Vui lòng nhập tên sản phẩm";
        }

        if (
            formData.productPrice === undefined ||
            formData.productPrice === "" ||
            Number(formData.productPrice) < 0
        ) {
            newErrors.productPrice = "Giá không được để trống";
        }

        if (!formData.productStatusCode) {
            newErrors.productStatusCode = "Vui lòng chọn trạng thái";
        }

        if (!formData.productSpaceCode) {
            newErrors.productSpaceCode = "Vui lòng chọn dung lượng lưu trữ";
        }

        if (!formData.productSeriesCode) {
            newErrors.productSeriesCode = "Vui lòng chọn series";
        }

        if (!formData.productColorCode) {
            newErrors.productColorCode = "Vui lòng chọn màu";
        }

        if (!formData.productShortDetail?.trim()) {
            newErrors.productShortDetail = "Vui lòng nhập mô tả sản phẩm";
        }

        if (!formData.productDetail?.trim()) {
            newErrors.productDetail = "Vui lòng nhập mô tả chi tiết sản phẩm";
        }

        // Validate product images
        if (
            (!formData.uploadFiles || formData.uploadFiles.length === 0) &&
            (!formData.listImage || formData.listImage.length === 0)
        ) {
            newErrors.uploadFiles = "Yêu cầu ít nhất 1 ảnh";
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
            // For files, we need to convert them to base64 strings for JSON submission
            if (actualFileObjects.length > 0) {
                console.log("Processing files for JSON submission:", actualFileObjects);

                // Create an array to store the promises for file conversion
                const fileConversionPromises = actualFileObjects.map(
                    (file) =>
                        new Promise<string>((resolve, reject) => {
                            try {
                                // Create a new FileReader to convert the file to base64
                                const reader = new FileReader();

                                // Set up the onload handler
                                reader.onloadend = () => {
                                    try {
                                        // The result is a base64 string representation of the file
                                        // Format: data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBD...
                                        const base64String = reader.result as string;

                                        // Extract just the base64 part without the data:image/jpeg;base64, prefix
                                        const base64Data = base64String.split(",")[1];

                                        console.log(
                                            `Converted file ${file.name} to base64 (${base64Data.length} chars)`
                                        );

                                        // Resolve the promise with the base64 data
                                        resolve(base64Data);
                                    } catch (error) {
                                        console.error("Error processing base64 result:", error);
                                        reject(error);
                                    }
                                };

                                // Set up error handler
                                reader.onerror = (error) => {
                                    console.error("Error reading file:", error);
                                    reject(error);
                                };

                                // Start reading the file as a data URL (base64)
                                reader.readAsDataURL(file);
                            } catch (error) {
                                console.error("Error setting up file reader:", error);
                                reject(error);
                            }
                        })
                );

                // Wait for all files to be converted to base64
                const base64Files = await Promise.all(fileConversionPromises);

                // Create a product object that matches the IProductCreateOrUpdate interface
                const updatedProductData: IProductCreateOrUpdate = {
                    ...formData,
                    // Set the uploadFiles property to the base64 encoded files for new uploads
                    uploadFiles: base64Files,
                    // Keep the listImage property for existing images
                    // The API will use uploadFiles for new images and listImage for existing ones
                };

                console.log("Submitting JSON data with base64 encoded files", {
                    productId: updatedProductData.productId,
                    productName: updatedProductData.productName,
                    uploadFilesCount: updatedProductData.uploadFiles.length,
                    listImageCount: updatedProductData.listImage?.length || 0,
                    // Show a sample of the first base64 string (first 50 chars)
                    uploadFilesSample:
                        updatedProductData.uploadFiles.length > 0
                            ? updatedProductData.uploadFiles[0].substring(0, 50) + "..."
                            : "none",
                });

                // Submit the updated product data
                await onSubmit(updatedProductData);
            } else {
                // No new files to upload, but we might have existing images
                console.log("Submitting JSON data without new files");

                // When there are no new files, we just submit the form data with existing image URLs
                console.log("Submitting product with existing images:", formData.uploadFiles);

                // Create a product object that matches the IProductCreateOrUpdate interface
                const updatedProductData: IProductCreateOrUpdate = {
                    ...formData,
                    // For existing images, we keep them in the listImage property
                    // and set uploadFiles to an empty array since we have no new uploads
                    uploadFiles: [],
                    // Keep the existing image URLs in the listImage property
                    listImage: formData.listImage || formData.uploadFiles || [],
                };

                console.log("Submitting product with existing images", {
                    productId: updatedProductData.productId,
                    productName: updatedProductData.productName,
                    uploadFilesCount: updatedProductData.uploadFiles.length,
                    listImageCount: updatedProductData.listImage?.length || 0,
                    listImageSample:
                        updatedProductData.listImage?.length > 0
                            ? updatedProductData.listImage[0].substring(0, 50) + "..."
                            : "none",
                });

                // Submit the product data with existing images
                await onSubmit(updatedProductData);
            }

            onClose();
        } catch (error) {
            console.error("Error submitting product:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Data for dropdowns is now fetched from the API via getDataOptions

    // Clear validation error when any field changes
    useEffect(() => {
        if (showValidationError) {
            validateForm();
        }
    }, [formData]);

    return (
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[85vh]">
            {isLoadingProduct && (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Đang tải dữ liệu sản phẩm...</span>
                </div>
            )}

            {showValidationError && Object.keys(errors).length > 0 && (
                <Alert className="mb-4 bg-destructive/15 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Vui lòng điều đủ dữ liệu trước khi lưu.</AlertDescription>
                </Alert>
            )}
            {!isLoadingProduct && (
                <div className="grid gap-6 py-4">
                    {/* Grid layout with 2 columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Tên sản phẩm - span 1 column */}
                        <div className="space-y-2">
                            <Label htmlFor="productName" className="flex items-center gap-1">
                                Tên sản phẩm <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="productName"
                                name="productName"
                                value={formData.productName}
                                onChange={handleChange}
                                className={errors.productName ? "border-destructive" : ""}
                            />
                            {errors.productName && (
                                <p className="text-xs text-destructive mt-1">
                                    {errors.productName}
                                </p>
                            )}
                        </div>

                        {/* Price - span 1 column */}
                        <div className="space-y-2">
                            <Label htmlFor="productPrice" className="flex items-center gap-1">
                                Giá <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="productPrice"
                                name="productPrice"
                                type="text"
                                value={formData.productPrice}
                                onChange={handleChange}
                                className={errors.productPrice ? "border-destructive" : ""}
                            />
                            {errors.productPrice && (
                                <p className="text-xs text-destructive mt-1">
                                    {errors.productPrice}
                                </p>
                            )}
                        </div>

                        {/* Sale Price - span 1 column */}
                        <div className="space-y-2">
                            <Label htmlFor="productPriceSale">Giá khuyến mãi</Label>
                            <Input
                                id="productPriceSale"
                                name="productPriceSale"
                                type="text"
                                value={formData.productPriceSale}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Trạng thái - span 1 column */}
                        <div className="space-y-2">
                            <Label htmlFor="productStatusCode" className="flex items-center gap-1">
                                Trạng thái <span className="text-destructive">*</span>
                            </Label>
                            <div className="select-dropdown-fix">
                                <Select
                                    value={formData.productStatusCode as string}
                                    onValueChange={(value) =>
                                        handleSelectChange("productStatusCode", value)
                                    }
                                >
                                    <SelectTrigger
                                        className={
                                            errors.productStatusCode ? "border-destructive" : ""
                                        }
                                        disabled={isLoadingOptions}
                                    >
                                        <SelectValue
                                            placeholder={
                                                isLoadingOptions ? "Đang tải..." : "Chọn trạng thái"
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent position="popper" sideOffset={5}>
                                        {statusCodeDataOptions &&
                                        statusCodeDataOptions.length > 0 ? (
                                            statusCodeDataOptions.map((status) => (
                                                <SelectItem key={status.value} value={status.value}>
                                                    {status.label}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="loading">Đang tải....</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            {errors.productStatusCode && (
                                <p className="text-xs text-destructive mt-1">
                                    {errors.productStatusCode}
                                </p>
                            )}
                        </div>

                        {/* Space - span 1 column */}
                        <div className="space-y-2">
                            <Label htmlFor="productSpaceCode" className="flex items-center gap-1">
                                Dung lượng lưu trữ <span className="text-destructive">*</span>
                            </Label>
                            <div className="select-dropdown-fix">
                                <Select
                                    value={formData.productSpaceCode as string}
                                    onValueChange={(value) =>
                                        handleSelectChange("productSpaceCode", value)
                                    }
                                >
                                    <SelectTrigger
                                        className={
                                            errors.productSpaceCode ? "border-destructive" : ""
                                        }
                                        disabled={isLoadingOptions}
                                    >
                                        <SelectValue
                                            placeholder={
                                                isLoadingOptions ? "Đang tải..." : "Chọn dung lượng"
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent position="popper" sideOffset={5}>
                                        {spaceCodeDataOptions && spaceCodeDataOptions.length > 0 ? (
                                            spaceCodeDataOptions.map((space) => (
                                                <SelectItem key={space.value} value={space.value}>
                                                    {space.label}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="loading">Đang tải...</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
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
                            <div className="select-dropdown-fix">
                                <Select
                                    value={formData.productSeriesCode as string}
                                    onValueChange={(value) =>
                                        handleSelectChange("productSeriesCode", value)
                                    }
                                >
                                    <SelectTrigger
                                        className={
                                            errors.productSeriesCode ? "border-destructive" : ""
                                        }
                                        disabled={isLoadingOptions}
                                    >
                                        <SelectValue
                                            placeholder={
                                                isLoadingOptions ? "Đang tải..." : "Chọn series"
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent position="popper" sideOffset={5}>
                                        {seriesCodeDataOptions &&
                                        seriesCodeDataOptions.length > 0 ? (
                                            seriesCodeDataOptions.map((series) => (
                                                <SelectItem key={series.value} value={series.value}>
                                                    {series.label}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="loading">Đang tải...</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            {errors.productSeriesCode && (
                                <p className="text-xs text-destructive mt-1">
                                    {errors.productSeriesCode}
                                </p>
                            )}
                        </div>

                        {/* Color - span 1 column */}
                        <div className="space-y-2">
                            <Label htmlFor="productColorCode" className="flex items-center gap-1">
                                Màu <span className="text-destructive">*</span>
                            </Label>
                            <div className="select-dropdown-fix">
                                <Select
                                    value={formData.productColorCode as string}
                                    onValueChange={(value) =>
                                        handleSelectChange("productColorCode", value)
                                    }
                                >
                                    <SelectTrigger
                                        className={
                                            errors.productColorCode ? "border-destructive" : ""
                                        }
                                        disabled={isLoadingOptions}
                                    >
                                        <SelectValue
                                            placeholder={
                                                isLoadingOptions ? "Đang tải..." : "Chọn màu"
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent position="popper" sideOffset={5}>
                                        {colorCodeDataOptions && colorCodeDataOptions.length > 0 ? (
                                            colorCodeDataOptions.map((color) => (
                                                <SelectItem key={color.value} value={color.value}>
                                                    {color.label}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="loading">Đang tải...</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
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
                            Mô tả <span className="text-destructive">*</span>
                        </Label>
                        <div
                            className={
                                errors.productShortDetail ? "border border-destructive rounded" : ""
                            }
                        >
                            <ClientSideCustomEditor
                                initialValue={formData.productShortDetail as string}
                                value={formData.productShortDetail as string}
                                onChange={(value) =>
                                    handleEditorChange("productShortDetail", value)
                                }
                                height="200px"
                            />
                        </div>
                        {errors.productShortDetail && (
                            <p className="text-xs text-destructive mt-1">
                                {errors.productShortDetail}
                            </p>
                        )}
                    </div>

                    {/* Full Description - span 2 columns */}
                    <div className="space-y-2 col-span-full">
                        <Label htmlFor="productDetail" className="flex items-center gap-1">
                            Mô tả chi tiết <span className="text-destructive">*</span>
                        </Label>
                        <div
                            className={
                                errors.productDetail ? "border border-destructive rounded" : ""
                            }
                        >
                            <ClientSideCustomEditor
                                initialValue={formData.productDetail as string}
                                value={formData.productDetail as string}
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
                            Ảnh sản phẩm (Tối đa 5 ảnh) <span className="text-destructive">*</span>
                        </Label>
                        <div
                            className={
                                errors.uploadFiles ? "border border-destructive rounded" : ""
                            }
                        >
                            <ProductFileUploader
                                value={productImages}
                                onChange={handleImagesChange}
                            />
                        </div>
                        {errors.uploadFiles && (
                            <p className="text-xs text-destructive mt-1">{errors.uploadFiles}</p>
                        )}
                    </div>
                </div>
            )}

            {!isLoadingProduct && (
                <DialogFooter className="mt-6">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Hủy
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isLoading ? loadingText : submitButtonText}
                    </Button>
                </DialogFooter>
            )}
        </form>
    );
}
